import React from "react";
import { Card, Button, Badge } from "react-bootstrap";

/**
 * COMPONENTE: UserCard
 * -------------------
 * DESCRIÇÃO: Representa um utilizador do sistema na lista de gestão de staff.
 * REQUISITOS: Mostra Username, Fotografia e E-mail.
 */
const UserCard = ({ user, onToggleStatus, onHardDelete, onViewProfile }) => {
  const isInactive = user.softDelete;

  return (
    <Card
      className={`shadow-sm border-0 h-100 ${isInactive ? "opacity-75 bg-light" : ""}`}
      style={{ borderTop: `4px solid ${isInactive ? "#ffc107" : "#28a745"}`, borderRadius: '12px' }}
    >
      <Card.Body className="p-3 d-flex flex-column">
        {/* CABEÇALHO: Fotografia e Informação Básica */}
        <div className="d-flex align-items-center mb-3">
            <div className="rounded-circle overflow-hidden flex-shrink-0 shadow-sm d-flex align-items-center justify-content-center bg-light border" 
                 style={{ width: '55px', height: '55px' }}>
                {user.photoUrl ? (
                    <img 
                        src={user.photoUrl} 
                        alt={user.username} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://ui-avatars.com/api/?name=" + (user.firstName || user.username) + "&background=random";
                        }}
                    />
                ) : (
                    <span className="fw-bold text-secondary" style={{ fontSize: '1.2rem' }}>
                        {user.firstName?.[0] || user.username?.[0] || '?'}{user.lastName?.[0] || ''}
                    </span>
                )}
            </div>
            
            <div className="ms-3 overflow-hidden">
                <h6 className="fw-bold mb-0 text-truncate" style={{ color: "#2c3e50" }}>
                    {user.firstName} {user.lastName}
                </h6>
                <small className="text-primary fw-semibold">@{user.username}</small>
            </div>
            
            <Badge bg={isInactive ? "warning" : "success"} className="ms-auto align-self-start">
                {isInactive ? "Inativo" : "Ativo"}
            </Badge>
        </div>

        {/* E-MAIL E CARGO */}
        <div className="mb-3" style={{ fontSize: "0.85rem", flexGrow: 1 }}>
          <div className="mb-1 text-truncate" title={user.email}>
            <i className="bi bi-envelope-at text-muted me-2"></i>
            {user.email}
          </div>
          <div className="text-muted">
            <i className="bi bi-shield-check text-muted me-2"></i>
            <span className="text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>{user.role}</span>
          </div>
        </div>

        {/* BOTÕES DE ACÇÃO */}
        <div className="d-flex justify-content-end gap-2 pt-2 border-top">
          <Button
            variant="outline-primary"
            size="sm"
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            title="Ver Perfil"
            onClick={() => onViewProfile(user)}
          >
            <i className="bi bi-person-vcard" style={{ fontSize: "0.9rem" }}></i>
          </Button>

          <Button
            variant={isInactive ? "outline-success" : "outline-warning"}
            size="sm"
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            title={isInactive ? "Reativar" : "Desativar"}
            onClick={() => onToggleStatus(user)}
          >
            <i
              className={`bi ${isInactive ? "bi-arrow-counterclockwise" : "bi-ban"}`}
              style={{ fontSize: "0.9rem" }}
            ></i>
          </Button>

          <Button
            variant="outline-danger"
            size="sm"
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
            title="Eliminar Permanente"
            onClick={() => onHardDelete(user)}
          >
            <i className="bi bi-trash3" style={{ fontSize: "0.9rem" }}></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserCard;
