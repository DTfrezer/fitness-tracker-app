import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Dashboard() {
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow p-4">
            <h3 className="text-center">Dashboard</h3>
            <p>Welcome to your fitness dashboard! Here you can track your progress, goals, and more.</p>
            {/* You can add more dashboard content here */}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
