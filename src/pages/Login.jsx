import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { loginUser } from "../services/loginService.js";
import {
  Container, Card, Form, Button, Alert, Row, Col, Modal, Spinner
} from "react-bootstrap";
import { userService } from "../services/userService";
import { FormattedMessage, useIntl } from "react-intl";
import logo from "../assets/logo.jpeg";

/**
 * COMPONENTE: Login
 * -----------------
 * DESCRIÇÃO: Ecrã de autenticação do sistema CRM.
 * FUNCIONALIDADE: Captura credenciais, comunica com o serviço de login (Java),
 * armazena o JWT Token e atualiza o estado global da aplicação.
 */
function Login() {
  const [inputs, setInputs] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const intl = useIntl();

  // Estados do Modal de Recuperação de Password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // GESTÃO DE ESTADO GLOBAL (ZUSTAND):
  // Importamos a ação 'setUser' para guardar os dados do utilizador após o sucesso.
  const { setUser } = useUserStore();

  /** * GESTOR DE INPUTS:
   * Implementa o padrão 'Controlled Components' do React, garantindo que o
   * estado local está sempre sincronizado com o que o utilizador escreve.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({
      ...values,
      [name]: value
    }));
  };

  /** * SUBMISSÃO DO FORMULÁRIO (FLUXO DE AUTENTICAÇÃO - 2%):
   * Este método orquestra o contacto com o servidor e a proteção da rota.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Higienização básica de dados (trim) antes de enviar para o servidor Java.
      const credentials = {
        username: inputs.username.trim(),
        password: inputs.password
      };

      // 1. CHAMADA À API: O backend devolve um DTO contendo Token, Nome e Role.
      const data = await loginUser(credentials);

      if (!data || !data.token) {
        throw new Error("O servidor não devolveu os dados de acesso necessários.");
      }

      // 2. PERSISTÊNCIA DA SESSÃO (SEGURANÇA):
      // Guardamos o JWT no sessionStorage. Este token será lido pelo interceptor
      // das APIs para autorizar todos os pedidos subsequentes.
      sessionStorage.setItem("token", data.token);

      // 3. ATUALIZAÇÃO DA STORE:
      // O 'data' injeta firstName e userRole na Store, permitindo que a Sidebar
      // e o Header se adaptem imediatamente às permissões do utilizador.
      setUser(data);

      // 4. NAVEGAÇÃO PROTEGIDA:
      // 'replace: true' impede que o utilizador volte ao login ao clicar no botão 'Recuar' do browser.
      navigate("/dashboard", { replace: true });

    } catch (err) {
      // TRATAMENTO DE ERROS: Captura mensagens vindas das Exceptions do Java (ExceptionMapper).
      setError(err.message || "Utilizador ou password inválidos.");
      console.error("Falha no login:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * FLUXO DE RECUPERAÇÃO DE PASSWORD:
   * Envia o email inserido para a API. Se o utilizador existir,
   * a API envia um email com o token de recuperação.
   */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage(null);
    setIsForgotLoading(true);

    try {
      const response = await userService.forgotPassword(forgotEmail);
      setForgotMessage({ type: "success", text: response.message || "Se o email existir, receberá instruções em breve." });
      setForgotEmail("");
    } catch (err) {
      setForgotMessage({ type: "danger", text: err.message || "Erro ao solicitar recuperação." });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Row className="w-100 justify-content-center">
          <Col xs={11} sm={9} md={7} lg={5} xl={4} style={{ maxWidth: '450px' }}>
            {/* Card com Glassmorphism (efeito de vidro fosco) */}
            <Card className="glass-card border-0">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="mb-3 d-flex justify-content-center">
                    <img 
                      src={logo} 
                      alt="Bridge Logo" 
                      style={{ 
                        width: '250px', 
                        height: 'auto', 
                        objectFit: 'contain' 
                      }} 
                    />
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: "#1e2a78", letterSpacing: "-1px" }}>
                    Bridge.
                  </h2>
                  <p className="text-muted small fw-semibold">CRM SOLUTIONS</p>
                </div>

                {/* FEEDBACK DE ERRO */}
                {error && (
                    <Alert variant="danger" className="py-2 small border-0 shadow-sm text-center">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label className="fw-bold text-secondary small mb-1 ms-1">
                      <FormattedMessage id="login.username" />
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        placeholder={intl.formatMessage({ id: "login.username_placeholder" })}
                        value={inputs.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="login-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-bold text-secondary small mb-1 ms-1">
                      <FormattedMessage id="login.password" />
                    </Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder={intl.formatMessage({ id: "login.password_placeholder" })}
                        value={inputs.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="login-input"
                    />
                  </Form.Group>

                  {/* BOTÃO DE LOGIN COM DESIGN PREMIUM */}
                  <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading}
                      className="w-100 py-3 fw-bold rounded-pill shadow-sm border-0"
                      style={{ 
                        background: "linear-gradient(90deg, #1e2a78 0%, #0d6efd 100%)",
                        transition: "transform 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                      onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {isLoading
                      ? <><Spinner as="span" animation="border" size="sm" className="me-2"/> <FormattedMessage id="login.loading" /></>
                      : <FormattedMessage id="login.submit" />}
                  </Button>

                  <div className="text-center mt-4">
                    <span className="text-muted small"><FormattedMessage id="login.forgot" /> </span>
                    <Button
                      variant="link"
                      className="text-decoration-none fw-bold small p-0 m-0 align-baseline text-primary"
                      onClick={() => setShowForgotModal(true)}
                    >
                      <FormattedMessage id="login.forgot_link" />
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
            
            {/* Rodapé do login com copyright */}
            <div className="text-center mt-4 text-white-50 small" style={{ animation: "fadeIn 2s ease-in" }}>
              &copy; {new Date().getFullYear()} Bridge CRM. All rights reserved.
            </div>
          </Col>
        </Row>

        {/* MODAL DE RECUPERAÇÃO DE PASSWORD */}
        <Modal show={showForgotModal} onHide={() => setShowForgotModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold">
              <FormattedMessage id="login.recover_title" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {forgotMessage && (
              <Alert variant={forgotMessage.type} className="py-2 small">
                {forgotMessage.text}
              </Alert>
            )}
            <p className="small text-muted mb-3">
              <FormattedMessage id="login.recover_desc" />
            </p>
            <Form onSubmit={handleForgotPassword}>
              <Form.Group className="mb-3" controlId="formForgotEmail">
                <Form.Label className="fw-bold text-secondary small">Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="exemplo@empresa.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  disabled={isForgotLoading}
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-secondary" onClick={() => setShowForgotModal(false)}>
                  <FormattedMessage id="common.cancel" />
                </Button>
                <Button variant="primary" type="submit" disabled={isForgotLoading || !forgotEmail}>
                  {isForgotLoading
                    ? <FormattedMessage id="login.recover_sending" />
                    : <FormattedMessage id="login.recover_send" />}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}

export default Login;