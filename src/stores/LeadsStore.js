import { create } from "zustand";
import { leadService } from "../services/leadService";

/**
 * STORE: useLeadStore (Zustand)
 * Gere o estado global das leads, incluindo o quadro Kanban e paginação incremental.
 */
export const useLeadStore = create((set, get) => ({
  leads: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  loading: false,
  error: null,
  viewingUserName: "",

  _processLeads: (data) =>
    data.map((lead) => {
      let finalDate = "Sem data";

      if (lead.date) {
        let tempDate;
        if (Array.isArray(lead.date)) {
          const [year, month, day] = lead.date;
          tempDate = new Date(year, month - 1, day);
        } else {
          tempDate = new Date(lead.date);
        }

        if (!isNaN(tempDate.getTime())) {
          const today = new Date();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          if (tempDate.toDateString() === today.toDateString()) {
            finalDate = "Hoje";
          } else if (tempDate.toDateString() === yesterday.toDateString()) {
            finalDate = "Ontem";
          } else {
            finalDate = tempDate.toISOString().split("T")[0];
          }
        }
      }

      return {
        ...lead,
        state: lead.state ? parseInt(lead.state, 10) : 1,
        formattedDate: finalDate,
      };
    }),

  /**
   * Procura as leads do utilizador autenticado aplicando filtros iniciais.
   */
  fetchMyLeads: async (userRole, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await leadService.getLeads(userRole, filters);
      
      // O response agora vem do PaginatedResponseDTO { items, totalPages, totalItems, ... }
      const processed = get()._processLeads(response.items || []);
      
      set({
        leads: processed,
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalItems: response.totalItems || 0,
        loading: false,
        viewingUserName: processed.length > 0 ? processed[0].name : "",
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Carrega a página seguinte de leads e anexa-as ao estado atual (infinite loading).
   */
  loadMoreLeads: async (userRole, filters = {}) => {
    const { currentPage, totalPages, leads } = get();
    if (currentPage >= totalPages) return;

    set({ loading: true });
    try {
      const nextPage = currentPage + 1;
      const response = await leadService.getLeads(userRole, { ...filters, page: nextPage });
      const processed = get()._processLeads(response.items || []);
      
      set({
        leads: [...leads, ...processed],
        currentPage: nextPage,
        totalPages: response.totalPages || 1,
        totalItems: response.totalItems || 0,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Adiciona ou edita leads com atualização imediata do estado local (Optimistic UI).
   */
  addLead: async (leadDto, userRole, targetUserId = null) => {
    set({ loading: true, error: null });
    try {
      const newLead = await leadService.createLead(
        leadDto,
        userRole,
        targetUserId,
      );
      const processed = get()._processLeads([newLead])[0];

      set((state) => ({
        leads: [processed, ...state.leads], // Adiciona ao topo da lista
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  updateLead: async (id, leadDto, userRole) => {
    set({ loading: true });
    try {
      const updatedLead = await leadService.updateLead(id, leadDto, userRole);
      const processed = get()._processLeads([updatedLead])[0];

      set((state) => ({
        leads: state.leads.map((l) => (l.id === id ? processed : l)),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  /** * SEGURANÇA E LIXEIRA */

  deleteLead: async (id, userRole, permanent = false) => {
    // PROTEÇÃO ADICIONAL: Garante que o Hard Delete só é tentado se o Role for ADMIN.
    const isActuallyPermanent = userRole === "ADMIN" && permanent;

    try {
      await leadService.deleteLead(id, userRole, isActuallyPermanent);
      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
      }));
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  restoreLead: async (id, leadData) => {
    set({ loading: true });
    try {
      // Limpeza do payload para garantir compatibilidade com o DTO do backend
      const cleanPayload = {
        id: leadData.id,
        title: leadData.title,
        description: leadData.description,
        state: leadData.state,
        softDeleted: false, // Corrigido para coincidir exatamente com o backend
      };

      // 2. Enviamos o pacote limpo para a API
      await leadService.updateLead(id, cleanPayload, "ADMIN");

      set((state) => ({
        leads: state.leads.filter((l) => l.id !== id),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  /**
   * Manages administrative bulk operations for a specific user.
   */
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
          await leadService.restoreAllFromUser(userId);
          break;
        case "SOFT_DELETE_ALL":
          await leadService.softDeleteAllFromUser(userId);
          break;
        case "EMPTY_TRASH":
          await leadService.emptyTrashByUserId(userId);
          break;
        default:
          set({ loading: false });
          return false;
      }
      // Limpeza local do estado após execução bem-sucedida no backend
      set((state) => ({
        leads: [],
        loading: false
      }));

      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // AUXILIARES: Métodos de conveniência para componentes de UI
  getLeadsByState: (stateId) => get().leads.filter((l) => l.state === stateId),
}));
