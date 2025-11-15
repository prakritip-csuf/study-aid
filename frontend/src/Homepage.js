import React from 'react';
import './Homepage.css';
import homepageImage from './homepage-image.jpg'; // Place your image in src or use an online URL

function Homepage() {
  return (
    <>
      <header className="homepage-header">
        <div className="container">
          <h1>Welcome to StudyAid</h1>
          <p>Your personal assistant for effective study planning and learning</p>
          <img className="homepage-image" src={homepageImage} alt="Study Aid" />
        </div>
      </header>
    </>
  );
}

export default Homepage;

