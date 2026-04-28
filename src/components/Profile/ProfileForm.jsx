import React from "react";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";

/**
 * COMPONENTE: ProfileForm
 * ----------------------
 * DESCRIÇÃO: Formulário de visualização e edição de perfil de utilizador.
 * @param {Object} formData - Estado contendo os dados do utilizador (firstName, email, etc).
 * @param {Function} handleChange - Gestor de eventos para atualizar o estado ao digitar.
 * @param {Function} handleSubmit - Função que processa a submissão dos dados para a API.
 * @param {boolean} isOwnProfile - Define se o formulário é editável (próprio perfil) ou apenas leitura.
 * @param {boolean} loading - Estado de carregamento para feedback visual no botão.
 */
const ProfileForm = ({ formData, handleChange, handleSubmit, isOwnProfile, isAdmin, loading, hasChanges }) => {
    // REGRA DE NEGÓCIO: O Admin pode editar outros, mas ninguém edita Username/Password aqui.
    const canEdit = isOwnProfile || isAdmin;

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                            name="firstName"
                            value={formData.firstName || ""}
                            onChange={handleChange}
                            disabled={!canEdit}
                            required
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Apelido</Form.Label>
                        <Form.Control
                            name="lastName"
                            value={formData.lastName || ""}
                            onChange={handleChange}
                            disabled={!canEdit}
                            required
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            name="username"
                            value={formData.username || ""}
                            disabled={true}
                            readOnly
                        />
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value="********"
                            disabled={true}
                            readOnly
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    disabled={!canEdit}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Telemóvel</Form.Label>
                <Form.Control
                    name="cellphone"
                    value={formData.cellphone || ""}
                    onChange={handleChange}
                    disabled={!canEdit}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label>URL da Foto</Form.Label>
                <Form.Control
                    name="photoUrl"
                    value={formData.photoUrl || ""}
                    onChange={handleChange}
                    disabled={!canEdit}
                    placeholder="https://exemplo.com/foto.jpg"
                />
            </Form.Group>

            {canEdit && (
                <Button variant="primary" type="submit" className="w-100 fw-bold" disabled={loading || !hasChanges}>
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            A guardar alterações...
                        </>
                    ) : (
                        "Guardar Alterações"
                    )}
                </Button>
            )}
        </Form>
    );
};

export default ProfileForm;