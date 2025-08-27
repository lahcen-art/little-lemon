const testimonials = [
  {
    id: 1,
    name: "Maria Rodriguez",
    rating: 5,
    review: "The Greek salad was absolutely delicious! Fresh ingredients and authentic Mediterranean flavors. Will definitely be back!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face&auto=format"
  },
  {
    id: 2,
    name: "John Smith",
    rating: 5,
    review: "Amazing atmosphere and incredible food. The bruschetta was the best I've ever had. Highly recommend Little Lemon!",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&auto=format"
  },
  {
    id: 3,
    name: "Sarah Johnson",
    rating: 4,
    review: "Great service and wonderful Mediterranean cuisine. The staff was very friendly and the food came out quickly.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&auto=format"
  },
  {
    id: 4,
    name: "David Chen",
    rating: 5,
    review: "Perfect place for a family dinner. The portions are generous and the flavors are authentic. Love this place!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&auto=format"
  }
];

export default function CustomersSay() {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span 
        key={index} 
        className={`star ${index < rating ? 'filled' : ''}`}
        aria-hidden="true"
      >
        ★
      </span>
    ));
  };

  return (
    <section className="customers-say" aria-labelledby="testimonials-heading">
      <div className="container">
        <h2 id="testimonials-heading">What Our Customers Say</h2>
        <div className="testimonials-grid" role="list" aria-label="Customer testimonials">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="testimonial-card" role="listitem">
              <div className="rating" aria-label={`${testimonial.rating} out of 5 stars`}>
                {renderStars(testimonial.rating)}
                <span className="sr-only">{testimonial.rating} out of 5 stars</span>
              </div>
              <blockquote className="review">
                <p>"{testimonial.review}"</p>
              </blockquote>
              <div className="customer-info">
                <img 
                  src={testimonial.image} 
                  alt={`Profile photo of ${testimonial.name}`}
                  className="customer-image"
                />
                <cite className="customer-name">{testimonial.name}</cite>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
