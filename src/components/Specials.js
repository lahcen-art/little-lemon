import restaurantFood from "../img/restauranfood.jpg";
import greenSalad from "../img/green salad.jpg";

const specials = [
  { name: "Greek Salad", description: "Crisp lettuce, feta cheese, olives", price: "$12.99", image: greenSalad },
  { name: "Bruschetta", description: "Grilled bread with garlic & tomatoes", price: "$8.99", image: restaurantFood },
];

export default function Specials() {
  return (
    <section className="specials" aria-labelledby="specials-heading">
      <h2 id="specials-heading">This Week's Specials</h2>
      <div className="specials-grid" role="list" aria-label="Weekly special dishes">
        {specials.map((item) => (
          <article key={item.name} className="special-card" role="listitem">
            {item.image && (
              <img 
                src={item.image} 
                alt={`${item.name} - ${item.description}`} 
                className="special-image" 
              />
            )}
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <span className="price" aria-label={`Price: ${item.price}`}>{item.price}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
