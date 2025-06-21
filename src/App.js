// File: App.js

import React, { useState, useEffect } from 'react';
import {
  Button, Form, Container, Row, Col, Card, Spinner, Table, Alert
} from 'react-bootstrap';
import {
  onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut
} from 'firebase/auth';
import {
  collection, addDoc, getDocs, query, orderBy, limit
} from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db, messaging } from './firebase';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/fitness" element={<FitnessTracker />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

// ---------------------- Auth Page ----------------------

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/fitness', { replace: true });
    });
    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Email and password are required.');
    setIsLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDark = () => setDarkMode(prev => !prev);
  const containerClass = darkMode ? 'bg-dark text-white min-vh-100' : 'bg-light text-dark min-vh-100';
  const cardClass = darkMode ? 'bg-secondary text-white' : '';

  return (
    <div className={containerClass}>
      <Container className="py-4">
        <Row className="justify-content-end mb-3">
          <Col md="auto">
            <Button variant={darkMode ? 'light' : 'dark'} onClick={toggleDark}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Button>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className={`p-4 shadow ${cardClass}`}>
              <h2 className="text-center mb-4">{isSignUp ? 'Sign Up' : 'Login'}</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={isLoading} className="w-100">
                  {isLoading ? <Spinner size="sm" animation="border" className="me-2" /> : isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// ---------------------- Fitness Tracker ----------------------

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
        registerFcmToken();
      }
    });
    return unsubscribe;
  }, [navigate]);

  const registerFcmToken = async () => {
    try {
      const token = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_IF_ANY' });
      console.log('FCM Token:', token);
    } catch (err) {
      console.warn('FCM Token error:', err.message);
    }
  };

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
        userEmail: auth.currentUser.email, // <-- Add this
      });
      setFitnessData(prev => [
        { steps, waterIntake, calories, timestamp: new Date() },
        ...prev.slice(0, 4),
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

        <Row className="mb-4 text-center">
          <Col>
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
                  <Form.Label>Calories Burned</Form.Label>
                  <Form.Control
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="success" className="w-100" disabled={isSaving}>
                  {isSaving ? <Spinner size="sm" animation="border" /> : 'Save'}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <h4>Recent Entries</h4>
            <Table striped bordered hover responsive variant={darkMode ? 'dark' : 'light'}>
              <thead>
                <tr>
                  <th>Steps</th>
                  <th>Water Intake (L)</th>
                  <th>Calories</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {fitnessData.map((data, idx) => (
                  <tr key={idx}>
                    <td>{data.steps}</td>
                    <td>{data.waterIntake}</td>
                    <td>{data.calories}</td>
                    <td>{new Date(data.timestamp?.seconds * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="text-center mt-3">
              <Button variant="info" onClick={() => navigate('/dashboard')}>View Dashboard</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

// ---------------------- Dashboard ----------------------

function Dashboard() {
  const [userStats, setUserStats] = useState([]);
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode')) || false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/', { replace: true });
      else fetchUserStats();
    });
    return unsubscribe;
  }, [navigate]);

  const fetchUserStats = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'fitnessData'));
      const entries = snapshot.docs.map((doc) => doc.data());

      const statsMap = {};

      entries.forEach(({ userEmail, steps, calories, waterIntake }) => {
        if (!statsMap[userEmail]) {
          statsMap[userEmail] = {
            steps: 0,
            calories: 0,
            waterIntake: 0,
          };
        }

        statsMap[userEmail].steps += Number(steps);
        statsMap[userEmail].calories += Number(calories);
        statsMap[userEmail].waterIntake += Number(waterIntake);
      });

      const aggregated = Object.entries(statsMap).map(([email, data], index) => ({
        srNo: index + 1,
        email,
        totalSteps: data.steps,
        totalCalories: data.calories,
        totalWaterIntake: data.waterIntake,
      }));

      setUserStats(aggregated);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  };

  const containerClass = darkMode ? 'bg-dark text-white min-vh-100' : 'bg-light text-dark min-vh-100';

  return (
    <div className={containerClass}>
      <Container className="py-4">
        <Row className="justify-content-between mb-3">
          <Col md="auto">
            <Button variant={darkMode ? 'light' : 'dark'} onClick={() => setDarkMode((prev) => !prev)}>
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Button>
          </Col>
          <Col md="auto">
            <Button variant="secondary" onClick={() => navigate('/fitness')}>Back to Tracker</Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <h2 className="text-center mb-4">User Fitness Summary 🧮</h2>
            <Table striped bordered hover variant={darkMode ? 'dark' : 'light'} responsive>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Name (Email)</th>
                  <th>Total Steps</th>
                  <th>Total Calories</th>
                  <th>Total Water Intake (L)</th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((user) => (
                  <tr key={user.email}>
                    <td>{user.srNo}</td>
                    <td>{user.email}</td>
                    <td>{user.totalSteps}</td>
                    <td>{user.totalCalories}</td>
                    <td>{user.totalWaterIntake}</td>
                  </tr>
                ))}
                {userStats.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">No data available</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

