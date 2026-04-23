import api from './api';

/**
 */
export const userService = {
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