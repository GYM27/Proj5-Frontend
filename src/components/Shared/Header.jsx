import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import HeaderLogo from "../Header/HeaderLogo.jsx";
import UserMenu from "../Header/UserMenu.jsx";
import HeaderNotifications from "../Header/HeaderNotifications.jsx";

/**
 * COMPONENTE: Header
 * -----------------
 * DESCRIÇÃO: Barra de navegação superior (TopBar).
 * FUNCIONALIDADE: Atua como um "Layout Wrapper" que organiza o acesso à Sidebar,
 * o Logotipo da aplicação e as opções de conta do utilizador.
 * @param {Function} onToggleMenu - Função que controla a abertura/fecho da Sidebar lateral.
 */
const Header = ({ onToggleMenu }) => {
  return (
    /**
     * CONFIGURAÇÃO DA NAVBAR:
     * - 'fixed-top': Garante que a navegação está sempre acessível durante o scroll .
     * - 'shadow-sm': Adiciona profundidade visual para separar o header do conteúdo.
     * - 'backgroundColor': Cor primária do CRM proj5 (#1e2a78).
     */
    <Navbar
      expand="lg"
      variant="dark"
      className="shadow-sm fixed-top"
      style={{ backgroundColor: "#1e2a78", height: "56px" }}
    >
      <Container
        fluid
        className="d-flex align-items-center justify-content-between"
        style={{ height: "100%" }}
      >
        <div className="d-flex align-items-center h-100">
          {/* CONTROLADOR DA SIDEBAR:
              Botão de estilo "Hambúrguer" que dispara o evento 'onToggleMenu'
              para otimizar o espaço de trabalho no ecrã (Regra de Design).
          */}
          <button
            className="btn text-white p-0 d-flex align-items-center justify-content-center border-0"
            style={{ width: "40px", height: "40px", marginRight: "10px" }}
            onClick={onToggleMenu}
            aria-label="Toggle Sidebar"
          >
            <i className="bi bi-list fs-3"></i>
          </button>

          {/* COMPONENTE MODULAR: Identidade visual (Logo + Nome) */}
          <div className="d-flex align-items-center h-100">
            <HeaderLogo />
          </div>
        </div>

        {/* SECÇÃO DIREITA:
            - 'ms-auto': Alinha o Menu do Utilizador totalmente à direita.
        */}
        <div className="d-flex align-items-center h-100">
          {/* COMPONENTE MODULAR: Ícone de notificações dinâmico */}
          <HeaderNotifications />

          {/* COMPONENTE MODULAR: Gere a foto, nome e logout do utilizador */}
          <UserMenu />
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
