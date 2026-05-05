import { create } from "zustand";
import { clientsService } from "../services/clientsService";

/**
 * STORE: useClientStore (Zustand)
 * Gere o estado global da carteira de clientes, incluindo paginação e metadados.
 */
export const useClientStore = create((set, get) => ({
  clients: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  loading: false,
  error: null,

  // PERSISTÊNCIA DE CONTEXTO :
  _currentUserRole: null,
  _currentFilters: {},

  /**
   * Procura clientes na API aplicando filtros, pesquisa e paginação.
   */
  fetchClients: async (userRole, filters = {}) => {
    set({
      loading: true,
      error: null,
      _currentUserRole: userRole,
      _currentFilters: filters,
    });
    try {
      const apiFilters = {
        userId: filters.userId || null,
        showTrash: !!filters.showTrash,
        search: filters.search || "",
        page: filters.page || 1,
        size: filters.size || 10,
      };

      const response = await clientsService.getClients(userRole, apiFilters);

      // Sincroniza o estado com a resposta paginada do backend
      set({
        clients: response.items || [],
        totalPages: response.totalPages || 1,
        totalItems: response.totalItems || 0,
        currentPage: response.currentPage || 1,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Recarrega a lista de clientes mantendo os filtros e contexto atuais.
   */
  _refetch: async () => {
    const { _currentUserRole, _currentFilters, fetchClients } = get();
    await fetchClients(_currentUserRole, _currentFilters);
  },

  // --- GESTÃO DE CRIAÇÃO E ATUALIZAÇÃO ---

  addClient: async (clientData, targetUserId = null) => {
    set({ loading: true, error: null });
    try {
      let newClient;
      if (targetUserId) {
        newClient = await clientsService.createClientForUser(
          targetUserId,
          clientData,
        );
      } else {
        newClient = await clientsService.createClient(clientData);
      }

      set((state) => ({
        clients: [newClient, ...state.clients],
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  updateClient: async (id, clientDto) => {
    set({ loading: true });
    try {
      const updatedClient = await clientsService.updateClient(id, clientDto);

      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? updatedClient : c)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // --- CICLO DE VIDA (REGRAS A9 e A14) ---

  deleteClient: async (id, isPermanent = false) => {
    set({ loading: true });
    try {
      if (isPermanent) {
        await clientsService.permanentDeleteClient(id);
      } else {
        await clientsService.softDeleteClient(id);
      }

      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  restoreClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await clientsService.restoreClient(id);

      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  handleBulkAction: async (
    userId,
    actionType,
    currentUserRole,
    currentFilters,
  ) => {
    if (!userId) return false;
    set({ loading: true });

    try {
      switch (actionType) {
        case "RESTORE_ALL":
          await clientsService.restoreAllFromUser(userId);
          break;
        case "DEACTIVATE_ALL":
          await clientsService.softDeleteAllFromUser(userId);
          break;
        case "EMPTY_TRASH":
          await clientsService.emptyTrashByUserId(userId);
          break;
        default:
          break;
      }

      set({ clients: [], loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },
}));
