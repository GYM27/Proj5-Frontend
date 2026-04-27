import React from "react";
import { Form } from "react-bootstrap";
import ActionGroup from "../Shared/ActionGroup";
import ActionButton from "../Shared/ActionButton";
import HeaderActions from "../Shared/HeaderActions"; // Novo sistema de Portal
import { BUTTON_TYPES } from "../Shared/buttonConfigs";

const KanbanHeader = ({
                          displayName,
                          leadsCount,
                          isTrashMode,
                          setIsTrashMode,
                          isAdmin,
                          filters,
                          setFilters,
                          users,
                          actions,
                      }) => {
    return (
        <HeaderActions>
            {/* FILTRO DE RESPONSÁVEL */}
            {isAdmin && (
                <div className="d-flex align-items-center gap-2 me-2 border-end pe-3">
                    <span className="fw-bold small text-secondary">Responsável:</span>
                    <Form.Select
                        size="sm"
                        style={{ width: "180px" }}
                        value={filters.userId}
                        onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                    >
                        <option value="">Todos</option>
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
                    tooltip="Nova Lead"
                    onClick={() => actions.openCreate(1)}
                />
            )}
        </HeaderActions>
    );
};

export default KanbanHeader;