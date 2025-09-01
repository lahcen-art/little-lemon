import React from 'react';
import styles from './About.module.css';
import restaurantImage from '../assets/images/restaurant.jpg'; // Assuming you have an image in this path
import ownersImage from '../assets/images/mario-and-adrian.jpg'; // Assuming you have an image in this path

function About() {
  return (
    <div className={styles.aboutContainer}>
      <section className={styles.hero}>
        <h1>About Little Lemon</h1>
      </section>

      <section className={styles.content}>
        <div className={styles.textBlock}>
          <h2>Our Story</h2>
          <p>
            Founded by two childhood friends, Mario and Adrian, Little Lemon began as a shared dream. With a passion for the vibrant flavors of the Mediterranean and a love for their hometown of Chicago, they set out to create a unique dining experience. Our restaurant is a celebration of fresh ingredients, traditional recipes passed down through generations, and a modern culinary approach.
          </p>
          <p>
            We believe in the power of food to bring people together. Every dish on our menu is crafted with care, from our hand-made pasta to our locally-sourced produce. We invite you to join our family and taste the tradition.
          </p>
        </div>
        <div className={styles.imageBlock}>
          <img src={ownersImage} alt="Owners Mario and Adrian" className={styles.sideImage} />
        </div>
      </section>

       <section className={styles.contentReverse}>
        <div className={styles.imageBlock}>
          <img src={restaurantImage} alt="Inside the Little Lemon restaurant" className={styles.sideImage} />
        </div>
        <div className={styles.textBlock}>
          <h2>Our Philosophy</h2>
          <p>
            At Little Lemon, our philosophy is simple: authentic flavors and a warm, welcoming atmosphere. We are committed to sustainability and supporting our local community by partnering with local farmers and suppliers. Our goal is to provide a memorable dining experience that feels like coming home.
          </p>
        </div>
      </section>
    </div>
  );
}

export default About;