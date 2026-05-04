import React from "react";
import { Card, Badge } from "react-bootstrap";
import ActionGroup from "../Shared/ActionGroup";
import { useIntl } from "react-intl";

/**
 * COMPONENTE: ClientCard
 * ---------------------
 * DESCRIÇÃO: Representa visualmente um cliente seguindo o design system premium.
 */
const ClientCard = ({ client, isTrashMode, isAdmin, cardActions }) => {
    const intl = useIntl();
    
    // Iniciais para o Avatar (Regra: Máximo 2 letras)
    const initials = client.name ? client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "??";

    return (
        <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden" 
              style={{ borderTop: "4px solid #0d6efd" }}>
            <Card.Body className="p-3 d-flex flex-column">
                
                {/* CABEÇALHO: Avatar e Identificação */}
                <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle overflow-hidden flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center bg-light border" 
                         style={{ width: '50px', height: '50px', backgroundColor: '#f8f9fa' }}>
                        <span className="fw-bold text-primary" style={{ fontSize: '1rem' }}>
                            {initials}
                        </span>
                    </div>
                    
                    <div className="ms-3 overflow-hidden">
                        <h6 className="fw-bold mb-0 text-truncate" style={{ color: "#2c3e50" }}>
                            {client.name}
                        </h6>
                        <small className="text-primary fw-semibold text-truncate d-block">
                            <i className="bi bi-building me-1"></i>
                            {client.organization}
                        </small>
                    </div>
                </div>

                {/* INFO DE CONTACTO */}
                <div className="mb-3" style={{ fontSize: "0.85rem", flexGrow: 1 }}>
                    <div className="mb-1 text-truncate text-muted" title={client.email}>
                        <i className="bi bi-envelope me-2"></i>
                        {client.email}
                    </div>
                    <div className="text-muted">
                        <i className="bi bi-telephone me-2"></i>
                        {client.phone}
                    </div>
                </div>

                {/* RODAPÉ E AÇÕES */}
                <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                    {/* Responsável pelo Cliente */}
                    <div className="overflow-hidden" style={{ maxWidth: '60%' }}>
                        <small className="text-muted d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-person-badge me-1"></i>
                            {client.ownerName || "Sistema"}
                        </small>
                    </div>

                    {/* Centralização das Ações */}
                    <ActionGroup
                        actions={cardActions}
                        item={client}
                        isTrashMode={isTrashMode}
                        isAdmin={isAdmin}
                    />
                </div>
            </Card.Body>
        </Card>
    );
};

export default ClientCard;