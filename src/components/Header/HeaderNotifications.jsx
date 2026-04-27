import React from "react";
import { useUserStore } from "../../stores/UserStore";
import { useNavigate } from "react-router-dom";

const NotificationIcon = () => { 
    const { unreadCount, resetUnread } = useUserStore();
    const navigate = useNavigate();

    const handleClick = () => {
        resetUnread(); // Limpa o contador
        navigate("/chat"); // Redireciona para o chat para ler as mensagens
    };

    return (
        <div className="position-relative p-2" style={{ cursor: "pointer" }} onClick={handleClick}>
            {/* Ícone do Sino: Fica Amarelo (warning) se houver mensagens, senão fica Branco Suave */}
            <i 
                className={`bi bi-bell-fill fs-5 ${unreadCount > 0 ? 'text-warning' : 'text-white-50'}`} 
                style={{ 
                    transition: "all 0.3s ease",
                    filter: unreadCount > 0 ? "drop-shadow(0 0 5px rgba(255, 193, 7, 0.5))" : "none",
                    transform: unreadCount > 0 ? "scale(1.1)" : "scale(1)"
                }}
            ></i>

            {/* O Badge (Bolinha Vermelha) - Agora com uma pequena pulsação visual se houver notificações */}
            {unreadCount > 0 && (
                <span 
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light animate-pulse"
                    style={{ fontSize: '0.65rem', padding: '0.35em 0.65em' }}
                >
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationIcon;