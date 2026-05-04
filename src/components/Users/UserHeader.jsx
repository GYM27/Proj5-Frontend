import { Button, Form, InputGroup } from "react-bootstrap";
import HeaderActions from "../Shared/HeaderActions";
import { useIntl } from "react-intl";

/**
 * COMPONENTE: UsersHeader
 * ----------------------
 * DESCRIÇÃO: Cabeçalho de ações para a página de utilizadores.
 * FOCO: Filtro de pesquisa proeminente e botão de convite discreto.
 */
const UsersHeader = ({ onInviteClick, searchTerm, onSearchChange }) => {
  const intl = useIntl();
  return (
    <HeaderActions>
      <div className="d-flex flex-column flex-md-row gap-2 align-items-center w-100">
        
        {/* Barra de Pesquisa - Agora com foco total e maior largura */}
        <InputGroup 
          className="shadow-sm flex-grow-1" 
          style={{ minWidth: "280px", maxWidth: "800px", transition: "all 0.3s ease" }}
        >
          <InputGroup.Text className="bg-white border-end-0 ps-3">
            <i className="bi bi-search text-muted"></i>
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder={intl.formatMessage({ id: "users.search_placeholder" })}
            className="border-start-0 py-2"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ fontSize: "0.95rem" }}
          />
        </InputGroup>

        {/* Botão de Convite - Mais pequeno e discreto */}
        <Button
          variant="outline-primary"
          size="sm"
          className="px-3 py-2 d-flex align-items-center justify-content-center gap-2 rounded-pill w-100 w-md-auto border-2 fw-semibold"
          onClick={onInviteClick}
          style={{ fontSize: "0.85rem" }}
        >
          <i className="bi bi-person-plus-fill"></i>
          <span className="d-md-inline">{intl.formatMessage({ id: "users.invite" })}</span>
        </Button>
        
      </div>
    </HeaderActions>
  );
};

export default UsersHeader;
