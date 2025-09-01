import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import BookingPage from '../pages/BookingPage';
import AboutPage from '../pages/AboutPage'; // 1. Make sure this import exists and the path is correct

const Main = () => {
  return (
    <main>
      <Routes>
        {/* This defines the route for your homepage */}
        <Route path="/" element={<HomePage />} />

        {/* This defines the route for your booking page */}
        <Route path="/booking" element={<BookingPage />} />

        {/* This is the crucial line that makes the about page work */}
        {/* It tells the app: "When the URL is '/about', show the AboutPage component." */}
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </main>
  );
};

export default Main;