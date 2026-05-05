import api from './api';

/**
 * SERVIÇO: leadService
 * Gere a comunicação com os endpoints da API para a entidade Lead.
 * Inclui suporte para CRUD, transições de estado, filtragem administrativa e gestão de lixeira.
 */
export const leadService = {

  /**
   * Consulta leads com base no perfil e filtros aplicados.
   * Suporta filtragem por estado, proprietário, lixeira, pesquisa e paginação.
   */
  getLeads: async (role, filters = {}) => {
    const isAdmin = role === "ADMIN";
    const endpoint = isAdmin ? "/leads/admin" : "/leads";

    const params = new URLSearchParams();
    
    // Filtros de estado e lixeira
    if (filters.state) params.append("state", filters.state);

    if (filters.softDeleted !== undefined) {
      params.append("softDeleted", filters.softDeleted);
    }

    // Filtro de atribuição (exclusivo para perfil administrativo)
    if (isAdmin && filters.userId) {
      params.append("userId", filters.userId);
    }

    // Parâmetros de paginação e termo de pesquisa
    if (filters.search) params.append("search", filters.search);
    params.append("page", filters.page || 1);
    params.append("size", filters.size || 20);

    const queryString = params.toString();
    const finalUrl = `${endpoint}?${queryString}`;

    return await api(finalUrl);
  },

  /**
   * Cria uma nova lead. Permite delegação de proprietário caso o utilizador seja Admin.
   */
  createLead: async (leadData, role, targetUserId = null) => {
    if (role === "ADMIN" && targetUserId) {
      // Endpoint especializado para delegação de leads por parte do Administrador.
      return await api(`/leads/admin/${targetUserId}`, "POST", leadData);
    }
    return await api("/leads", "POST", leadData);
  },

  /**
   * Atualiza os dados de uma lead existente.
   */
  updateLead: async (id, leadData, role) => {
    const endpoint = role === "ADMIN" ? `/leads/admin/${id}` : `/leads/${id}`;
    return await api(endpoint, "PUT", leadData);
  },

  /**
   * Remove uma lead do sistema. Suporta eliminação lógica ou definitiva.
   */
  deleteLead: async (id, role, permanent = false) => {
    // REGRA A14: Apenas Admin pode realizar o Hard Delete definitivo da base de dados PostgreSQL.
    if (role === "ADMIN" && permanent) {
      return await api(`/leads/admin/${id}`, "DELETE");
    }
    // REGRA A9: Soft Delete padrão enviando o pedido para a rota protegida de eliminação lógica.
    return await api(`/leads/${id}`, "DELETE");
  },

  /**
   * Métodos para recuperação ou marcação individual para eliminação lógica.
   */
  softDeleteLead: async (leadId) => {
    const payload = { softDeleted: true };
    // O Java ignora campos nulos, atualizando apenas a flag de desativação.
    return await api(`/leads/admin/${leadId}`, "PUT", payload);
  },

  restoreLead: async (leadId) => {
    const payload = { softDeleted: false };
    return await api(`/leads/admin/${leadId}`, "PUT", payload);
  },

  /**
   * Executa operações em massa (bulk actions) para leads de um utilizador específico.
   */
  softDeleteAllFromUser: async (userId) => {
    return await api(`/leads/admin/${userId}/softdeleteall`, "POST");
  },

  restoreAllFromUser: async (userId) => {
    return await api(`/leads/admin/${userId}/softundeleteall`, "POST");
  },

  emptyTrashByUserId: async (userId) => {
    return await api(`/leads/admin/${userId}/trash`, "DELETE");
  }
};