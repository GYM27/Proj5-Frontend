import React from "react";
import { Form } from "react-bootstrap";
import ActionGroup from "../Shared/ActionGroup";
import ActionButton from "../Shared/ActionButton";
import HeaderActions from "../Shared/HeaderActions"; // Novo sistema de Portal
import { BUTTON_TYPES } from "../Shared/buttonConfigs";
import { useIntl } from "react-intl";

const KanbanHeader = ({
                          displayName,
                          leadsCount,
                          isTrashMode,
                          setIsTrashMode,
                          isAdmin,
                          filters,
                          setFilters,
                          searchTerm,
                          onSearchChange,
                          users,
                          actions,
                      }) => {
    const intl = useIntl();

    return (
        <HeaderActions>
            {/* PESQUISA GLOBAL (Requisito Backend Filtering) */}
            <div className="d-flex align-items-center gap-2 me-3">
                <Form.Control
                    type="text"
                    size="sm"
                    placeholder={intl.formatMessage({ id: "forms.search" }) || "Procurar..."}
                    style={{ width: "200px" }}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* FILTRO DE RESPONSÁVEL */}
            {isAdmin && (
                <div className="d-flex align-items-center gap-2 me-2 border-end pe-3">
                    <span className="fw-bold small text-secondary">{intl.formatMessage({ id: "forms.filter_responsible" })}</span>
                    <Form.Select
                        size="sm"
                        style={{ width: "180px" }}
                        value={filters.userId}
                        onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                    >
                        <option value="">{intl.formatMessage({ id: "forms.all" })}</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.firstName} {u.lastName}
                            </option>
                        ))}
                    </Form.Select>
                </div>
            )}

            {/* BOTÃO ALTERNAR LIXEIRA */}
            <ActionButton
                {...(isTrashMode ? BUTTON_TYPES.TRASH_CLOSE : BUTTON_TYPES.TRASH_OPEN)}
                onClick={() => setIsTrashMode(!isTrashMode)}
            />

            {/* GRUPO DE ACÇÕES EM MASSA */}
            {isAdmin && filters.userId && leadsCount > 0 && (
                <ActionGroup
                    actions={actions}
                    isTrashMode={isTrashMode}
                    isAdmin={isAdmin}
                    isBulk={true}
                />
            )}

            {/* BOTÃO NOVA LEAD */}
            {!isTrashMode && (
                <ActionButton
                    {...BUTTON_TYPES.ADD}
                    tooltip={intl.formatMessage({ id: "leads.create_title" })}
                    onClick={() => actions.openCreate(1)}
                />
            )}
        </HeaderActions>
    );
};

export default KanbanHeader;