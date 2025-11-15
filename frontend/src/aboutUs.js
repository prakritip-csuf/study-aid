import React from 'react';
import './aboutUs.css';

function AboutUs() {
  return (
    <div className="about-root container my-4">
      {/* Story Section */}
      <div className="story-section mb-5 p-4 bg-light rounded shadow-sm">
        <h2>Our Story</h2>
        <p>
          StudyAid was created by a group of passionate students who wanted to make studying easier and more effective for everyone. We noticed that many of our peers struggled to organize their notes, prepare for exams, and stay motivated. Our goal was to build a simple, user-friendly platform that helps students create flashcards and quizzes all in one place. We hope StudyAid empowers you to reach your academic goals and makes learning a more enjoyable experience!
        </p>
      </div>

      <div className="rows">
        <div className="columns">
          <div className="note">
            <div className="containers">
              <h2>Prakriti Paudel</h2>
              <p className="title">Team Member</p>
              <p>Some text that describes me</p>
              <p>prakritip@csu.fullerton.edu</p>
              <p>
                <button className="buttons">Contact</button>
              </p>
            </div>
          </div>
        </div>
        <div className="columns">
          <div className="notes">
            <div className="containers">
              <h2>Manny Sawhney</h2>
              <p className="title">Team Member</p>
              <p>Some text that describes me</p>
              <p>example@example.com</p>
              <p>
                <button className="buttons">Contact</button>
              </p>
            </div>
          </div>
        </div>
        <div className="columns">
          <div className="notes">
            <div className="containers">
              <h2>Dania Nasereddin</h2>
              <p className="title">Team Member</p>
              <p>I am a computer science graduate at CSUF. I love playing video games, walking my dog, and painting in my free time!</p>
              <p>dnasereddin@csu.fullerton.edu</p>
              <p>
                <button className="buttons">Contact</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
