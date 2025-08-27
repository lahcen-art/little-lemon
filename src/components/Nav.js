import { Link } from "react-router-dom";

// SVG Icons Components
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AboutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z" fill="currentColor"/>
    <path d="M21 5V7H15V5H21Z" fill="currentColor"/>
    <path d="M21 11V13H15V11H21Z" fill="currentColor"/>
    <path d="M21 17V19H15V17H21Z" fill="currentColor"/>
    <path d="M13 9V22H11V9H13Z" fill="currentColor"/>
    <path d="M9 11V13H3V11H9Z" fill="currentColor"/>
    <path d="M9 17V19H3V17H9Z" fill="currentColor"/>
  </svg>
);

const ReservationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OrderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1046 17.8954 19 19 19C20.1046 19 21 18.1046 21 17C21 15.8954 20.1046 15 19 15H17ZM9 19C10.1046 19 11 18.1046 11 17C11 15.8954 10.1046 15 9 15C7.89543 15 7 15.8954 7 17C7 18.1046 7.89543 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15M10 17L15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Nav() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <ul>
        <li>
          <Link to="/" aria-label="Go to homepage">
            <HomeIcon aria-hidden="true" />
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link to="/#about" aria-label="Learn about Little Lemon">
            <AboutIcon aria-hidden="true" />
            <span>About</span>
          </Link>
        </li>
        <li>
          <Link to="/#menu" aria-label="View our menu">
            <MenuIcon aria-hidden="true" />
            <span>Menu</span>
          </Link>
        </li>
        <li>
          <Link to="/booking" aria-label="Make a reservation">
            <ReservationIcon aria-hidden="true" />
            <span>Reservations</span>
          </Link>
        </li>
        <li>
          <Link to="/#contact" aria-label="Order food online">
            <OrderIcon aria-hidden="true" />
            <span>Order Online</span>
          </Link>
        </li>
        <li>
          <Link to="/#contact" aria-label="Login to your account">
            <LoginIcon aria-hidden="true" />
            <span>Login</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
