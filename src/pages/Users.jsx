import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { useIntl } from "react-intl";
import PaginationComponent from "../components/Shared/PaginationComponent";

/**
 * COMPONENTE DE GESTÃO DE EQUIPA
 * Permite listar, filtrar e gerir contas de utilizadores com paginação no backend.
 */
const Users = () => {
    const { userRole, username: currentUsername } = useUserStore();
    const isAdmin = userRole === "ADMIN";
    const navigate = useNavigate();
    const intl = useIntl();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Estado de controlo da paginação sincronizada com o backend
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10); 

    const setHeader = useHeaderStore((state) => state.setHeader);
    const { modalConfig, openModal, closeModal } = useModalManager();

    /**
     * Carrega a lista de utilizadores aplicando filtros de pesquisa e paginação.
     */
    const loadUsers = useCallback(async (searchQuery = "", page = 1) => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers(searchQuery, page, pageSize);
            
            // Atualiza o estado com os dados e metadados de paginação recebidos
            setUsers(response.items || []);
            setTotalPages(response.totalPages || 1);
            setCurrentPage(response.currentPage || 1);
        } catch (err) {
            setError(intl.formatMessage({ id: "users.load_error" }));
        } finally {
            setLoading(false);
        }
    }, [pageSize, intl]);

    // Efeito para carregar inicial e quando o termo de pesquisa muda (Backend Filtering)
    useEffect(() => {
        if (!isAdmin) {
            navigate("/dashboard");
            return;
        }

        // Debounce simples para não sobrecarregar o servidor enquanto se digita
        const delayDebounceFn = setTimeout(() => {
            setCurrentPage(1); // Resetar para a primeira página ao pesquisar
            loadUsers(searchTerm, 1);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [isAdmin, navigate, loadUsers, searchTerm]);

    const handleInvite = useCallback(() => {
       openModal("USER_INVITE", intl.formatMessage({ id: "users.invite_modal_title" }), {});
    }, [openModal, intl]);

    const actions = useMemo(() => ({
        primary: {
            label: intl.formatMessage({ id: "users.invite_button" }),
            icon: "bi-person-plus",
            onClick: handleInvite
        }
    }), [intl, handleInvite]);

    // Configura o Cabeçalho
    useEffect(() => {
        setHeader({
            title: intl.formatMessage({ id: "users.title" }),
            subtitle: intl.formatMessage({ id: "users.subtitle" }),
            showStats: false,
            actions: actions // Agora o botão de convite aparece aqui
        });
    }, [setHeader, intl, actions]);

    const { executeUserAction } = useUserActions(loadUsers, closeModal);

    const handleConfirmAction = async (data) => {
        await executeUserAction(modalConfig.type, data);
    };

    return (
        <div className="users-page">
            <UsersHeader 
                onInviteClick={handleInvite} 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <Container>
                {loading && users.length === 0 ? (
                    <div className="text-center mt-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">{intl.formatMessage({ id: "users.loading" })}</p>
                    </div>
                ) : (
                    <>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <UserGrid
                            users={users} // Passamos a lista vinda do backend
                            currentUsername={currentUsername}
                            onViewProfile={(u) => navigate(`/users/${u.username}`)}
                            onToggleStatus={(u) => openModal("USER_TOGGLE_STATUS", u.softDelete ? intl.formatMessage({ id: "users.reactivate" }) : intl.formatMessage({ id: "users.deactivate" }), u)}
                            onHardDelete={(u) => openModal("USER_HARD_DELETE", intl.formatMessage({ id: "users.hard_delete_title" }), u)}
                        />

                        <PaginationComponent 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => loadUsers(searchTerm, page)}
                        />
                    </>
                )}

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