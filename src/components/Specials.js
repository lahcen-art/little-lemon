import restaurantFood from "../img/restauranfood.jpg";
import greenSalad from "../img/green salad.jpg";

const specials = [
  { name: "Greek Salad", description: "Crisp lettuce, feta cheese, olives", price: "$12.99", image: greenSalad },
  { name: "Bruschetta", description: "Grilled bread with garlic & tomatoes", price: "$8.99", image: restaurantFood },
];

export default function Specials() {
  return (
    <section className="specials">
      <h2>This Week’s Specials</h2>
      <div className="specials-grid">
        {specials.map((item) => (
          <div key={item.name} className="special-card">
            {item.image && (
              <img src={item.image} alt={item.name} className="special-image" />
            )}
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <span>{item.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
