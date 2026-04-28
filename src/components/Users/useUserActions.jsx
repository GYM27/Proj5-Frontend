import { userService } from "../../services/userService.js";

/**
 * HOOK: useUserActions
 * --------------------
 * DESCRIÇÃO: Isola a lógica de negócio e as chamadas à API da gestão de utilizadores.
 */
export const useUserActions = (onSuccess, onComplete) => {

    const executeUserAction = async (actionType, userData) => {
        try {
            const actionMap = {
                "USER_HARD_DELETE": async () => {
                    await userService.deleteUserPermanent(userData.id);
                },
                "USER_TOGGLE_STATUS": async () => {
                    const action = userData.softDelete ? "activate" : "deactivate";
                    await userService.toggleUserStatus(userData.id, action);
                },
                "USER_INVITE": async () => {
                    // Espera que userData contenha { email: "..." }
                    await userService.inviteUser(userData);
                }
            };

            const actionToExecute = actionMap[actionType];

            if (actionToExecute) {
                await actionToExecute();
                if (onComplete) onComplete();
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            console.error("Erro na ação de utilizador:", err);
            
            // Lógica de erro dinâmica para evitar mensagens enganadoras
            let message = "Erro ao processar a ação.";
            if (err.message && err.message.includes("409")) {
                message = "Este email ou utilizador já existe no sistema.";
            } else if (err.message && err.message.includes("403")) {
                message = "Não tens permissão para realizar esta ação.";
            } else if (err.message) {
                message = `Erro: ${err.message}`;
            }

            alert(message);
        }
    };

    return { executeUserAction };
};