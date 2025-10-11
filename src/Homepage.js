import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './Homepage.css';
import homepageImage from './homepage-image.jpg'; // Place your image in src or use an online URL
import Flashcards from './Flashcards';
import AboutUs from './aboutUs';

function Homepage() {
  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand href="#home">StudyAid</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#flashcard">Flashcard</Nav.Link>
              <Nav.Link href="#quiz">Quiz</Nav.Link>
              <Nav.Link href="#courses">Courses</Nav.Link>
              <Nav.Link href="#aboutUs">About Us</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <header className="homepage-header">
        <Container>
          <h1>Welcome to StudyAid</h1>
          <p>Your personal assistant for effective study planning and learning</p>
          <img className="homepage-image" src={homepageImage} alt="Study Aid" />
        </Container>
      </header>

      {/* Flashcards section: anchor target for #flashcard */}
      <section id="flashcard">
        <Flashcards />
      </section>

      {/* About Us section: anchor target for #aboutUs */}
      <section id="aboutUs">
        <AboutUs />
      </section>
    </>
  );
}

export default Homepage;

