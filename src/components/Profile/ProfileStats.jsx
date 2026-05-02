import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const ProfileStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="mt-4 mb-4">
      <h6 className="fw-bold mb-3 text-secondary text-uppercase" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>
        <i className="bi bi-graph-up-arrow me-2"></i> 
        <FormattedMessage id="profile.stats_title" defaultMessage="Estatísticas de Leads" />
      </h6>
      
      <Row className="g-3">
        {/* Total de Leads */}
        <Col xs={12} md={4}>
          <Card className="border-0 bg-primary bg-opacity-10 h-100 rounded-4">
            <Card.Body className="text-center p-3">
              <h3 className="fw-bold text-primary mb-0">{stats.leads || 0}</h3>
              <small className="text-primary fw-medium">Total Leads</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Ganhos */}
        <Col xs={6} md={4}>
          <Card className="border-0 bg-success bg-opacity-10 h-100 rounded-4">
            <Card.Body className="text-center p-3">
              <h3 className="fw-bold text-success mb-0">{stats.ganhos || 0}</h3>
              <small className="text-success fw-medium">Ganhas</small>
            </Card.Body>
          </Card>
        </Col>

        {/* Perdidos */}
        <Col xs={6} md={4}>
          <Card className="border-0 bg-danger bg-opacity-10 h-100 rounded-4">
            <Card.Body className="text-center p-3">
              <h3 className="fw-bold text-danger mb-0">{stats.perdidos || 0}</h3>
              <small className="text-danger fw-medium">Perdidas</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileStats;
