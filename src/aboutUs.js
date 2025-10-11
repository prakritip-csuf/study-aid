import React from 'react';
import './aboutUs.css';

function AboutUs() {
  return (
    <div className="about-root container my-4">
      <div className="rows">
        <div className="columns">
          <div className="note">
            <div className="containers">
              <h2>Prakriti Paudel</h2>
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
