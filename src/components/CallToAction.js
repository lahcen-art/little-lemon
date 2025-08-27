import { Link } from "react-router-dom";
import hoursImage from "../img/hours.png";

export default function CallToAction() {
  return (
    <section className="cta" aria-labelledby="hero-heading">
      <div className="cta-content">
        <div className="cta-text">
          <h2 id="hero-heading">Little Lemon</h2>
          <p className="subtitle">Chicago</p>
          <p>Authentic Mediterranean cuisine in the heart of Chicago.</p>
          <Link to="/booking" aria-label="Make a table reservation at Little Lemon">
            <button type="button">Reserve a Table</button>
          </Link>
        </div>
        <div className="cta-image">
          <img src={hoursImage} alt="Little Lemon restaurant interior showing warm lighting and cozy dining atmosphere" />
        </div>
      </div>
    </section>
  );
}
