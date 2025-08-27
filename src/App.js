import { Routes, Route } from "react-router-dom";
import "./App.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import Logo from "./img/Logo.svg";

function App() {
  return (
    <div className="container">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header role="banner">
        <img src={Logo} alt="Little Lemon Restaurant Logo" className="logo" />
        <Nav />
      </header>
      <main id="main-content" role="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;


