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

// Helper function to validate date input
function validateDate(dateString) {
  if (!dateString) {
    return "Date is required";
  }

  const selectedDate = new Date(dateString);
  const today = new Date();
  const maxDate = new Date();
  
  // Set today to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  
  // Set maximum date to 3 months from today
  maxDate.setMonth(maxDate.getMonth() + 3);
  maxDate.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime())) {
    return "Please enter a valid date";
  }

  if (selectedDate < today) {
    return "Please select a date from today onwards";
  }

  if (selectedDate > maxDate) {
    return "Reservations can only be made up to 3 months in advance";
  }

  // Check if the selected date is a valid restaurant day
  // Assuming restaurant is closed on Mondays (day 1)
  if (selectedDate.getDay() === 1) {
    return "Sorry, we are closed on Mondays. Please select another date";
  }

  return ""; // No error
}

// Helper function to validate name input
function validateName(nameString) {
  if (!nameString || nameString.trim() === "") {
    return "Name is required";
  }
  
  if (nameString.trim().length < 2) {
    return "Name must be at least 2 characters long";
  }
  
  if (nameString.trim().length > 50) {
    return "Name must be less than 50 characters";
  }
  
  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(nameString.trim())) {
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  }
  
  return ""; // No error
}

// Helper function to validate email input
function validateEmail(emailString) {
  if (!emailString || emailString.trim() === "") {
    return "Email is required";
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailString.trim())) {
    return "Please enter a valid email address";
  }
  
  if (emailString.trim().length > 100) {
    return "Email must be less than 100 characters";
  }
  
  return ""; // No error
}

// Helper function to validate phone input
function validatePhone(phoneString) {
  if (!phoneString || phoneString.trim() === "") {
    return "Phone number is required";
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phoneString.replace(/\D/g, '');
  
  // Check for valid phone number length (10-15 digits)
  if (digitsOnly.length < 10) {
    return "Phone number must be at least 10 digits";
  }
  
  if (digitsOnly.length > 15) {
    return "Phone number must be less than 15 digits";
  }
  
  // Check for valid phone format (supports various international formats)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(digitsOnly)) {
    return "Please enter a valid phone number";
  }
  
  return ""; // No error
}

// Helper function to validate select elements
function validateSelect(value, fieldName, options = {}) {
  if (!value || value === "" || value === "default") {
    return `${fieldName} is required`;
  }
  
  // Check if value is in allowed options (for security)
  if (options.allowedValues && !options.allowedValues.includes(value)) {
    return `Invalid ${fieldName.toLowerCase()} selection`;
  }
  
  return ""; // No error
}

// Helper function to validate time input
function validateTime(timeString, dateString) {
  // First validate as select element
  const selectError = validateSelect(timeString, "Time", {
    allowedValues: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]
  });
  
  if (selectError) {
    return selectError;
  }

  if (!dateString) {
    return "Please select a date first";
  }

  const selectedDate = new Date(dateString);
  const today = new Date();
  const timeHour = parseInt(timeString.split(':')[0]);
  const timeMinute = parseInt(timeString.split(':')[1]);
  
  // Check if date is valid first
  if (isNaN(selectedDate.getTime())) {
    return "Please select a valid date first";
  }

  // Check restaurant operating hours based on day of week
  const dayOfWeek = selectedDate.getDay();
  
  // Weekend hours (Saturday/Sunday): 11 AM - 8 PM
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (timeHour < 11 || timeHour > 20) {
      return "Weekend hours are 11:00 AM - 8:00 PM";
    }
  } else {
    // Weekday hours: 9 AM - 8 PM (excluding Monday which is closed)
    if (timeHour < 9 || timeHour > 20) {
      return "Weekday hours are 9:00 AM - 8:00 PM";
    }
  }

  // If it's today, check if the time has already passed
  if (selectedDate.toDateString() === today.toDateString()) {
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    if (timeHour < currentHour || (timeHour === currentHour && timeMinute <= currentMinute)) {
      return "Please select a future time for today";
    }
    
    // Add buffer time - no reservations within 2 hours of current time
    const bufferHours = 2;
    if (timeHour < currentHour + bufferHours) {
      return `Reservations require at least ${bufferHours} hours advance notice`;
    }
  }

  // Check for lunch break (2:30 PM - 4:00 PM on weekdays)
  if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
    if ((timeHour === 14 && timeMinute >= 30) || (timeHour === 15) || (timeHour === 16 && timeMinute === 0)) {
      return "Kitchen is closed from 2:30 PM - 4:00 PM for lunch break";
    }
  }

  return ""; // No error
}

// Helper function to validate guest count
function validateGuests(guestsString, dateString, timeString) {
  // First validate as select element
  const selectError = validateSelect(guestsString, "Number of guests", {
    allowedValues: ["1", "2", "3", "4", "5", "6", "7", "8"]
  });
  
  if (selectError) {
    return selectError;
  }

  const guestCount = parseInt(guestsString);
  
  if (isNaN(guestCount) || guestCount < 1) {
    return "Please enter a valid number of guests";
  }

  // Minimum party size
  if (guestCount < 1) {
    return "Minimum party size is 1 guest";
  }

  // Maximum party size for regular tables
  if (guestCount > 8) {
    return "For parties larger than 8 guests, please call us directly at +212 600 000 000";
  }

  // Large party restrictions (6+ guests)
  if (guestCount >= 6) {
    if (!dateString) {
      return "Please select a date first";
    }

    const selectedDate = new Date(dateString);
    const dayOfWeek = selectedDate.getDay();
    
    // Large parties not allowed on weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "Large parties (6+ guests) are not available on weekends. Please select a weekday";
    }

    // Large parties require specific time slots
    if (timeString) {
      const timeHour = parseInt(timeString.split(':')[0]);
      
      // Large parties only during off-peak hours
      if (timeHour >= 18 && timeHour <= 20) {
        return "Large parties (6+ guests) are not available during peak hours (6-8 PM). Please select an earlier time";
      }
    }

    // Large parties require advance booking
    if (dateString) {
      const today = new Date();
      const bookingDate = new Date(dateString);
      const daysDifference = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysDifference < 2) {
        return "Large parties (6+ guests) require at least 2 days advance booking";
      }
    }
  }

  // Special validation for single diners
  if (guestCount === 1) {
    if (timeString) {
      const timeHour = parseInt(timeString.split(':')[0]);
      
      // Single diners encouraged during off-peak hours
      if (timeHour >= 19 && timeHour <= 20) {
        return "Single diner reservations during peak hours (7-8 PM) may have limited availability. Consider an earlier time for better seating options";
      }
    }
  }

  return ""; // No error
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

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [guestsError, setGuestsError] = useState("");
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

    // Validate input fields in real-time
    if (name === 'name') {
      const error = validateName(value);
      setNameError(error);
    } else if (name === 'email') {
      const error = validateEmail(value);
      setEmailError(error);
    } else if (name === 'phone') {
      const error = validatePhone(value);
      setPhoneError(error);
    } else if (name === 'date') {
      const error = validateDate(value);
      setDateError(error);
      
      if (!error) {
        dispatch({ type: 'UPDATE_AVAILABILITY', date: value });
        // Reset time selection if current time becomes unavailable
        setFormData(prev => ({ ...prev, time: "" }));
        setTimeError(""); // Clear time error when date changes
      } else {
        // Clear time selection if date is invalid
        setFormData(prev => ({ ...prev, time: "" }));
        setTimeError(""); // Clear time error
        dispatch({ type: 'RESET_TIMES' });
      }
    }

    // Validate time input when time changes
    if (name === 'time') {
      const error = validateTime(value, formData.date);
      setTimeError(error);
      
      // Re-validate guests when time changes (affects large party and single diner rules)
      if (formData.guests) {
        const guestsError = validateGuests(formData.guests, formData.date, value);
        setGuestsError(guestsError);
      }
    }

    // Validate guest count when it changes
    if (name === 'guests') {
      const error = validateGuests(value, formData.date, formData.time);
      setGuestsError(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all form fields before submission
    const nameValidationError = validateName(formData.name);
    const emailValidationError = validateEmail(formData.email);
    const phoneValidationError = validatePhone(formData.phone);
    const dateValidationError = validateDate(formData.date);
    const timeValidationError = validateTime(formData.time, formData.date);
    const guestsValidationError = validateGuests(formData.guests, formData.date, formData.time);
    
    // Set all errors at once for better UX
    setNameError(nameValidationError);
    setEmailError(emailValidationError);
    setPhoneError(phoneValidationError);
    setDateError(dateValidationError);
    setTimeError(timeValidationError);
    setGuestsError(guestsValidationError);
    
    if (nameValidationError) {
      alert("Please fix the name error before submitting.");
      return;
    }
    
    if (emailValidationError) {
      alert("Please fix the email error before submitting.");
      return;
    }
    
    if (phoneValidationError) {
      alert("Please fix the phone error before submitting.");
      return;
    }
    
    if (dateValidationError) {
      alert("Please fix the date error before submitting.");
      return;
    }
    
    if (timeValidationError) {
      alert("Please fix the time error before submitting.");
      return;
    }
    
    if (guestsValidationError) {
      alert("Please fix the guest count error before submitting.");
      return;
    }
    
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
    
    // Reset form and clear errors
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      guests: "2"
    });
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setDateError("");
    setTimeError("");
    setGuestsError("");
  };

  return (
    <>
      <section className="booking-page" aria-labelledby="booking-heading">
        <h1 id="booking-heading">Reserve a Table</h1>
        <p>Book your table at Little Lemon for an unforgettable Mediterranean dining experience.</p>
        
        <form onSubmit={handleSubmit} className="booking-form" noValidate aria-describedby="form-instructions">
          <p id="form-instructions" className="sr-only">All fields marked with an asterisk (*) are required. Form validation will provide real-time feedback as you complete each field.</p>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={nameError ? 'error' : ''}
              aria-describedby={nameError ? 'name-error' : undefined}
              aria-invalid={nameError ? 'true' : 'false'}
              required
            />
            {nameError && <span id="name-error" className="error-message" role="alert">{nameError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={emailError ? 'error' : ''}
              aria-describedby={emailError ? 'email-error' : undefined}
              aria-invalid={emailError ? 'true' : 'false'}
              required
            />
            {emailError && <span id="email-error" className="error-message" role="alert">{emailError}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={phoneError ? 'error' : ''}
              aria-describedby={phoneError ? 'phone-error' : undefined}
              aria-invalid={phoneError ? 'true' : 'false'}
              required
            />
            {phoneError && <span id="phone-error" className="error-message" role="alert">{phoneError}</span>}
          </div>

          <fieldset className="form-row">
            <legend className="sr-only">Reservation Details</legend>
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                max={(() => {
                  const maxDate = new Date();
                  maxDate.setMonth(maxDate.getMonth() + 3);
                  return maxDate.toISOString().split('T')[0];
                })()}
                className={dateError ? 'error' : ''}
                aria-describedby={dateError ? 'date-error' : undefined}
                aria-invalid={dateError ? 'true' : 'false'}
                required
              />
              {dateError && <span id="date-error" className="error-message" role="alert">{dateError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={timeError ? 'error' : ''}
                aria-describedby={timeError ? 'time-error' : undefined}
                aria-invalid={timeError ? 'true' : 'false'}
                required
              >
                <option value="">Select time</option>
                {availableTimes.map(time => (
                  <option 
                    key={time.value} 
                    value={time.value}
                    disabled={!time.available}
                  >
                    {time.label} {!time.available ? '(Unavailable)' : ''}
                  </option>
                ))}
              </select>
              {timeError && <span id="time-error" className="error-message" role="alert">{timeError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="guests">Number of Guests *</label>
              <select
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                className={guestsError ? 'error' : ''}
                aria-describedby={guestsError ? 'guests-error' : undefined}
                aria-invalid={guestsError ? 'true' : 'false'}
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
              {guestsError && <span id="guests-error" className="error-message" role="alert">{guestsError}</span>}
            </div>
          </fieldset>

          <button type="submit" className="submit-btn" aria-describedby="submit-help">
            Confirm Reservation
          </button>
          <p id="submit-help" className="sr-only">Click to submit your reservation request. All required fields must be completed before submission.</p>
        </form>

      </section>
      
      <section className="bookings-table-section" aria-labelledby="reservations-heading">
        <h2 id="reservations-heading">Current Reservations</h2>
        <div className="table-container" role="region" aria-label="Reservations data table" tabIndex="0">
          <table className="bookings-table" role="table">
            <caption className="sr-only">List of current restaurant reservations with booking details and status</caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Guests</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookingData.map(booking => (
                <tr key={booking.id}>
                  <th scope="row">{booking.id}</th>
                  <td>{booking.name}</td>
                  <td>{booking.email}</td>
                  <td>{booking.phone}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{booking.time}</td>
                  <td>{booking.guests}</td>
                  <td>
                    <span className={`status ${booking.status.toLowerCase()}`} aria-label={`Reservation status: ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
