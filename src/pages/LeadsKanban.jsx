import React, { useEffect, useState, useMemo } from "react";
import { Container, Spinner, Button } from "react-bootstrap";
import { useLeadStore } from "../stores/LeadsStore";
import { useUserStore } from "../stores/UserStore";
import { useHeaderStore } from "../stores/HeaderStore"; // Novo
import { userService } from "../services/userService";
import { useIntl } from "react-intl";

// Componentes da Pasta Shared
import { useModalManager } from "../Modal/useModalManager.jsx";
import { useResourceActions } from "../components/Shared/useResourceActions.jsx";
import ConfirmActionContent from "../Modal/ConfirmActionContent.jsx";

// Componentes de Leads
import KanbanHeader from "../components/Leads/KanbanHeader.jsx";
import KanbanColumn from "../components/Leads/KanbanColumn";
import DynamicModal from "../Modal/DynamicModal.jsx";
import EditLeadForm from "../components/Leads/EditLeadForm";
import PaginationComponent from "../components/Shared/PaginationComponent";

/**
 * CONFIGURAÇÃO DAS COLUNAS DO KANBAN
 * Define os estados do funil de vendas, chaves de tradução e cores visuais.
 */
const COLUMNS_DEF = [
  { id: 1, titleKey: "leads.column.new", color: "#007bff" },
  { id: 2, titleKey: "leads.column.analysis", color: "#ffc107" },
  { id: 3, titleKey: "leads.column.proposal", color: "#17a2b8" },
  { id: 4, titleKey: "leads.column.won", color: "#28a745" },
  { id: 5, titleKey: "leads.column.lost", color: "#dc3545" },
];

const LeadsKanban = () => {
  const intl = useIntl();
  
  const leads = useLeadStore((state) => state.leads);
  const loading = useLeadStore((state) => state.loading);

  const currentPage = useLeadStore((state) => state.currentPage);
  const totalPages = useLeadStore((state) => state.totalPages);
  const totalItems = useLeadStore((state) => state.totalItems);

  // Store actions for data manipulation
  const fetchMyLeads = useLeadStore((state) => state.fetchMyLeads);
  const loadMoreLeads = useLeadStore((state) => state.loadMoreLeads);
  const deleteLead = useLeadStore((state) => state.deleteLead);
  const handleBulkAction = useLeadStore((state) => state.handleBulkAction);
  const restoreLead = useLeadStore((state) => state.restoreLead);

  const userRole = useUserStore((state) => state.userRole);
  const currentUserName = useUserStore((state) => state.firstName);
  const isAdmin = userRole === "ADMIN";

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ userId: "", state: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isTrashMode, setIsTrashMode] = useState(false);

  const { modalConfig, openModal, closeModal } = useModalManager();
  const setHeader = useHeaderStore((state) => state.setHeader);

  const storeActions = useMemo(() => ({
    fetchMyLeads,
    deleteLead,
    handleBulkAction,
    restoreLead,
  }), [fetchMyLeads, deleteLead, handleBulkAction, restoreLead]);

  const storesParam = useMemo(() => ({
    leadStore: storeActions,
    userRole,
  }), [storeActions, userRole]);

  const { leads: actions } = useResourceActions(openModal, filters, storesParam);

  const selectedUser = users.find(
    (u) => String(u.id) === String(filters.userId),
  );
  const displayName = isAdmin
    ? selectedUser
      ? `${selectedUser.firstName} ${selectedUser.lastName}`
      : intl.formatMessage({ id: "leads.admin_general" })
    : currentUserName;

  useEffect(() => {
    if (isAdmin) {
      userService.getAllUsers("", 1, 100).then(res => setUsers(res.items || [])).catch(console.error);
    }
  }, [isAdmin]);

  /**
   * Synchronize lead data based on filter, search, or pagination changes.
   * Utilizes debounce to minimize backend request frequency.
   */
  useEffect(() => {
    // Debounce aumentado para 600ms para evitar pedidos excessivos enquanto o utilizador escreve
    const delay = setTimeout(() => {
        fetchMyLeads(userRole, {
            userId: filters.userId,
            softDeleted: isTrashMode,
            search: searchTerm,
            page: 1, 
            size: 10 
        });
    }, 600);

    return () => clearTimeout(delay);
  }, [userRole, filters.userId, isTrashMode, searchTerm]); // fetchMyLeads removido das dependências pois é estável (Zustand)

  // Update global header configuration
  useEffect(() => {
    const subtitleKey = isAdmin ? "leads.subtitle_admin" : "leads.subtitle_user";

    setHeader({
      title: intl.formatMessage({ id: isTrashMode ? "leads.trash_title" : "leads.title" }),
      subtitle: intl.formatMessage(
          { id: subtitleKey },
          { count: totalItems, responsible: displayName }
      ),
      isTrash: isTrashMode,
      showStats: false,
      actions: actions, // Re-adicionado: Permite mostrar o botão "Novo" e outras ações
    });
  }, [isTrashMode, totalItems, displayName, setHeader, intl, isAdmin, actions]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
  };

  return (
    <Container fluid className="mt-4 px-4">
      <KanbanHeader
        displayName={displayName}
        leadsCount={totalItems}
        isTrashMode={isTrashMode}
        setIsTrashMode={setIsTrashMode}
        isAdmin={isAdmin}
        filters={filters}
        setFilters={setFilters}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        users={users}
        actions={actions}
      />

      {loading && leads.length === 0 ? (
          <div className="text-center mt-5">
              <Spinner animation="border" variant="primary" />
              <p>{intl.formatMessage({ id: "leads.loading_panel" })}</p>
          </div>
      ) : (
          <div
              className="d-flex gap-3 pb-4"
              style={{
                  overflowX: "auto",
                  minHeight: "80vh",
                  alignItems: "flex-start",
              }}
          >
              {COLUMNS_DEF.map((col) => (
                  <KanbanColumn
                      key={col.id}
                      col={{ ...col, title: intl.formatMessage({ id: col.titleKey }) }}
                      leads={leads.filter((l) => l.state === col.id)}
                      isTrashMode={isTrashMode}
                      isAdmin={isAdmin}
                      onAddClick={actions.openCreate}
                      cardActions={actions.cardActions}
                  />
              ))}
          </div>
      )}

      {currentPage < totalPages && (
          <div className="d-flex justify-content-center mt-2 mb-5">
              <Button 
                variant="primary" 
                className="shadow-sm px-5 py-2 fw-bold"
                style={{ borderRadius: "25px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}
                onClick={() => loadMoreLeads(userRole, { 
                    userId: filters.userId, 
                    softDeleted: isTrashMode, 
                    search: searchTerm 
                })}
                disabled={loading}
              >
                  {loading ? intl.formatMessage({ id: "common.loading" }) : "VER MAIS LEADS"}
              </Button>
          </div>
      )}

      <DynamicModal
        show={modalConfig.show}
        onHide={closeModal}
        title={modalConfig.title}
      >
        {modalConfig.type === "EDIT_LEAD" ? (
          <EditLeadForm
            leadData={modalConfig.data}
            onSuccess={() => {
              // Fechar o modal após sucesso (o estado local é gerido pela store)
              closeModal();
            }}
            onCancel={closeModal}
          />
        ) : (
          <ConfirmActionContent
            type={modalConfig.type}
            data={modalConfig.data}
            onCancel={closeModal}
            onConfirm={async (data) => {
              // Mapeamento de ações de confirmação para operações na store
              const actionMap = {
                SOFT_DELETE: () => deleteLead(data.id, userRole, false),
                HARD_DELETE: () => deleteLead(data.id, userRole, true),
                BULK_SOFT_DELETE: () =>
                  handleBulkAction(data.userId, "SOFT_DELETE_ALL", userRole, {
                    userId: filters.userId,
                    softDeleted: isTrashMode,
                  }),
                BULK_HARD_DELETE: () =>
                  handleBulkAction(data.userId, "EMPTY_TRASH", userRole, {
                    userId: filters.userId,
                    softDeleted: isTrashMode,
                  }),
                RESTORE_LEAD: () => restoreLead(data.id, data, userRole),
                RESTORE_ALL: () =>
                  handleBulkAction(data.userId, "RESTORE_ALL", userRole, {
                    userId: filters.userId,
                    softDeleted: isTrashMode,
                  }),
              };

              const actionToExecute = actionMap[modalConfig.type];

              if (actionToExecute) {
                const success = await actionToExecute();
                if (success) closeModal();
              }
            }}
          />
        )}
      </DynamicModal>
    </Container>
  );
};

export default LeadsKanban;
