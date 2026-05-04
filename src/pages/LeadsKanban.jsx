import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
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

/**
 * CONFIGURAÇÃO DE COLUNAS:
 * Centralizamos os estados do funil de vendas.
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
  // 1. ESTADOS E STORES (Seletores Atómicos para evitar o loop infinito)
  const leads = useLeadStore((state) => state.leads);
  const loading = useLeadStore((state) => state.loading);

  // Extração direta das funções da store (são estáveis e não causam re-renders)
  const fetchMyLeads = useLeadStore((state) => state.fetchMyLeads);
  const deleteLead = useLeadStore((state) => state.deleteLead);
  const handleBulkAction = useLeadStore((state) => state.handleBulkAction);
  const restoreLead = useLeadStore((state) => state.restoreLead);

  // Store do Utilizador
  const userRole = useUserStore((state) => state.userRole);
  const currentUserName = useUserStore((state) => state.firstName);
  const isAdmin = userRole === "ADMIN";

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ userId: "", state: "" });
  const [isTrashMode, setIsTrashMode] = useState(false);

  // 2. GESTÃO DE MODAIS E CABEÇALHO
  const { modalConfig, openModal, closeModal } = useModalManager();
  const { setHeader } = useHeaderStore();

  // 3. AÇÕES CENTRALIZADAS
  // Recriamos um objeto com as ações para não quebrar o hook partilhado
  const storeActions = {
    fetchMyLeads,
    deleteLead,
    handleBulkAction,
    restoreLead,
  };
  const { leads: actions } = useResourceActions(openModal, filters, {
    leadStore: storeActions,
    userRole,
  });

  // CÁLCULO DO NOME PARA O CABEÇALHO (Necessário antes do useEffect)
  const selectedUser = users.find(
    (u) => String(u.id) === String(filters.userId),
  );
  const displayName = isAdmin
    ? selectedUser
      ? `${selectedUser.firstName} ${selectedUser.lastName}`
      : intl.formatMessage({ id: "leads.admin_general" })
    : currentUserName;

  // 4. CARREGAMENTO DE DADOS (Utilizadores para Admin)
  useEffect(() => {
    if (isAdmin) {
      userService.getAllUsers().then(setUsers).catch(console.error);
    }
  }, [isAdmin]);

  /**
   * 5. EFEITO DE SINCRONIZAÇÃO:
   * Completamente isolado e limpo. Só dispara quando um filtro muda.
   */
  useEffect(() => {
    fetchMyLeads(userRole, {
      userId: filters.userId,
      softDeleted: isTrashMode,
    });

    // ATUALIZA O CABEÇALHO GLOBAL
    setHeader({
      title: intl.formatMessage({ id: isTrashMode ? "leads.trash_title" : "leads.title" }),
      subtitle: intl.formatMessage(
          { id: "leads.subtitle" },
          { count: leads.length, responsible: displayName }
      ),
      isTrash: isTrashMode,
      showStats: false,
    });
  }, [
    userRole,
    filters.userId,
    isTrashMode,
    leads.length,
    displayName,
    setHeader,
  ]);

  // FEEDBACK DE LOADING
  if (loading && leads.length === 0) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>{intl.formatMessage({ id: "leads.loading_panel" })}</p>
      </div>
    );
  }

  return (
    <Container fluid className="mt-4 px-4">
      <KanbanHeader
        displayName={displayName}
        leadsCount={leads.length}
        isTrashMode={isTrashMode}
        setIsTrashMode={setIsTrashMode}
        isAdmin={isAdmin}
        filters={filters}
        setFilters={setFilters}
        users={users}
        actions={actions}
      />

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

      <DynamicModal
        show={modalConfig.show}
        onHide={closeModal}
        title={modalConfig.title}
      >
        {modalConfig.type === "EDIT_LEAD" ? (
          <EditLeadForm
            leadData={modalConfig.data}
            onSuccess={() => {
              // A store já atualizou a lead localmente, não fazemos fetch redundante
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
              // As chamadas agora usam as funções atómicas diretamente
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
