import { useEffect, useRef } from 'react';
import { useUserStore } from "../../stores/UserStore";
import { WS_BASE_URL } from "../services/api";

export const useWebSocket = () => {
    const websocket = useRef(null);
    const { isAuthenticated, addMessage, incrementUnread } = useUserStore();

    useEffect(() => {
        if (!isAuthenticated) return;

        const token = sessionStorage.getItem("token");
        if (!token) return;

        // Importante: Usar backticks (`) para que o JS consiga ler as variáveis no URL
        websocket.current = new WebSocket(`${WS_BASE_URL}/${token}`);

        websocket.current.onopen = () => {
            console.log("WebSocket: Conectado. O PC validou o token e mapeou o userId.");
        };

        websocket.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "CHAT":
                        addMessage(data);
                        incrementUnread();
                        break;

                    case "NOTIFICATION":
                        console.log("Notificação de Sistema:", data.content);
                        incrementUnread();
                        break;

                    case "DASHBOARD_UPDATE":
                        console.log("Dashboard reativo:", data.content);
                        // No futuro, podes disparar um fetch aqui para atualizar gráficos
                        break;

                    default:
                        console.warn("Evento recebido mas não processado:", data.type);
                }   
            } catch (err) {
                // Trata mensagens que não sejam JSON (ex: o "Recebido" do Java)
                console.log("Mensagem de texto simples:", event.data);
            }
        };

        websocket.current.onclose = () => {
            console.log("WebSocket: Sessão encerrada.");
        };

        // Cleanup: Garante que a ligação fecha ao fazer logout ou mudar de página
        return () => {
            if (websocket.current) {
                websocket.current.close();
            }
        };
    }, [isAuthenticated, addMessage, incrementUnread]);

    
};