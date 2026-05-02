import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../../stores/UserStore";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Dropdown, Badge, Spinner } from "react-bootstrap";

/**
 * COMPONENTE: NotificationIcon (Com Dropdown de Notificações)
 * --------------------------------------------------------
 * DESCRIÇÃO: Gere a visualização de alertas em tempo real.
 */
const NotificationIcon = () => {
    const { unreadCount, resetUnread } = useUserStore();
    const navigate = useNavigate();
    
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    // Carrega as notificações quando o dropdown é aberto
    const fetchNotifications = async () => {
        if (show) return; // Se já estiver a abrir, não faz nada
        setLoading(true);
        try {
            const data = await api("/notifications", "GET");
            setNotifications(data);
        } catch (err) {
            console.error("Erro ao carregar notificações:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api("/notifications/read-all", "POST");
            resetUnread();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Erro ao limpar notificações:", err);
        }
    };

    const handleNotificationClick = async (notif) => {
        try {
            if (!notif.read) {
                await api(`/notifications/${notif.id}/read`, "PATCH");
            }
            setShow(false);
            if (notif.type === "CHAT" || notif.content.toLowerCase().includes("mensagem")) {
                navigate("/chat");
            }
        } catch (err) {
            console.error("Erro ao processar clique na notificação:", err);
        }
    };

    return (
        <Dropdown show={show} onToggle={(nextShow) => {
            setShow(nextShow);
            if (nextShow) {
                fetchNotifications();
                handleMarkAllAsRead();
            }
        }} align="end">
            
            <Dropdown.Toggle as="div" className="position-relative p-2" style={{ cursor: "pointer" }}>
                <i 
                    className={`bi bi-bell-fill fs-5 ${unreadCount > 0 ? 'text-warning' : 'text-white-50'}`} 
                    style={{ 
                        transition: "all 0.3s ease",
                        filter: unreadCount > 0 ? "drop-shadow(0 0 5px rgba(255, 193, 7, 0.5))" : "none"
                    }}
                ></i>

                {unreadCount > 0 && (
                    <Badge 
                        pill 
                        bg="danger" 
                        className="position-absolute top-0 start-100 translate-middle border border-light"
                        style={{ fontSize: '0.6rem' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu 
                className="shadow-lg border-0 py-0 overflow-hidden" 
                style={{ width: '320px', borderRadius: '12px', marginTop: '10px' }}
            >
                <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Notificações</h6>
                    {unreadCount > 0 && (
                        <small 
                            className="text-white-50 text-decoration-underline" 
                            style={{ cursor: 'pointer' }}
                            onClick={handleMarkAllAsRead}
                        >
                            Limpar tudo
                        </small>
                    )}
                </div>

                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                    {loading ? (
                        <div className="p-4 text-center">
                            <Spinner size="sm" variant="primary" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted small">
                            <i className="bi bi-bell-slash d-block fs-3 mb-2 opacity-25"></i>
                            Não tens notificações novas.
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <Dropdown.Item 
                                key={n.id} 
                                onClick={() => handleNotificationClick(n)}
                                className={`p-3 border-bottom d-flex align-items-start gap-3 ${!n.read ? 'bg-light fw-bold' : 'opacity-75'}`}
                            >
                                <div className={`rounded-circle p-2 flex-shrink-0 ${n.type === 'CHAT' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'}`}>
                                    <i className={`bi ${n.type === 'CHAT' ? 'bi-chat-dots' : 'bi-info-circle'}`}></i>
                                </div>
                                <div className="overflow-hidden">
                                    <div className="small text-dark text-wrap" style={{ lineHeight: '1.2' }}>{n.content}</div>
                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                        {new Date(n.creatAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                {!n.read && <div className="bg-primary rounded-circle ms-auto" style={{ width: '8px', height: '8px', marginTop: '6px' }}></div>}
                            </Dropdown.Item>
                        ))
                    )}
                </div>

                <div className="bg-light p-2 text-center border-top">
                    <small className="text-primary fw-semibold" style={{ cursor: 'pointer' }} onClick={() => { navigate("/notifications"); setShow(false); }}>
                        Ver todas as notificações
                    </small>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationIcon;