import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useUserStore } from "../stores/UserStore"; // Importante para a reatividade
import Sidebar from "../components/Shared/Sidebar.jsx";
import Header from "../components/Shared/Header.jsx";
import Footer from "../components/Shared/Footer.jsx";
import useIdleTimeout from "../components/Shared/useIdleTimeout";
import { useWebSocket } from "../components/Chat/useWebSocket";
import { useHeaderStore } from "../stores/HeaderStore"; // Ponte para o cabeçalho
import api from "../services/api";
import GenericHeader from "../components/Shared/GenericHeader";

const MainLayout = () => {
  // Inicializa o WebSocket assim que a MainLayout é montada (user autenticado)
  useWebSocket();
  
  // Timeout de sessão de 15 minutos (900 segundos)
  useIdleTimeout(15);

  // 1. SINCRONIZAÇÃO SELETIVA COM A STORE (OTIMIZAÇÃO):
  // Usamos seletores para que o MainLayout NÃO re-renderize quando a lista de mensagens muda.
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const setUnreadCount = useUserStore((state) => state.setUnreadCount);
  
  // 2. CONEXÃO COM O CABEÇALHO UNIFICADO:
  const { title, subtitle, stats, showStats } = useHeaderStore();

  // 3. FETCH GLOBAL DE NOTIFICAÇÕES:
  // Isto garante que o sininho fica a vermelho mal abrimos a app
  useEffect(() => {
    const fetchUnread = async () => {
      if (!isAuthenticated) return;
      try {
        const count = await api("/notifications/unread-count");
        setUnreadCount(count);
      } catch (err) {
        console.error("Erro ao carregar notificações iniciais:", err);
      }
    };

    fetchUnread();
  }, [isAuthenticated, setUnreadCount]);

  // 2. CORREÇÃO DE STORAGE:
  // coincidir com o teu apiRequest.js
  const token = sessionStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** * GUARDA DE ROTA DINÂMICA:
   * Se o token sumir do storage OU a Store disser que não está autenticado,
   * o utilizador é enviado para o login imediatamente.
   */
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
      <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
        <Header onToggleMenu={toggleSidebar} />
        <div className="d-flex flex-grow-1" style={{ marginTop: "56px" }}>
          <Sidebar isOpen={isOpen} />
          <div className="flex-grow-1 d-flex flex-column bg-light" style={{ minWidth: 0 }}>
            <main className="flex-grow-1">
              {/* O CABEÇALHO UNIFICADO: Estático e imutável no layout, dinâmico na informação */}
              <GenericHeader 
                title={title} 
                subtitle={subtitle} 
                stats={stats} 
                showStats={showStats} 
              />
              <div className="p-4">
                <Outlet />
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
  );
};

export default MainLayout;