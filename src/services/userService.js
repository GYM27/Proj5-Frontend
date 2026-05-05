import api from './api';

export const userService = {

    inviteUser: async (emailData) => {
        return await api("/users/invite", "POST", emailData);
    },

    completeRegistration: async (token, userData) => {
        return await api(`/users/register?token=${token}`, "POST", userData);
    },

    forgotPassword: async (email) => {
        return await api("/users/forgot-password", "POST", { email });
    },

    resetPassword: async (token, password) => {
        return await api(`/users/reset-password?token=${token}`, "POST", { password });
    },

    getMe: async () => {
        return await api("/users/me", "GET");
    },

    /**
     * Recupera a lista global de utilizadores com suporte a pesquisa e paginação no backend.
     */
    getAllUsers: async (search = "", page = 1, size = 10) => {
        const url = `/users?search=${encodeURIComponent(search)}&page=${page}&size=${size}`;
        return await api(url, "GET");
    },

    updateMyProfile: async (userData) => {
        return await api("/users/me", "PUT", userData);
    },

    getUserByUsername: async (username) => {
        return await api(`/users/username/${username}`, "GET");
    },

    updateUserProfile: async (id, userData) => {
        return await api(`/users/${id}`, "PUT", userData);
    },

    getUserById: async (id) => {
        return await api(`/users/${id}`, "GET");
    },

    toggleUserStatus: async (id, action) => {
        return await api(`/users/${id}/${action}`, "PATCH");
    },

    deleteUserPermanent: async (id) => {
        return await api(`/users/${id}`, "DELETE");
    },

    getStatsForUser: async (id) => {
        return await api(`/dashboard/stats?userId=${id}`, "GET");
    }
};