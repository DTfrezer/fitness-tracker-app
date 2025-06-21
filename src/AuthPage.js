import React, { useState, useEffect } from 'react';
import { Button, Form, Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

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
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
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
                  {isLoading ? (
                    <Spinner size="sm" animation="border" className="me-2" />
                  ) : isSignUp ? 'Sign Up' : 'Sign In'}
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

export default AuthPage;
