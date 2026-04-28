import { create } from "zustand";
import { clientsService } from "../services/clientsService";

/**
 * STORE: useClientStore (Zustand)
 * ------------------------------
 * DESCRIÇÃO: Gere o estado global dos clientes em toda a aplicação.
 * FUNCIONALIDADE: Centraliza dados, estados de carregamento (loading) e erros,
 * permitindo que as atualizações na base de dados sejam refletidas na UI instantaneamente.
 */
export const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  // PERSISTÊNCIA DE CONTEXTO :
  // Guardamos o role e os filtros atuais para permitir 'refetch' automáticos
  // após ações de CRUD, mantendo a lista sempre atualizada com os critérios certos.
  _currentUserRole: null,
  _currentFilters: {},

  /** * ACÇÃO: fetchClients
   * Procura os clientes no Backend Java baseando-se no Role e Filtros.
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
        showTrash: !!filters.showTrash, // Converte para booleano explícito
      };
      const data = await clientsService.getClients(userRole, apiFilters);
      set({ clients: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /** * MÉTODO INTERNO: _refetch
   * Atalho para atualizar a lista usando os últimos filtros guardados.
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
        newClient = await clientsService.createClientForUser(targetUserId, clientData);
      } else {
        newClient = await clientsService.createClient(clientData);
      }
      
      set((state) => ({
        clients: [newClient, ...state.clients],
        loading: false
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
        loading: false
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
        loading: false
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
        loading: false
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