import React from "react";
import { NavLink } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useUserStore } from "../../stores/UserStore.js";
import { useIntl } from "react-intl";
import "../../App.css";

const Sidebar = ({ isOpen }) => {
  const { userRole } = useUserStore();
  const isAdmin = userRole === "ADMIN";
  const intl = useIntl();

  const allItems = [
    { to: "/dashboard", icon: "bi-speedometer2", labelKey: "nav.dashboard" },
    { to: "/leads",     icon: "bi-clipboard2-plus", labelKey: "nav.leads" },
    { to: "/clients",   icon: "bi-people", labelKey: "nav.clients" },
    { to: "/users",     icon: "bi-gear", labelKey: "nav.users", adminOnly: true },
    { to: "/chat",      icon: "bi-chat-dots", labelKey: "nav.chat" },
  ];

  const menuItems = allItems.filter(item => !item.adminOnly || isAdmin);

  return (
      <nav className={`sidebar-nav border-end d-flex flex-column ${isOpen ? "is-open" : "is-closed"}`}>
        <div className="pt-5">
          <ul className="nav flex-column">
            {menuItems.map((item) => {
              const label = intl.formatMessage({ id: item.labelKey });
              return (
                <li className="nav-item w-100" key={item.to}>
                  <OverlayTrigger
                      placement="right"
                      disabled={isOpen}
                      container={() => document.body}
                      overlay={<Tooltip id={`t-${item.to}`}>{label}</Tooltip>}
                  >
                    <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                            `nav-link py-3 d-flex align-items-center ${isActive ? "active-link" : "text-dark"}`
                        }
                    >
                      <div className="nav-icon-wrapper">
                        <i className={`bi ${item.icon} fs-4`}></i>
                      </div>
                      <span className="nav-label">{label}</span>
                    </NavLink>
                  </OverlayTrigger>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
  );
};

export default Sidebar;