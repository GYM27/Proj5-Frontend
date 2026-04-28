import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, ListGroup, Badge, Button, Spinner, Tab, Nav, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useHeaderStore } from "../stores/HeaderStore";
import { useUserStore } from "../stores/UserStore";

const Notifications = () => {
    const navigate = useNavigate();
    const { setHeader } = useHeaderStore();
    const { resetUnread } = useUserStore();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api("/notifications", "GET");
            setNotifications(data);
        } catch (err) {
            console.error("Erro ao carregar notificações:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        setHeader({
            title: "CENTRO DE NOTIFICAÇÕES",
            subtitle: "Consulta e gere todos os teus alertas e mensagens recebidas.",
            showStats: false
        });
    }, [fetchNotifications, setHeader]);

    const handleMarkAllAsRead = async () => {
        try {
            await api("/notifications/read-all", "POST");
            resetUnread();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Erro ao limpar notificações:", err);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await api("/notifications", "DELETE");
            setNotifications(prev => prev.filter(n => n.type === "CHAT")); // Mantém as de chat que são virtuais no feed
            setShowDeleteModal(false);
        } catch (err) {
            console.error("Erro ao apagar histórico:", err);
        }
    };

    const handleDeleteOne = async (e, id) => {
        e.stopPropagation(); // Não navega ao clicar no X
        try {
            if (id < 1000000) {
                await api(`/notifications/${id}`, "DELETE");
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error("Erro ao apagar notificação:", err);
        }
    };

    const handleAction = async (notif) => {
        if (!notif.read) {
            await api(`/notifications/${notif.id}/read`, "PATCH");
        }
        if (notif.type === "CHAT" || notif.content.toLowerCase().includes("mensagem")) {
            navigate("/chat");
        } else if (notif.content.includes("@")) {
            const match = notif.content.match(/@(\w+)/);
            if (match) navigate(`/users/${match[1]}`);
        }
        fetchNotifications();
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === "ALL") return true;
        return n.type === filter;
    });

    return (
        <Container className="py-4">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <Button 
                    variant="link" 
                    className="p-0 text-decoration-none d-flex align-items-center gap-2 text-muted hover-primary"
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left-circle fs-4"></i>
                    <span className="fw-semibold">Voltar atrás</span>
                </Button>

                <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="d-flex align-items-center gap-2 rounded-pill px-3"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={notifications.filter(n => n.type !== 'CHAT').length === 0}
                >
                    <i className="bi bi-trash3"></i> Limpar Histórico
                </Button>
            </div>

            <Row>
                <Col lg={3} className="mb-4">
                    <Card className="shadow-sm border-0 sticky-top" style={{ top: "80px" }}>
                        <Card.Body className="p-0">
                            <div className="p-3 border-bottom bg-light rounded-top">
                                <h6 className="mb-0 fw-bold">Filtros</h6>
                            </div>
                            <Nav variant="pills" className="flex-column p-2 gap-1">
                                <Nav.Item>
                                    <Nav.Link active={filter === "ALL"} onClick={() => setFilter("ALL")} className="d-flex align-items-center gap-2">
                                        <i className="bi bi-grid-fill"></i> Todas
                                        <Badge bg="secondary" pill className="ms-auto">{notifications.length}</Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link active={filter === "SYSTEM"} onClick={() => setFilter("SYSTEM")} className="d-flex align-items-center gap-2">
                                        <i className="bi bi-cpu-fill"></i> Sistema
                                        <Badge bg="warning" pill className="ms-auto">
                                            {notifications.filter(n => n.type === "SYSTEM").length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link active={filter === "CHAT"} onClick={() => setFilter("CHAT")} className="d-flex align-items-center gap-2">
                                        <i className="bi bi-chat-left-dots-fill"></i> Mensagens
                                        <Badge bg="info" pill className="ms-auto text-white">
                                            {notifications.filter(n => n.type === "CHAT").length}
                                        </Badge>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                            <div className="p-3 border-top mt-2">
                                <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    className="w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <i className="bi bi-check2-all"></i> Marcar tudo como lido
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={9}>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <Card className="shadow-sm border-0 text-center py-5">
                            <Card.Body>
                                <div className="display-1 text-muted opacity-25 mb-3">
                                    <i className="bi bi-bell-slash"></i>
                                </div>
                                <h5>Centro de Alertas Vazio</h5>
                                <p className="text-muted">Não tens notificações no momento.</p>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {filteredNotifications.map((n) => (
                                <Card 
                                    key={n.id} 
                                    className={`shadow-sm border-0 notification-card ${!n.read ? 'border-start border-primary border-4' : ''}`}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                    onClick={() => handleAction(n)}
                                >
                                    <Card.Body className="p-3 position-relative">
                                        {/* Botão de Apagar Individual (apenas para Sistema) */}
                                        {n.type !== 'CHAT' && (
                                            <button 
                                                className="btn-close position-absolute top-0 end-0 m-2" 
                                                style={{ fontSize: '0.7rem' }}
                                                onClick={(e) => handleDeleteOne(e, n.id)}
                                            ></button>
                                        )}

                                        <Row className="align-items-center">
                                            <Col xs="auto">
                                                <div className={`rounded-circle p-3 d-flex align-items-center justify-content-center ${n.type === 'CHAT' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'}`} style={{ width: '50px', height: '50px' }}>
                                                    <i className={`bi ${n.type === 'CHAT' ? 'bi-chat-dots-fill' : 'bi-shield-fill-exclamation'} fs-4`}></i>
                                                </div>
                                            </Col>
                                            <Col>
                                                <div className="d-flex justify-content-between align-items-start mb-1 pe-4">
                                                    <Badge bg={n.type === 'CHAT' ? 'info' : 'warning'} className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                                                        {n.type === 'CHAT' ? 'Mensagem' : 'Sistema'}
                                                    </Badge>
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                        {new Date(n.creatAt).toLocaleDateString()} {new Date(n.creatAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </small>
                                                </div>
                                                <div className={`mb-0 ${!n.read ? 'fw-bold text-dark' : 'text-muted'}`}>
                                                    {n.content}
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}
                        </div>
                    )}
                </Col>
            </Row>

            {/* Modal de Confirmação para Limpar Tudo */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Limpar Histórico?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Esta ação irá remover permanentemente todas as notificações de sistema da tua lista. As mensagens de chat não serão afetadas.
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4">Cancelar</Button>
                    <Button variant="danger" onClick={handleDeleteAll} className="rounded-pill px-4">Sim, Limpar Tudo</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Notifications;
