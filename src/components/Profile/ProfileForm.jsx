import React from "react";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const ProfileForm = ({
  formData,
  handleChange,
  handleSubmit,
  isOwnProfile,
  isAdmin,
  loading,
  hasChanges,
  openModal,
}) => {
  const canEdit = isOwnProfile || isAdmin;

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              <FormattedMessage id="profile.firstName" defaultMessage="Nome" />
            </Form.Label>
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
            <Form.Label>
              <FormattedMessage id="profile.lastName" defaultMessage="Apelido" />
            </Form.Label>
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
            <Form.Label>
              <FormattedMessage id="profile.language" defaultMessage="Idioma" />
            </Form.Label>
            <Form.Select
              name="language"
              value={formData.language || "pt"}
              onChange={handleChange}
              disabled={!canEdit}
            >
              <option value="pt">Português (PT)</option>
              <option value="en">English (EN)</option>
            </Form.Select>
          </Form.Group>
        </Col>

        {isOwnProfile && (
          <Col md={12}>
            <div className="mt-4 p-3 bg-light border border-light-subtle rounded-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                  <i className="bi bi-shield-lock-fill text-primary"></i>
                </div>
                <h6 className="fw-bold mb-0">Segurança da Conta</h6>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-pill px-3"
                onClick={() =>
                  openModal("CHANGE_PASSWORD", "Alterar Password", {})
                }
              >
                <i className="bi bi-key me-2"></i> <FormattedMessage id="profile.change_password" defaultMessage="Mudar Password" />
              </Button>
            </div>
          </Col>
        )}
      </Row>

      <Form.Group className="mb-3 mt-4">
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
        <Button
          variant="primary"
          type="submit"
          className="w-100 fw-bold"
          disabled={loading || !hasChanges}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              <FormattedMessage id="profile.saving" defaultMessage="A guardar alterações..." />
            </>
          ) : (
            <FormattedMessage id="profile.save" defaultMessage="Guardar Alterações" />
          )}
        </Button>
      )}
    </Form>
  );
};

export default ProfileForm;

