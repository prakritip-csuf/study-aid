import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Homepage.css';

function Header() {
  const { isLoggedIn, logout, setShowLoginModal } = useAuth();

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">StudyAid</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/flashcards">Flashcards</Nav.Link>
            <Nav.Link as={Link} to="/quiz">Quizzes</Nav.Link>
            <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
            <Nav.Link as={Link} to="/about">About Us</Nav.Link>
          </Nav>
          {!isLoggedIn ? (
            <Button
              variant="outline-light"
              className="ms-2"
              onClick={() => setShowLoginModal(true)}
            >
              Login
            </Button>
          ) : (
            <Button variant="outline-light" className="ms-2" onClick={logout}>
              Logout
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
