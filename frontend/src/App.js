import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Header from './Header';
import Homepage from './Homepage';
import Flashcards from './Flashcards';
import AboutUs from './aboutUs';
import Quiz from './Quiz';
import Courses from './Courses';
import RequireAuth from './RequireAuth';
import LoginPage from './LoginPage';
import FlashcardSetView from './FlashcardSetView';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/flashcards" element={
            <RequireAuth>
              <Flashcards />
            </RequireAuth>
          } />
          <Route path="/flashcards/:id" element={
            <RequireAuth>
              <FlashcardSetView />
            </RequireAuth>
          } />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/quiz" element={
            <RequireAuth>
              <Quiz />
            </RequireAuth>
          } />
          <Route path="/courses" element={
            <RequireAuth>
              <Courses />
            </RequireAuth>
          } />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

