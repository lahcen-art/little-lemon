const testimonials = [
  {
    id: 1,
    name: "Maria Rodriguez",
    rating: 5,
    review: "The Greek salad was absolutely delicious! Fresh ingredients and authentic Mediterranean flavors. Will definitely be back!",
    image: "/logo192.png" // Placeholder image
  },
  {
    id: 2,
    name: "John Smith",
    rating: 5,
    review: "Amazing atmosphere and incredible food. The bruschetta was the best I've ever had. Highly recommend Little Lemon!",
    image: "/logo192.png" // Placeholder image
  },
  {
    id: 3,
    name: "Sarah Johnson",
    rating: 4,
    review: "Great service and wonderful Mediterranean cuisine. The staff was very friendly and the food came out quickly.",
    image: "/logo192.png" // Placeholder image
  },
  {
    id: 4,
    name: "David Chen",
    rating: 5,
    review: "Perfect place for a family dinner. The portions are generous and the flavors are authentic. Love this place!",
    image: "/logo192.png" // Placeholder image
  }
];

export default function CustomersSay() {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <section className="customers-say">
      <div className="container">
        <h2>What Our Customers Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="rating">
                {renderStars(testimonial.rating)}
              </div>
              <p className="review">"{testimonial.review}"</p>
              <div className="customer-info">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="customer-image"
                />
                <span className="customer-name">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
