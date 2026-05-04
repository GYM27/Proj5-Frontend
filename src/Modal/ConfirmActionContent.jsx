import React from "react";
import { Button } from "react-bootstrap";
import { useIntl } from "react-intl";

/**
 * COMPONENTE: ConfirmActionContent
 * -------------------------------
 * DESCRIÇÃO: Componente polimórfico para diálogos de confirmação.
 * OBJETIVO: Centralizar todas as mensagens de aviso, erro e sucesso do sistema.
 * BENEFÍCIO: Garante que o utilizador recebe sempre o mesmo padrão visual
 * em ações críticas (Eliminar, Restaurar, Desativar).
 * * @param {string} type - Chave que define a configuração (ex: 'SOFT_DELETE').
 * @param {Object} data - Objeto alvo da ação (Lead, Cliente ou Utilizador).
 * @param {Function} onCancel - Fecha o modal sem executar a ação.
 * @param {Function} onConfirm - Executa a lógica de negócio após confirmação.
 */
const ConfirmActionContent = ({ type, data, onCancel, onConfirm }) => {
    const intl = useIntl();

    if (type === "USER_INVITE") {
        return (
            <div className="p-3">
                <p className="text-muted mb-4 text-start">
                    {intl.formatMessage({ id: "modals.invite_desc" })}
                </p>
                <div className="form-group text-start mb-4">
                    <label className="form-label fw-bold">{intl.formatMessage({ id: "modals.email_label" })}</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder={intl.formatMessage({ id: "modals.email_placeholder" })}
                        id="inviteEmail"
                        required
                    />
                </div>
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-outline-secondary" onClick={onCancel}>{intl.formatMessage({ id: "common.cancel" })}</button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            const email = document.getElementById('inviteEmail').value;
                            if(email) onConfirm({ email });
                        }}
                    >
                        <i className="bi bi-envelope-paper me-2"></i> {intl.formatMessage({ id: "modals.send_invite" })}
                    </button>
                </div>
            </div>
        );
    }

    if (type === "CHANGE_PASSWORD") {
        return (
            <div className="p-3 text-start">
                <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase">{intl.formatMessage({ id: "modals.current_password" })}</label>
                    <input type="password" id="oldPass" className="form-control" placeholder={intl.formatMessage({ id: "modals.current_password_placeholder" })} />
                </div>
                <div className="mb-3">
                    <label className="form-label small fw-bold text-uppercase">{intl.formatMessage({ id: "modals.new_password" })}</label>
                    <input type="password" id="newPass" className="form-control" placeholder={intl.formatMessage({ id: "modals.new_password_placeholder" })} />
                </div>
                <div className="mb-4">
                    <label className="form-label small fw-bold text-uppercase">{intl.formatMessage({ id: "modals.confirm_new_password" })}</label>
                    <input type="password" id="confirmPass" className="form-control" placeholder={intl.formatMessage({ id: "modals.confirm_new_password_placeholder" })} />
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button variant="outline-secondary" onClick={onCancel}>{intl.formatMessage({ id: "common.cancel" })}</Button>
                    <Button variant="primary" onClick={() => {
                        const oldP = document.getElementById('oldPass').value;
                        const newP = document.getElementById('newPass').value;
                        const confP = document.getElementById('confirmPass').value;
                        
                        if (!oldP || !newP || !confP) {
                            alert(intl.formatMessage({ id: "modals.error_empty_fields" }));
                            return;
                        }
                        if (newP !== confP) {
                            alert(intl.formatMessage({ id: "modals.error_password_mismatch" }));
                            return;
                        }
                        onConfirm({ currentPassword: oldP, password: newP });
                    }}>
                        <i className="bi bi-shield-check me-2"></i> {intl.formatMessage({ id: "modals.update_password" })}
                    </Button>
                </div>
            </div>
        );
    }

    /**
     * DICIONÁRIO DE CONFIGURAÇÃO (PATTERN: STRATEGY / FACTORY):
     * Em vez de múltiplos IFs espalhados, usamos um Switch para mapear
     * cada 'type' a um conjunto de ícones, cores e mensagens.
     */
    const getModalInfo = () => {
        switch (type) {
            // REGRA A9: Eliminação lógica (Soft Delete)
            case "SOFT_DELETE":
                return {
                    icon: "bi-trash text-warning",
                    message: intl.formatMessage({ id: "modals.soft_delete_msg" }, { name: data?.title || data?.name }),
                    confirmText: intl.formatMessage({ id: "modals.soft_delete_confirm" }),
                    variant: "warning",
                };

            // REGRA A14: Eliminação física (Hard Delete)
            case "HARD_DELETE":
                return {
                    icon: "bi-exclamation-triangle text-danger",
                    message: intl.formatMessage({ id: "modals.hard_delete_msg" }, { name: data?.title || data?.name }),
                    confirmText: intl.formatMessage({ id: "modals.hard_delete_confirm" }),
                    variant: "danger",
                };

            // ACÇÕES EM MASSA (BULK):
            case "BULK_SOFT_DELETE":
                return {
                    icon: "bi-trash-fill text-warning",
                    message: intl.formatMessage({ id: "modals.bulk_soft_delete_msg" }),
                    confirmText: intl.formatMessage({ id: "modals.bulk_soft_delete_confirm" }),
                    variant: "warning",
                };

            case "BULK_HARD_DELETE":
                return {
                    icon: "bi-exclamation-octagon text-danger",
                    message: intl.formatMessage({ id: "modals.bulk_hard_delete_msg" }),
                    confirmText: intl.formatMessage({ id: "modals.bulk_hard_delete_confirm" }),
                    variant: "danger",
                };

            // GESTÃO DE UTILIZADORES:
            case "USER_HARD_DELETE":
                return {
                    icon: "bi-person-x text-danger",
                    message: intl.formatMessage({ id: "modals.user_hard_delete_msg" }, { name: data?.name || data?.firstName }),
                    confirmText: intl.formatMessage({ id: "modals.user_hard_delete_confirm" }),
                    variant: "danger",
                };

            case "RESTORE_LEAD":
                return {
                    icon: "bi-arrow-counterclockwise text-success",
                    message: intl.formatMessage({ id: "modals.restore_msg" }, { name: data?.title || data?.name }),
                    confirmText: intl.formatMessage({ id: "modals.restore_confirm" }),
                    variant: "success",
                };

            case "RESTORE_ALL":
                return {
                    icon: "bi-arrow-counterclockwise text-success",
                    message: intl.formatMessage({ id: "modals.restore_all_msg" }),
                    confirmText: intl.formatMessage({ id: "modals.restore_all_confirm" }),
                    variant: "success",
                };

            case "USER_TOGGLE_STATUS": {
                const isInactive = data?.softDelete;
                return {
                    icon: isInactive ? "bi-person-check-fill text-success" : "bi-person-dash-fill text-warning",
                    message: isInactive
                        ? intl.formatMessage({ id: "modals.user_reactivate_msg" }, { name: data?.firstName })
                        : intl.formatMessage({ id: "modals.user_deactivate_msg" }, { name: data?.firstName }),
                    confirmText: isInactive ? intl.formatMessage({ id: "modals.user_reactivate_confirm" }) : intl.formatMessage({ id: "modals.user_deactivate_confirm" }),
                    variant: isInactive ? "success" : "warning",
                };
            };

            default:
                return {
                    icon: "bi-question-circle",
                    message: intl.formatMessage({ id: "modals.default_msg" }),
                    confirmText: intl.formatMessage({ id: "common.confirm" }),
                    variant: "primary",
                };
        }
    };

    const info = getModalInfo();

    return (
        <div className="text-center p-3">
            <i className={`${info.icon} display-4 mb-3 d-block`}></i>
            <p className="mb-4 lead" style={{ fontSize: "1.1rem" }}>
                {info.message}
            </p>

            <div className="d-flex justify-content-center gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel}>
                    {intl.formatMessage({ id: "common.cancel" })}
                </Button>
                <Button
                    variant={info.variant}
                    onClick={() => onConfirm(data)}
                >
                    {info.confirmText}
                </Button>
            </div>
        </div>
    );
};

export default ConfirmActionContent;