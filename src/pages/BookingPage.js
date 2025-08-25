import { useState, useReducer, useEffect } from "react";

// Initial available times
const initialTimes = [
  { value: "09:00", label: "9:00 AM", available: true },
  { value: "10:00", label: "10:00 AM", available: true },
  { value: "11:00", label: "11:00 AM", available: true },
  { value: "12:00", label: "12:00 PM", available: true },
  { value: "13:00", label: "1:00 PM", available: true },
  { value: "14:00", label: "2:00 PM", available: true },
  { value: "15:00", label: "3:00 PM", available: true },
  { value: "16:00", label: "4:00 PM", available: true },
  { value: "17:00", label: "5:00 PM", available: true },
  { value: "18:00", label: "6:00 PM", available: true },
  { value: "19:00", label: "7:00 PM", available: true },
  { value: "20:00", label: "8:00 PM", available: true }
];

// Reducer for managing available times
function timesReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_AVAILABILITY':
      return state.map(time => ({
        ...time,
        available: action.date ? getTimeAvailability(time.value, action.date) : true
      }));
    case 'BOOK_TIME':
      return state.map(time => 
        time.value === action.timeValue 
          ? { ...time, available: false }
          : time
      );
    case 'RESET_TIMES':
      return initialTimes;
    default:
      return state;
  }
}

// Helper function to determine time availability based on date
function getTimeAvailability(timeValue, selectedDate) {
  const today = new Date();
  const selected = new Date(selectedDate);
  const timeHour = parseInt(timeValue.split(':')[0]);
  
  // If it's today, disable past times
  if (selected.toDateString() === today.toDateString()) {
    return timeHour > today.getHours();
  }
  
  // Weekend times (Saturday/Sunday) - limited availability
  if (selected.getDay() === 0 || selected.getDay() === 6) {
    return timeHour >= 11 && timeHour <= 20; // 11 AM - 8 PM on weekends
  }
  
  // Weekday times - full availability
  return timeHour >= 9 && timeHour <= 20; // 9 AM - 8 PM on weekdays
}

export default function BookingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2"
  });

  const [availableTimes, dispatch] = useReducer(timesReducer, initialTimes);
  
  // Initialize booking data from localStorage or use sample data
  const [bookingData, setBookingData] = useState(() => {
    try {
      const savedData = localStorage.getItem('bookingData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Failed to load booking data from localStorage:', error);
    }
    
    // Default sample data if localStorage is empty or corrupted
    return [
      {
        id: 1,
        name: "John Smith",
        email: "john@email.com",
        phone: "+212600123456",
        date: "2025-08-26",
        time: "19:00",
        guests: "4",
        status: "Confirmed",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@email.com",
        phone: "+212600789012",
        date: "2025-08-27",
        time: "18:00",
        guests: "2",
        status: "Confirmed",
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: "Mike Wilson",
        email: "mike@email.com",
        phone: "+212600345678",
        date: "2025-08-28",
        time: "20:00",
        guests: "6",
        status: "Pending",
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Save booking data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bookingData', JSON.stringify(bookingData));
    } catch (error) {
      console.error('Failed to save booking data to localStorage:', error);
    }
  }, [bookingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Update available times when date changes
    if (name === 'date') {
      dispatch({ type: 'UPDATE_AVAILABILITY', date: value });
      // Reset time selection if current time becomes unavailable
      setFormData(prev => ({ ...prev, time: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add new booking to the array
    const newBooking = {
      id: bookingData.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
      status: "Confirmed",
      createdAt: new Date().toISOString()
    };
    
    setBookingData([...bookingData, newBooking]);
    
    alert(`Booking confirmed for ${formData.name} on ${formData.date} at ${formData.time} for ${formData.guests} guests!`);
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      guests: "2"
    });
  };

  return (
    <section className="booking-page">
      <h1>Reserve a Table</h1>
      <p>Book your table at Little Lemon for an unforgettable Mediterranean dining experience.</p>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="[0-9]{10}"
            maxLength="10"
            placeholder="+212600000000"
            title="Please enter your phone number!"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time *</label>
            <select
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            >
              <option value="">Select time</option>
              {availableTimes.map(time => (
                <option 
                  key={time.value} 
                  value={time.value}
                  disabled={!time.available}
                  style={{ 
                    color: time.available ? 'inherit' : '#999',
                    fontStyle: time.available ? 'normal' : 'italic'
                  }}
                >
                  {time.label} {!time.available ? '(Unavailable)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="guests">Number of Guests *</label>
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5 Guests</option>
              <option value="6">6 Guests</option>
              <option value="7">7 Guests</option>
              <option value="8">8 Guests</option>
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Confirm Reservation
        </button>
      </form>

      {/* Booking Data Table */}
      <section className="bookings-table-section">
        <h2>Current Reservations</h2>
        <div className="table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Guests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingData.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.name}</td>
                  <td>{booking.email}</td>
                  <td>{booking.phone}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{booking.time}</td>
                  <td>{booking.guests}</td>
                  <td>
                    <span className={`status ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
