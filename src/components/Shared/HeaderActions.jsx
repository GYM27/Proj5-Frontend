import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

/**
 * COMPONENTE: HeaderActions
 * ------------------------
 * DESCRIÇÃO: Usa React Portals para injetar conteúdo (botões, filtros)
 * no cabeçalho unificado que reside no MainLayout.
 * 
 * @param {React.ReactNode} children - Os elementos a teletransportar.
 */
const HeaderActions = ({ children }) => {
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    // Procura o ponto de ancoragem no DOM (definido no GenericHeader)
    const target = document.getElementById('header-actions-portal');
    setPortalTarget(target);
  }, []);

  if (!portalTarget) return null;

  return ReactDOM.createPortal(children, portalTarget);
};

export default HeaderActions;
