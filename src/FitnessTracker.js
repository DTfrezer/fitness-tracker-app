import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card, Spinner, Table } from 'react-bootstrap';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

function FitnessTracker() {
  const [steps, setSteps] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [calories, setCalories] = useState('');
  const [fitnessData, setFitnessData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/', { replace: true });
      } else {
        fetchFitnessData();
      }
    });
    return unsubscribe;
  }, [navigate]);

  const fetchFitnessData = async () => {
    try {
      const q = query(collection(db, 'fitnessData'), orderBy('timestamp', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setFitnessData(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'fitnessData'), {
        steps,
        waterIntake,
        calories,
        timestamp: new Date(),
      });
      setFitnessData(prev => [
        { steps, waterIntake, calories, timestamp: new Date() },
        ...prev.slice(0, 4)
      ]);
      setSteps('');
      setWaterIntake('');
      setCalories('');
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const containerClass = darkMode ? 'bg-dark text-white min-vh-100' : 'bg-light text-dark min-vh-100';
  const cardClass = darkMode ? 'bg-secondary text-white' : '';

  return (
    <div className={containerClass}>
      <Container className="py-4">
        <Row className="justify-content-between mb-3">
          <Col md="auto">
            <Button variant={darkMode ? 'light' : 'dark'} onClick={() => setDarkMode(prev => !prev)}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Button>
          </Col>
          <Col md="auto">
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col className="text-center">
            <h1>Fitness Tracker 💪</h1>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={6}>
            <Card className={`p-4 shadow ${cardClass}`}>
              <h3 className="text-center mb-4">Log Your Fitness</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Steps</Form.Label>
                  <Form.Control
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Water Intake (Litres)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Calories</Form.Label>
                  <Form.Control
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isSaving} className="w-100">
                  {isSaving ? <Spinner size="sm" animation="border" className="me-2" /> : 'Save Data'}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col className="text-center">
            <Button variant="info" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Steps</th>
                  <th>Water Intake</th>
                  <th>Calories</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {fitnessData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.steps}</td>
                    <td>{data.waterIntake}</td>
                    <td>{data.calories}</td>
                    <td>{new Date(data.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default FitnessTracker;
