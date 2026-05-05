import React, {useEffect, useState, useMemo} from "react";
import {Container, Spinner, Row, Col} from "react-bootstrap";
import {useClientStore} from "../stores/ClientsStore";
import {useUserStore} from "../stores/UserStore";
import {useHeaderStore} from "../stores/HeaderStore"; // Novo
import {userService} from "../services/userService";
import {useIntl} from "react-intl";

// COMPONENTES SHARED (Arquitetura Modular - 5%)
import {useModalManager} from "../Modal/useModalManager.jsx";
import {useResourceActions} from "../components/Shared/useResourceActions";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";

// COMPONENTES DE CLIENTES
import ClientsHeader from "../components/Clients/ClientsHeader";
import ClientCard from "../components/Clients/ClientCard";
import DynamicModal from "../Modal/DynamicModal.jsx";
import EditClientForm from "../components/Clients/EditClientForm";
import PaginationComponent from "../components/Shared/PaginationComponent";
import "../App.css";

/**
 * GESTÃO DE CARTEIRA DE CLIENTES
 * Interface para visualização, filtragem e CRUD de clientes com suporte a paginação no backend.
 */
const Clients = () => {
    const intl = useIntl();
    const {
        clients,
        loading,
        error,
        fetchClients,
        currentPage,
        totalPages,
        totalItems,
        deleteClient,
        restoreClient,
        handleBulkAction
    } = useClientStore();
    
    const { userRole, username: currentUsername } = useUserStore();
    const isAdmin = userRole === "ADMIN";

    const [isTrashMode, setIsTrashMode] = useState(false);
    const [filters, setFilters] = useState({userId: ""});
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);

    const {modalConfig, openModal, closeModal} = useModalManager();
    const setHeader = useHeaderStore((state) => state.setHeader);

    const resourceParams = useMemo(() => ({ 
        clientStore: { deleteClient, restoreClient, handleBulkAction }, 
        userRole 
    }), [deleteClient, restoreClient, handleBulkAction, userRole]);
    
    const { clients: actions } = useResourceActions(openModal, filters, resourceParams);

    // Carregamento da lista de utilizadores para o filtro de responsáveis (apenas Admin)
    useEffect(() => {
        if (isAdmin) {
            userService.getAllUsers("", 1, 100).then(res => setUsers(res.items || [])).catch(console.error);
        }
    }, [isAdmin]);

    /**
     * Sincronização de dados baseada em filtros, pesquisa e estado da lixeira.
     */
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchClients(userRole, {
                userId: filters.userId || null,
                showTrash: isTrashMode,
                search: searchTerm,
                page: 1 // Ao mudar filtros/pesquisa, resetamos sempre para a página 1
            });
        }, 300);

        return () => clearTimeout(delay);
    }, [userRole, filters.userId, isTrashMode, searchTerm, fetchClients]);

    // Atualização das estatísticas e metadados no cabeçalho global
    useEffect(() => {
        const selectedUser = users.find((u) => String(u.id) === String(filters.userId));
        const displayName = selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : intl.formatMessage({ id: "forms.everyone" });

        const subtitleKey = isAdmin ? "clients.subtitle_admin" : "clients.subtitle_user";

        setHeader({
            title: intl.formatMessage({ id: isTrashMode ? "clients.trash_title" : "clients.title" }),
            subtitle: intl.formatMessage(
                { id: subtitleKey },
                { count: totalItems, responsible: displayName }
            ),
            isTrash: isTrashMode,
            showStats: false,
            actions: actions 
        });
    }, [isTrashMode, totalItems, users, setHeader, intl, isAdmin, filters.userId, actions]);

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        // Ao mudar a pesquisa, voltamos para a página 1 (através da store se necessário, mas aqui apenas resetamos o estado se a store permitir)
        // Como o currentPage está na store, vamos forçar o fetch da página 1
        clientStore.fetchClients(userRole, {
            userId: filters.userId || null,
            showTrash: isTrashMode,
            search: val,
            page: 1
        });
    };

    // FEEDBACK VISUAL DE CARREGAMENTO
    if (loading && clients.length === 0) {
        return (
            <Container className="mt-4 text-center">
                <Spinner animation="border" variant="primary"/>
                <p>{intl.formatMessage({ id: "clients.loading" })}</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            {/* 1. CABEÇALHO: Controla filtros e ações globais */}
            <ClientsHeader
                isTrashMode={isTrashMode}
                setIsTrashMode={setIsTrashMode}
                isAdmin={isAdmin}
                filters={filters}
                setFilters={(f) => { setFilters(f); clientStore.fetchClients(userRole, {...f, showTrash: isTrashMode, page: 1}); }}
                users={users}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                hasClients={clients.length > 0}
                actions={actions}
            />

            {/* 2. LISTA DE CLIENTES (GRID RESPONSIVA):
                Usa o sistema de grelha do Bootstrap para adaptar o número de colunas ao ecrã.
            */}
            <div>
                {clients.length === 0 ? (
                    /* EMPTY STATE: Feedback visual quando não há resultados */
                    <div className="text-center p-5 bg-light rounded border">
                        <i className="bi bi-folder2-open display-4 text-muted"></i>
                        <p className="mt-3 text-muted">
                            {isTrashMode
                                ? intl.formatMessage({ id: "clients.empty_trash" })
                                : intl.formatMessage({ id: "clients.empty_list" })}
                        </p>
                    </div>
                ) : (
                    <Row className="g-3">
                        {clients.map((client) => (
                            <Col key={client.id} xs={12} sm={6} md={4} lg={3}>
                                <ClientCard
                                    client={client}
                                    isTrashMode={isTrashMode}
                                    isAdmin={isAdmin}
                                    cardActions={actions.cardActions}
                                />
                            </Col>
                        ))}
                    </Row>
                )}

                <PaginationComponent 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchClients(userRole, {
                        userId: filters.userId || null,
                        showTrash: isTrashMode,
                        search: searchTerm,
                        page: page
                    })}
                />
            </div>

            {/* 3. MODAL DINÂMICO ÚNICO (Lógica Centralizada):
                Este modal único serve para Edição e para todas as Confirmações.
            */}
            <DynamicModal
                show={modalConfig.show}
                onHide={closeModal}
                title={modalConfig.title}
            >
                {modalConfig.type === "EDIT_CLIENT" ? (
                    <EditClientForm
                        clientData={modalConfig.data}
                        onSuccess={() => {
                            // A store já atualizou o cliente localmente, não fazemos fetch redundante
                            closeModal();
                        }}
                        onCancel={closeModal}
                    />
                ) : (
                    /* ACTION MAP (PADRÃO DE DESIGN):
                       Mapeia o tipo de modal para a função correspondente na Store.
                    */
                    <ConfirmActionContent
                        type={modalConfig.type}
                        data={modalConfig.data}
                        onCancel={closeModal}
                        onConfirm={async (data) => {
                            const currentFilters = {userId: filters.userId || null, showTrash: isTrashMode};

                            const actionMap = {
                                "SOFT_DELETE": () => deleteClient(data.id, false), // Regra A9
                                "HARD_DELETE": () => deleteClient(data.id, true),  // Regra A14
                                "BULK_SOFT_DELETE": () => handleBulkAction(data.userId, "DEACTIVATE_ALL", userRole, currentFilters),
                                "BULK_HARD_DELETE": () => handleBulkAction(data.userId, "EMPTY_TRASH", userRole, currentFilters),
                                "RESTORE_CLIENT": () => restoreClient(data.id, data, userRole),
                                "RESTORE_ALL": () => handleBulkAction(data.userId, "RESTORE_ALL", userRole, {
                                    userId: filters.userId,
                                    softDeleted: isTrashMode
                                })
                            };

                            const actionToExecute = actionMap[modalConfig.type];

                            if (actionToExecute) {
                                await actionToExecute();
                                closeModal();
                            }
                        }}
                    />
                )}
            </DynamicModal>
        </Container>
    );
};

export default Clients;