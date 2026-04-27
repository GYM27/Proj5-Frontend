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
            {/* Ícone do Sino (Bootstrap Icons) */}
            <i className="bi bi-bell-fill text-secondary fs-5" style={{ transition: "color 0.2s" }} onMouseOver={(e) => e.target.classList.replace("text-secondary", "text-primary")} onMouseOut={(e) => e.target.classList.replace("text-primary", "text-secondary")}></i>

            {/* O Badge (Bolinha Vermelha) - Só aparece se houver notificações */}
            {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </div>
    );
};

export default NotificationIcon;