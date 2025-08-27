import food1 from "../img/food1.avif";

export default function Chicago() {
  return (
    <section className="chicago" aria-labelledby="about-heading">
      <div className="container">
        <div className="chicago-content">
          <div className="chicago-text">
            <h2 id="about-heading">Little Lemon</h2>
            <h3>Chicago</h3>
            <p>
              Little Lemon is a charming neighborhood bistro that serves simple food 
              and classic cocktails in a lively but casual environment. The restaurant 
              features a locally-sourced menu with daily specials.
            </p>
            <p>
              Founded by two Italian brothers, Adrian and Mario, Little Lemon has been 
              serving the Chicago community for over 20 years. We pride ourselves on 
              traditional recipes served with a modern twist, using only the freshest 
              ingredients sourced from local farms.
            </p>
            <p>
              Our warm and inviting atmosphere makes Little Lemon the perfect place 
              for a romantic dinner, family celebration, or casual meal with friends.
            </p>
          </div>
          <div className="chicago-images">
            <img 
              src={food1}
              alt="Beautifully plated Mediterranean dish featuring fresh ingredients and vibrant colors" 
              className="chicago-img-1"
            />
            {/* <img 
              src="/logo192.png" 
              alt="Little Lemon chefs" 
              className="chicago-img-2"
            /> */}
          </div>
        </div>
      </div>
    </section>
  );
}
