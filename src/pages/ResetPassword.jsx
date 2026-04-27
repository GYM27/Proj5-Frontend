import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { userService } from "../services/userService";

/**
 * PÁGINA: ResetPassword
 * ---------------------
 * DESCRIÇÃO: Onde o utilizador define a sua nova password após clicar no link do email.
 */
function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("As passwords não coincidem.");
            return;
        }

        try {
            await userService.resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.message || "Erro ao redefinir a password. O link pode ter expirado.");
        }
    };

    if (!token) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Alert variant="danger">Token de recuperação em falta. Por favor, use o link enviado para o seu email.</Alert>
            </Container>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="p-4 shadow-lg border-0" style={{ width: "25rem" }}>
                <Card.Body>
                    <h2 className="text-center mb-4 fw-bold">Nova Password</h2>
                    <p className="text-center text-muted mb-4">A recuperar conta para: <strong>{email}</strong></p>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">Password alterada com sucesso! A redirecionar para o login...</Alert>}

                    {!success && (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nova Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Confirmar Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Repita a password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
                                Atualizar Password
                            </Button>

                            <div className="text-center mt-3">
                                <Link to="/login" className="text-decoration-none">Voltar ao Login</Link>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ResetPassword;
