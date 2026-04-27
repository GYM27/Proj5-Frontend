import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { userService } from "../services/userService.js";

/**
 * COMPONENTE: Register
 * --------------------
 * DESCRIÇÃO: Formulário de criação de conta para novos utilizadores.
 * FUNCIONALIDADE: Captura dados biográficos e credenciais, enviando-os para
 * o endpoint de registo do Backend Java.
 */
function Register() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const invitedEmail = searchParams.get("email") || "";

  const [inputs, setInputs] = useState({
    username: "",
    password: "",
    email: invitedEmail,
    firstName: "",
    lastName: "",
    cellphone: "",
    photoUrl: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /** * 2. GESTOR DE ALTERAÇÕES DINÂMICO:
   * Uma única função trata todos os inputs do formulário usando o atributo 'name'.
   * Isto reduz drasticamente a redundância de código (Princípio Clean Code).
   */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  /** * 3. SUBMISSÃO E PERSISTÊNCIA (FLUXO DE DADOS - 3%):
   * Comunica com o 'registerService' para persistir o novo utilizador.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!token) {
        setError("Token de convite em falta. Não pode registar-se sem um convite válido.");
        return;
    }

    try {
      // CHAMADA À API: Usamos o novo método centralizado no userService
      await userService.completeRegistration(token, inputs);

      navigate("/login");
    } catch (err) {
      setError(err.message || "Erro ao criar conta. O convite pode ter expirado.");
    }
  };

  return (
      <Container className="d-flex justify-content-center align-items-center vh-100 py-5">
        {/* DESIGN: Card largo (30rem) para acomodar os campos lado a lado em desktop */}
        <Card className="p-4 shadow-lg border-0" style={{ width: "30rem" }}>
          <Card.Body>
            <h2 className="text-center mb-4 fw-bold">Criar Nova Conta</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* ORGANIZAÇÃO EM ROW/COL: Melhora a legibilidade do formulário (UX) */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Primeiro Nome</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstName"
                        value={inputs.firstName}
                        onChange={handleChange}
                        required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Último Nome</Form.Label>
                    <Form.Control
                        type="text"
                        name="lastName"
                        value={inputs.lastName}
                        onChange={handleChange}
                        required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    name="username"
                    value={inputs.username}
                    onChange={handleChange}
                    required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={inputs.email}
                    onChange={handleChange}
                    required
                    readOnly={!!invitedEmail} // Bloqueia o email se vier do convite
                    className={invitedEmail ? "bg-light" : ""}
                />
                {invitedEmail && <Form.Text className="text-muted small">Este é o email associado ao seu convite.</Form.Text>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={inputs.password}
                    onChange={handleChange}
                    required
                    minLength={8} // Garante consistência com o formulário de Login
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contacto Telefónico</Form.Label>
                <Form.Control
                    type="tel"
                    name="cellphone"
                    placeholder="+351"
                    value={inputs.cellphone}
                    onChange={handleChange}
                    required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>URL da Foto de Perfil</Form.Label>
                <Form.Control
                    type="text"
                    name="photoUrl"
                    placeholder="http://..."
                    value={inputs.photoUrl}
                    onChange={handleChange}
                />
              </Form.Group>

              <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2 fw-bold"
              >
                Finalizar Registo
              </Button>

              <div className="text-center mt-3">
                <Link to="/login" className="text-decoration-none">
                  Já tem conta? Voltar ao Login
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
  );
}

export default Register;