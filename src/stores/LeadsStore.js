import { create } from "zustand";
import { leadService } from "../services/leadService";

/**
 * STORE: useLeadStore (Zustand)
 * ----------------------------
 * DESCRIÇÃO: Gere o estado global das Leads (Oportunidades).
 * FUNCIONALIDADE: Centraliza a listagem do Kanban, o processamento de datas,
 * as transições de estado e as operações administrativas de lixeira.
 */
export const useLeadStore = create((set, get) => ({
  leads: [],
  loading: false,
  error: null,
  viewingUserName: "",

  _processLeads: (data) => data.map((lead) => {
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
          // PADRÃO ISO8601 (YYYY-MM-DD)
          finalDate = tempDate.toISOString().split('T')[0];
        }
      }
    }

    return {
      ...lead,
      state: lead.state ? parseInt(lead.state, 10) : 1,
      formattedDate: finalDate
    };
  }),

  /** * ACÇÃO: fetchMyLeads
   * Procura as leads na API e aplica a transformação de dados antes de guardar no estado.
   */
  fetchMyLeads: async (userRole, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await leadService.getLeads(userRole, filters);
      const processed = get()._processLeads(data);
      set({
        leads: processed,
        loading: false,
        viewingUserName: processed.length > 0 ? processed[0].name : "",
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  /** * GESTÃO DE CICLO DE VIDA:
   * Adiciona e edita leads, atualizando o estado local imediatamente (Optimistic UI)
   * para uma experiência de utilizador mais fluida.
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
      // 1. Criamos um payload "limpo", enviando APENAS o que o LeadDTO do Java conhece
      // Ignoramos campos visuais como o 'formattedDate'
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

  /** * ACÇÕES EM MASSA (BULK OPERATIONS):
   * Orquestra a limpeza ou restauro de grandes volumes de leads para um utilizador.
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
      // REFETCH (CONSISTÊNCIA): Após uma ação em massa, a store obriga a
      // uma nova leitura da base de dados para garantir integridade total.
      await get().fetchMyLeads(currentUserRole, currentFilters);

      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // AUXILIARES: Métodos de conveniência para componentes de UI
  getLeadsByState: (stateId) => get().leads.filter((l) => l.state === stateId),
}));
