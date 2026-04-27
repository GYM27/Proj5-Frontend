import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../stores/UserStore";
import { loginUser } from "../services/loginService.js";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Modal
} from "react-bootstrap";
import { userService } from "../services/userService";

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

      // 3. ATUALIZAÇÃO DA STORE (ZUSTAND - 5%):
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
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Row>
          <Col>
            {/* Card com sombra e largura fixa para consistência visual */}
            <Card className="shadow-lg border-0" style={{ width: "22rem" }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Bem-vindo</h2>
                </div>

                {/* FEEDBACK DE ERRO: Alerta dinâmico se a autenticação falhar */}
                {error && (
                    <Alert variant="danger" className="py-2 small">
                      {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label className="fw-bold text-secondary small">Utilizador</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        placeholder="Nome de utilizador"
                        value={inputs.username}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-bold text-secondary small">Palavra-passe</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Sua password"
                        value={inputs.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="py-2"
                    />
                  </Form.Group>

                  {/* BOTÃO DE LOGIN: Gerencia o estado de loading para evitar spam de pedidos */}
                  <Button
                      variant="primary"
                      type="submit"
                      disabled={isLoading}
                      className="w-100 py-2 fw-bold"
                  >
                    {isLoading ? "A entrar..." : "Login"}
                  </Button>

                  <div className="text-center mt-4">
                    <span className="text-muted small">Esqueceu-se da password? </span>
                    <Button 
                      variant="link" 
                      className="text-decoration-none fw-bold small p-0 m-0 align-baseline"
                      onClick={() => setShowForgotModal(true)}
                    >
                      Recuperar aqui
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* MODAL DE RECUPERAÇÃO DE PASSWORD */}
        <Modal show={showForgotModal} onHide={() => setShowForgotModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fs-5 fw-bold">Recuperar Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {forgotMessage && (
              <Alert variant={forgotMessage.type} className="py-2 small">
                {forgotMessage.text}
              </Alert>
            )}
            <p className="small text-muted mb-3">
              Insira o email associado à sua conta. Se o email existir no sistema, enviaremos um link de recuperação.
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
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={isForgotLoading || !forgotEmail}>
                  {isForgotLoading ? "A enviar..." : "Enviar Email"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
  );
}

export default Login;