import { Link } from "react-router-dom";
import hoursImage from "../img/hours.png";

export default function CallToAction() {
  return (
    <section className="cta">
      <div className="cta-content">
        <div className="cta-text">
          <h1>Little Lemon</h1>
          <p>Authentic Mediterranean cuisine in the heart of Chicago.</p>
          <Link to="/booking">
            <button>Reserve a Table</button>
          </Link>
        </div>
        <div className="cta-image">
          <img src={hoursImage} alt="Restaurant hours and atmosphere" />
        </div>
      </div>
    </section>
  );
}
