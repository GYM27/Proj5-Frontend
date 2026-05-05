import api from "./api";

/**
 * SERVIÇO: clientsService
 * Gere a comunicação com os endpoints da API para a entidade Client.
 * Suporta filtragem avançada, gestão de lixeira e operações administrativas.
 */
export const clientsService = {

  /**
   * Recupera a lista de clientes com base no perfil do utilizador e filtros.
   * Gerencia a lógica de roteamento entre clientes ativos e lixeira.
   */
  getClients: async (userRole, filters = {}) => {
    const { userId, showTrash, search, page = 1, size = 10 } = filters;
    
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page);
    params.append("size", size);
 
    // Gestão de visualização da lixeira (Eliminação Lógica)
    if (showTrash) {
      if (userRole === "ADMIN") {
        const url = userId 
          ? `/clients/user/${userId}/trash?${params.toString()}` 
          : `/clients/trash?${params.toString()}`;
        return await api(url, "GET");
      } else {
        return await api(`/clients/me-trash?${params.toString()}`, "GET");
      }
    }

    // Gestão de clientes ativos (com suporte a filtro de responsável para Admin)
    if (userRole === "ADMIN" && userId) {
      params.append("userId", userId);
    }
 
    return await api(`/clients?${params.toString()}`, "GET");
  },

  /**
   * Operações de criação e atualização de clientes.
   */

  // Registo de novo cliente pelo próprio utilizador
  createClient: async (clientDto) => {
    return await api("/clients", "POST", clientDto);
  },

  // Criação de cliente atribuído a outrem (Exclusivo Admin)
  createClientForUser: async (userId, clientDto) => {
    return await api(`/clients/user/${userId}`, "POST", clientDto);
  },

  // Atualização de dados (Mapeia para @PUT /clients/{id})
  updateClient: async (id, clientDto) => {
    return await api(`/clients/${id}`, "PUT", clientDto);
  },

  /**
   * Gestão do ciclo de vida e estados de eliminação.
   */

  // Soft Delete: Marca o cliente como 'deleted' sem o remover da base de dados.
  softDeleteClient: async (id) => {
    return await api(`/clients/${id}`, "DELETE");
  },

  // Restaurar: Reverte o Soft Delete (Mapeia para @PATCH no Java conforme as boas práticas REST).
  restoreClient: async (id) => {
    return await api(`/clients/${id}/restore`, "PATCH");
  },

  // Hard Delete: Remoção definitiva do registo no PostgreSQL (Restrito a Admin).
  permanentDeleteClient: async (id) => {
    return await api(`/clients/${id}/permanent`, "DELETE");
  },

  /**
   * Operações administrativas em massa (Bulk Actions).
   */

  // Desativa todos os clientes de um utilizador específico de uma só vez.
  softDeleteAllFromUser: async (userId) => {
    return await api(`/clients/user/${userId}/status/deactivate-all`, "PATCH");
  },

  // Restaura todos os clientes eliminados de um utilizador.
  restoreAllFromUser: async (userId) => {
    return await api(`/clients/user/${userId}/status/activate-all`, "PATCH");
  },

  // Limpa definitivamente a lixeira de um colaborador.
  emptyTrashByUserId: async (userId) => {
    return await api(`/clients/user/${userId}/trash`, "DELETE");
  },

  // Consulta administrativa da lixeira de todo o CRM.
  getAllTrash: async () => {
    return await api("/clients/trash", "GET");
  }
};