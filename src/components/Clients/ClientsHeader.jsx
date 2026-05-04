import React from "react";
import { Form } from "react-bootstrap";
import ActionGroup from "../Shared/ActionGroup";
import ActionButton from "../Shared/ActionButton";
import HeaderActions from "../Shared/HeaderActions";
import { BUTTON_TYPES } from "../Shared/buttonConfigs";
import { useIntl } from "react-intl";

const ClientsHeader = ({
                           isTrashMode,
                           setIsTrashMode,
                           isAdmin,
                           filters,
                           setFilters,
                           users,
                           hasClients,
                           clientsCount,
                           actions,
                       }) => {
    const intl = useIntl();

    const selectedUser = users.find((u) => String(u.id) === String(filters.userId));
    const displayName = selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : intl.formatMessage({ id: "forms.everyone" });

    return (
        <HeaderActions>
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
            {isAdmin && filters.userId && hasClients && (
                <ActionGroup
                    actions={actions}
                    isTrashMode={isTrashMode}
                    isAdmin={isAdmin}
                    isBulk={true}
                />
            )}

            {/* BOTÃO NOVO CLIENTE */}
            {!isTrashMode && (
                <ActionButton
                    {...BUTTON_TYPES.ADD}
                    tooltip={intl.formatMessage({ id: "clients.create_title" })}
                    onClick={() => actions.openCreate()}
                />
            )}
        </HeaderActions>
    );
};

export default ClientsHeader;