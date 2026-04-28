import React, { useEffect, useState, useCallback } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { useHeaderStore } from "../stores/HeaderStore"; 
import { userService } from "../services/userService";

// Componentes extraídos
import UserGrid from "../components/Users/UserGrid";
import UsersHeader from "../components/Users/UserHeader";
import { useModalManager } from "../Modal/useModalManager.jsx";
import DynamicModal from "../Modal/DynamicModal.jsx";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";
import { useUserActions } from "../components/Users/useUserActions.jsx";

/**
 * Componente responsável pela listagem e gestão de utilizadores.
 * REQUISITO: Filtro por username ou e-mail (Backend).
 */
const Users = () => {
    const { userRole } = useUserStore();
    const isAdmin = userRole === "ADMIN";
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { setHeader } = useHeaderStore();
    const { modalConfig, openModal, closeModal } = useModalManager();

    /**
     * Carrega os utilizadores pedindo ao BACKEND para filtrar (Regra do Projeto)
     */
    const loadUsers = useCallback(async (searchQuery = "") => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers(searchQuery);
            // Ordena mantendo os ativos no topo
            const sortedUsers = data.sort((a, b) => (a.softDelete === b.softDelete ? 0 : a.softDelete ? 1 : -1));
            setUsers(sortedUsers);
        } catch (err) {
            setError("Erro ao carregar a lista de utilizadores.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Efeito para carregar inicial e quando o termo de pesquisa muda (Backend Filtering)
    useEffect(() => {
        if (!isAdmin) {
            navigate("/dashboard");
            return;
        }

        // Debounce simples para não sobrecarregar o servidor enquanto se digita
        const delayDebounceFn = setTimeout(() => {
            loadUsers(searchTerm);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [isAdmin, navigate, loadUsers, searchTerm]);

    // Configura o Cabeçalho apenas uma vez no mount
    useEffect(() => {
        setHeader({
            title: "GESTÃO DE EQUIPA",
            subtitle: "Administração de utilizadores, permissões e estados das contas.",
            showStats: false
        });
    }, [setHeader]);

    const { executeUserAction } = useUserActions(loadUsers, closeModal);

    const handleConfirmAction = async (data) => {
        await executeUserAction(modalConfig.type, data);
    };

    const handleInvite = () => {
       openModal("USER_INVITE", "Convidar Novo Colaborador", {});
    };

    if (loading && users.length === 0) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">A carregar equipa...</p>
            </Container>
        );
    }

    return (
        <div className="users-page">
            <UsersHeader 
                onInviteClick={handleInvite} 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <Container>
                {error && <Alert variant="danger">{error}</Alert>}

                <UserGrid
                    users={users} // Passamos a lista vinda do backend
                    onViewProfile={(u) => navigate(`/users/${u.username}`)}
                    onToggleStatus={(u) => openModal("USER_TOGGLE_STATUS", u.softDelete ? "Reativar" : "Desativar", u)}
                    onHardDelete={(u) => openModal("USER_HARD_DELETE", "Ação Irreversível", u)}
                />

                <DynamicModal show={modalConfig.show} onHide={closeModal} title={modalConfig.title}>
                    <ConfirmActionContent
                        type={modalConfig.type}
                        data={modalConfig.data}
                        onCancel={closeModal}
                        onConfirm={handleConfirmAction}
                    />
                </DynamicModal>
            </Container>
        </div>
    );
};

export default Users;