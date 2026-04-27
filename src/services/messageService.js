import api from "./api";

/**
 * SERVIÇO: messageService
 * DESCRIÇÃO: Gere a comunicação de mensagens de chat com o Backend.
 */
const messageService = {
    /**
     * Envia uma nova mensagem para o servidor.
     * @param {Object} payload { receiver, content }
     */
    sendMessage: async (payload) => {
        return await api("/messages", "POST", payload);
    },

    /**
     * Recupera o histórico de mensagens do utilizador.
     */
    getHistory: async () => {
        return await api("/messages", "GET");
    },

    /**
     * Marca as mensagens de um remetente como lidas.
     */
    markAsRead: async (senderUsername) => {
        return await api(`/messages/read/${senderUsername}`, "PATCH");
    }
};

export default messageService;
