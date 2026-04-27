import api from './api';

/**
 */
export const userService = {

    // Para o Admin enviar o convite
    inviteUser: async (emailData) => {
        return await api("/users/invite", "POST", emailData);
    },

    // Para o utilizador concluir o registo (usado na nova página de registo)
    completeRegistration: async (token, userData) => {
        return await api(`/users/register?token=${token}`, "POST", userData);
    },

    // Para o utilizador pedir recuperação de password
    forgotPassword: async (email) => {
        return await api("/users/forgot-password", "POST", { email });
    },

    // Para o utilizador definir a nova password usando o token do email
    resetPassword: async (token, password) => {
        return await api(`/users/reset-password?token=${token}`, "POST", { password });
    },

    /**
     */
    getMe: async () => {
        return await api("/users/me", "GET");
    },

    /**
     */
    getAllUsers: async () => {
        const response = await api("/users", "GET");
        return Array.isArray(response) ? response : [];
    },

    /**
     */
    updateMyProfile: async (userData) => {
        return await api("/users/me", "PUT", userData);
    },

    /**
     */
    getUserById: async (id) => {
        return await api(`/users/${id}`, "GET");
    },

    /**
     */
    toggleUserStatus: async (id, action) => {
        return await api(`/users/${id}/${action}`, "PATCH");
    },

    /**
     */
    deleteUserPermanent: async (id) => {
        return await api(`/users/${id}`, "DELETE");
    }
};