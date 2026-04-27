import React from "react";
import { Card } from "react-bootstrap";
import ActionGroup from "../Shared/ActionGroup";

/**
 * COMPONENTE: LeadCard
 * -------------------
 * DESCRIÇÃO: Responsável por renderizar a informação individual de cada Lead no quadro Kanban.
 * @param {Object} lead - Objeto com os dados da lead (título, autor, data, etc).
 * @param {boolean} isTrashMode - Indica se o cartão está na lixeira (muda o comportamento das ações).
 * @param {boolean} isAdmin - Define se o utilizador tem permissões de administração.
 * @param {Array} cardActions - Conjunto de funções de ação (Editar, Apagar, etc.) passadas pelo componente pai.
 */
const LeadCard = ({ lead, isTrashMode, isAdmin, cardActions }) => {
  return (
    <Card className="shadow-sm border-0 kanban-card">
      <Card.Body className="kanban-card-body">
        {/* TÍTULO DA LEAD */}
        <h6 className="fw-bold kanban-card-title">{lead.title}</h6>

        {/* DESCRIÇÃO DA LEAD (Truncada via CSS) */}
        <p className="kanban-card-description">{lead.description}</p>

        <div className="kanban-card-footer d-flex justify-content-between align-items-end border-top">
          <div>
            {/* NOME DO UTILIZADOR */}
            <div className="kanban-card-author fw-bold text-truncate">
              {lead.firstName} {lead.lastName}
            </div>

            {/* DATA FORMATADA */}
            <div className="kanban-card-date text-muted">
              {lead.formattedDate}
            </div>
          </div>

          <ActionGroup
            actions={cardActions}
            item={lead}
            isTrashMode={isTrashMode}
            isAdmin={isAdmin}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default LeadCard;
