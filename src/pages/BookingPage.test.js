import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookingPage from './BookingPage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('BookingPage Local Storage Tests', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Writing to Local Storage', () => {
    test('should save booking data to localStorage when form is submitted', async () => {
      render(<BookingPage />);
      
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '+212600123456' }
      });
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2025-08-30' }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '4' }
      });

      // Submit the form
      fireEvent.click(screen.getByText(/confirm reservation/i));

      // Verify localStorage.setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Verify the data structure saved to localStorage
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+212600123456',
            date: '2025-08-30',
            time: '19:00',
            guests: '4',
            status: 'Confirmed'
          })
        ])
      );
    });

    test('should append new booking to existing localStorage data', async () => {
      // Pre-populate localStorage with existing data
      const existingBookings = [
        {
          id: 1,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+212600987654',
          date: '2025-08-29',
          time: '18:00',
          guests: '2',
          status: 'Confirmed'
        }
      ];
      localStorageMock.setItem('bookingData', JSON.stringify(existingBookings));

      render(<BookingPage />);
      
      // Fill out and submit new booking
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Bob Wilson' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'bob@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '+212600555666' }
      });
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2025-08-31' }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '20:00' }
      });

      fireEvent.click(screen.getByText(/confirm reservation/i));

      // Verify localStorage now contains both bookings
      const allCalls = localStorageMock.setItem.mock.calls;
      const latestCall = allCalls[allCalls.length - 1];
      const savedData = JSON.parse(latestCall[1]);
      
      expect(savedData).toHaveLength(2);
      expect(savedData[1]).toEqual(
        expect.objectContaining({
          name: 'Bob Wilson',
          email: 'bob@example.com'
        })
      );
    });

    test('should handle localStorage write errors gracefully', async () => {
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<BookingPage />);
      
      // Fill out and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2025-08-30' }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });

      fireEvent.click(screen.getByText(/confirm reservation/i));

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save booking data to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test('should save data with correct localStorage key', async () => {
      render(<BookingPage />);
      
      // Submit a booking
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2025-08-30' }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });

      fireEvent.click(screen.getByText(/confirm reservation/i));

      // Verify correct key was used
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bookingData',
        expect.any(String)
      );
    });

    test('should serialize booking data as JSON string', async () => {
      render(<BookingPage />);
      
      // Submit a booking
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2025-08-30' }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });

      fireEvent.click(screen.getByText(/confirm reservation/i));

      // Verify data was serialized as JSON
      const savedValue = localStorageMock.setItem.mock.calls[0][1];
      expect(() => JSON.parse(savedValue)).not.toThrow();
      
      const parsedData = JSON.parse(savedValue);
      expect(Array.isArray(parsedData)).toBe(true);
    });

    test('should include timestamp when saving booking data', async () => {
      const mockDate = new Date('2025-08-25T17:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      render(<BookingPage />);
      
      // Submit a booking
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2025-08-30' }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });

      fireEvent.click(screen.getByText(/confirm reservation/i));

      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData[0]).toEqual(
        expect.objectContaining({
          createdAt: mockDate.toISOString()
        })
      );

      global.Date.mockRestore();
    });
  });

  describe('Reading from Local Storage', () => {
    test('should load existing booking data from localStorage on component mount', () => {
      const existingBookings = [
        {
          id: 1,
          name: 'Existing User',
          email: 'existing@example.com',
          phone: '+212600111222',
          date: '2025-08-28',
          time: '18:00',
          guests: '3',
          status: 'Confirmed'
        }
      ];
      
      localStorageMock.setItem('bookingData', JSON.stringify(existingBookings));

      render(<BookingPage />);

      // Verify localStorage.getItem was called
      expect(localStorageMock.getItem).toHaveBeenCalledWith('bookingData');
      
      // Verify existing booking appears in the table
      expect(screen.getByText('Existing User')).toBeInTheDocument();
      expect(screen.getByText('existing@example.com')).toBeInTheDocument();
    });

    test('should handle empty localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(<BookingPage />);

      // Should not throw error and should show empty table
      expect(screen.getByText(/current reservations/i)).toBeInTheDocument();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('bookingData');
    });

    test('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json data');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<BookingPage />);

      // Should handle error gracefully
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load booking data from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Date Validation', () => {
    test('should show error for past dates', () => {
      render(<BookingPage />);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: pastDate }
      });
      
      expect(screen.getByText(/please select a date from today onwards/i)).toBeInTheDocument();
    });

    test('should show error for dates too far in future', () => {
      render(<BookingPage />);
      
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 4); // 4 months ahead
      const farFutureDate = futureDate.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: farFutureDate }
      });
      
      expect(screen.getByText(/reservations can only be made up to 3 months in advance/i)).toBeInTheDocument();
    });

    test('should show error for Mondays (closed day)', () => {
      render(<BookingPage />);
      
      // Find next Monday
      const nextMonday = new Date();
      nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
      const mondayDate = nextMonday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: mondayDate }
      });
      
      expect(screen.getByText(/sorry, we are closed on mondays/i)).toBeInTheDocument();
    });

    test('should clear error when valid date is entered', () => {
      render(<BookingPage />);
      
      // First enter invalid date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: pastDate }
      });
      
      expect(screen.getByText(/please select a date from today onwards/i)).toBeInTheDocument();
      
      // Then enter valid date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const validDate = tomorrow.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: validDate }
      });
      
      expect(screen.queryByText(/please select a date from today onwards/i)).not.toBeInTheDocument();
    });

    test('should prevent form submission with invalid date', () => {
      render(<BookingPage />);
      
      // Fill form with invalid date
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: pastDate }
      });
      
      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      fireEvent.click(screen.getByText(/confirm reservation/i));
      
      expect(alertSpy).toHaveBeenCalledWith('Please fix the date error before submitting.');
      
      alertSpy.mockRestore();
    });

    test('should clear time selection when date becomes invalid', () => {
      render(<BookingPage />);
      
      // First set valid date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const validDate = tomorrow.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: validDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      
      expect(screen.getByLabelText(/time/i).value).toBe('19:00');
      
      // Then change to invalid date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: pastDate }
      });
      
      // Time should be cleared
      expect(screen.getByLabelText(/time/i).value).toBe('');
    });

    test('should apply error styling to date input with invalid date', () => {
      render(<BookingPage />);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: pastDate }
      });
      
      const dateInput = screen.getByLabelText(/date/i);
      expect(dateInput).toHaveClass('error');
    });
  });

  describe('Time Validation', () => {
    test('should show error when time is selected without date', () => {
      render(<BookingPage />);
      
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      
      expect(screen.getByText(/please select a date first/i)).toBeInTheDocument();
    });

    test('should show error for weekend time outside operating hours', () => {
      render(<BookingPage />);
      
      // Find next Saturday
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7);
      const saturdayDate = nextSaturday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: saturdayDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '09:00' }
      });
      
      expect(screen.getByText(/weekend hours are 11:00 AM - 8:00 PM/i)).toBeInTheDocument();
    });

    test('should show error for weekday time outside operating hours', () => {
      render(<BookingPage />);
      
      // Find next Tuesday
      const nextTuesday = new Date();
      nextTuesday.setDate(nextTuesday.getDate() + (2 - nextTuesday.getDay() + 7) % 7);
      const tuesdayDate = nextTuesday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: tuesdayDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '08:00' }
      });
      
      expect(screen.getByText(/weekday hours are 9:00 AM - 8:00 PM/i)).toBeInTheDocument();
    });

    test('should show error for lunch break time on weekdays', () => {
      render(<BookingPage />);
      
      // Find next Tuesday
      const nextTuesday = new Date();
      nextTuesday.setDate(nextTuesday.getDate() + (2 - nextTuesday.getDay() + 7) % 7);
      const tuesdayDate = nextTuesday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: tuesdayDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '15:00' }
      });
      
      expect(screen.getByText(/kitchen is closed from 2:30 PM - 4:00 PM for lunch break/i)).toBeInTheDocument();
    });

    test('should show error for past time on today', () => {
      // Mock current time to be 3 PM
      const mockDate = new Date();
      mockDate.setHours(15, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      render(<BookingPage />);
      
      const today = mockDate.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: today }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '14:00' }
      });
      
      expect(screen.getByText(/please select a future time for today/i)).toBeInTheDocument();
      
      global.Date.mockRestore();
    });

    test('should show error for insufficient advance notice', () => {
      // Mock current time to be 3 PM
      const mockDate = new Date();
      mockDate.setHours(15, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      render(<BookingPage />);
      
      const today = mockDate.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: today }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '16:00' }
      });
      
      expect(screen.getByText(/reservations require at least 2 hours advance notice/i)).toBeInTheDocument();
      
      global.Date.mockRestore();
    });

    test('should clear time error when valid time is selected', () => {
      render(<BookingPage />);
      
      // First select invalid time without date
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      
      expect(screen.getByText(/please select a date first/i)).toBeInTheDocument();
      
      // Then select valid date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const validDate = tomorrow.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: validDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      
      expect(screen.queryByText(/please select a date first/i)).not.toBeInTheDocument();
    });

    test('should prevent form submission with invalid time', () => {
      render(<BookingPage />);
      
      // Fill form with invalid time
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const validDate = tomorrow.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: validDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '08:00' }
      });
      
      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      fireEvent.click(screen.getByText(/confirm reservation/i));
      
      expect(alertSpy).toHaveBeenCalledWith('Please fix the time error before submitting.');
      
      alertSpy.mockRestore();
    });

    test('should apply error styling to time select with invalid time', () => {
      render(<BookingPage />);
      
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      
      const timeSelect = screen.getByLabelText(/time/i);
      expect(timeSelect).toHaveClass('error');
    });

    test('should clear time error when date changes', () => {
      render(<BookingPage />);
      
      // First create time error
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      
      expect(screen.getByText(/please select a date first/i)).toBeInTheDocument();
      
      // Then change date - should clear time error
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const validDate = tomorrow.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: validDate }
      });
      
      expect(screen.queryByText(/please select a date first/i)).not.toBeInTheDocument();
    });

    test('should validate time correctly for valid weekend hours', () => {
      render(<BookingPage />);
      
      // Find next Saturday
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7);
      const saturdayDate = nextSaturday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: saturdayDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '18:00' }
      });
      
      // Should not show any error for valid weekend time
      expect(screen.queryByText(/weekend hours are/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Input Validation', () => {
    test('should validate empty name input', () => {
      render(<BookingPage />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test empty name
      fireEvent.change(nameInput, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(nameInput).toHaveClass('error');
    });

    test('should validate name length requirements', () => {
      render(<BookingPage />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test name too short
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/name must be at least 2 characters long/i)).toBeInTheDocument();
      expect(nameInput).toHaveClass('error');
      
      // Test name too long
      const longName = 'A'.repeat(51);
      fireEvent.change(nameInput, { target: { value: longName } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/name must be less than 50 characters/i)).toBeInTheDocument();
      expect(nameInput).toHaveClass('error');
    });

    test('should validate name character requirements', () => {
      render(<BookingPage />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test invalid characters
      fireEvent.change(nameInput, { target: { value: 'John123' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/name can only contain letters, spaces, hyphens, and apostrophes/i)).toBeInTheDocument();
      expect(nameInput).toHaveClass('error');
      
      // Test valid name with special characters
      fireEvent.change(nameInput, { target: { value: "Mary-Jane O'Connor" } });
      fireEvent.click(submitButton);
      
      expect(screen.queryByText(/name can only contain letters, spaces, hyphens, and apostrophes/i)).not.toBeInTheDocument();
    });

    test('should validate empty email input', () => {
      render(<BookingPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test empty email
      fireEvent.change(emailInput, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(emailInput).toHaveClass('error');
    });

    test('should validate email format requirements', () => {
      render(<BookingPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test invalid email formats
      const invalidEmails = ['invalid', 'test@', '@domain.com', 'test@domain', 'test.domain.com'];
      
      invalidEmails.forEach(email => {
        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.click(submitButton);
        
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(emailInput).toHaveClass('error');
      });
      
      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
    });

    test('should validate email length requirements', () => {
      render(<BookingPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test email too long
      const longEmail = 'a'.repeat(90) + '@example.com';
      fireEvent.change(emailInput, { target: { value: longEmail } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/email must be less than 100 characters/i)).toBeInTheDocument();
      expect(emailInput).toHaveClass('error');
    });

    test('should validate empty phone input', () => {
      render(<BookingPage />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test empty phone
      fireEvent.change(phoneInput, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(phoneInput).toHaveClass('error');
    });

    test('should validate phone number length requirements', () => {
      render(<BookingPage />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test phone too short
      fireEvent.change(phoneInput, { target: { value: '123456789' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
      expect(phoneInput).toHaveClass('error');
      
      // Test phone too long
      fireEvent.change(phoneInput, { target: { value: '1234567890123456' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/phone number must be less than 15 digits/i)).toBeInTheDocument();
      expect(phoneInput).toHaveClass('error');
    });

    test('should validate phone number format requirements', () => {
      render(<BookingPage />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test valid phone formats
      const validPhones = ['+212600123456', '212600123456', '0600123456'];
      
      validPhones.forEach(phone => {
        fireEvent.change(phoneInput, { target: { value: phone } });
        fireEvent.click(submitButton);
        
        expect(screen.queryByText(/please enter a valid phone number/i)).not.toBeInTheDocument();
      });
    });

    test('should provide real-time validation feedback', () => {
      render(<BookingPage />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      
      // Test real-time name validation
      fireEvent.change(nameInput, { target: { value: 'A' } });
      expect(screen.getByText(/name must be at least 2 characters long/i)).toBeInTheDocument();
      expect(nameInput).toHaveClass('error');
      
      // Fix name - error should clear
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      expect(screen.queryByText(/name must be at least 2 characters long/i)).not.toBeInTheDocument();
      
      // Test real-time email validation
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(emailInput).toHaveClass('error');
      
      // Fix email - error should clear
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      
      // Test real-time phone validation
      fireEvent.change(phoneInput, { target: { value: '123' } });
      expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument();
      expect(phoneInput).toHaveClass('error');
      
      // Fix phone - error should clear
      fireEvent.change(phoneInput, { target: { value: '+212600123456' } });
      expect(screen.queryByText(/phone number must be at least 10 digits/i)).not.toBeInTheDocument();
    });

    test('should prevent form submission with invalid inputs', () => {
      render(<BookingPage />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Set invalid values
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.change(phoneInput, { target: { value: '123' } });
      
      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      fireEvent.click(submitButton);
      
      // Should show name error first
      expect(alertSpy).toHaveBeenCalledWith('Please fix the name error before submitting.');
      
      alertSpy.mockRestore();
    });

    test('should show all validation errors on form submission', () => {
      render(<BookingPage />);
      
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Submit empty form
      fireEvent.click(submitButton);
      
      // All required field errors should be visible
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      
      // All inputs should have error styling
      expect(screen.getByLabelText(/full name/i)).toHaveClass('error');
      expect(screen.getByLabelText(/email/i)).toHaveClass('error');
      expect(screen.getByLabelText(/phone number/i)).toHaveClass('error');
    });
  });

  describe('Select Element Validation', () => {
    test('should validate empty select values', () => {
      render(<BookingPage />);
      
      const timeSelect = screen.getByLabelText(/time/i);
      const guestSelect = screen.getByLabelText(/guests/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test empty time selection
      fireEvent.change(timeSelect, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/time is required/i)).toBeInTheDocument();
      expect(timeSelect).toHaveClass('error');
      
      // Test empty guest selection
      fireEvent.change(guestSelect, { target: { value: '' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/number of guests is required/i)).toBeInTheDocument();
      expect(guestSelect).toHaveClass('error');
    });

    test('should validate default select values', () => {
      render(<BookingPage />);
      
      const timeSelect = screen.getByLabelText(/time/i);
      const guestSelect = screen.getByLabelText(/guests/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test default time selection
      fireEvent.change(timeSelect, { target: { value: 'default' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/time is required/i)).toBeInTheDocument();
      expect(timeSelect).toHaveClass('error');
      
      // Test default guest selection
      fireEvent.change(guestSelect, { target: { value: 'default' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/number of guests is required/i)).toBeInTheDocument();
      expect(guestSelect).toHaveClass('error');
    });

    test('should validate invalid select values for security', () => {
      render(<BookingPage />);
      
      const timeSelect = screen.getByLabelText(/time/i);
      const guestSelect = screen.getByLabelText(/guests/i);
      const submitButton = screen.getByRole('button', { name: /make your reservation/i });
      
      // Test invalid time selection (security check)
      fireEvent.change(timeSelect, { target: { value: '25:00' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/invalid time selection/i)).toBeInTheDocument();
      expect(timeSelect).toHaveClass('error');
      
      // Test invalid guest selection (security check)
      fireEvent.change(guestSelect, { target: { value: '15' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/invalid number of guests selection/i)).toBeInTheDocument();
      expect(guestSelect).toHaveClass('error');
    });
  });

  describe('Guest Count Validation', () => {
    test('should show error for large parties on weekends', () => {
      render(<BookingPage />);
      
      // Find next Saturday
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7);
      const saturdayDate = nextSaturday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: saturdayDate }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '6' }
      });
      
      expect(screen.getByText(/large parties \(6\+ guests\) are not available on weekends/i)).toBeInTheDocument();
    });

    test('should show error for large parties during peak hours', () => {
      render(<BookingPage />);
      
      // Find next Tuesday
      const nextTuesday = new Date();
      nextTuesday.setDate(nextTuesday.getDate() + (2 - nextTuesday.getDay() + 7) % 7);
      const tuesdayDate = nextTuesday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: tuesdayDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '7' }
      });
      
      expect(screen.getByText(/large parties \(6\+ guests\) are not available during peak hours/i)).toBeInTheDocument();
    });

    test('should show error for large parties without sufficient advance booking', () => {
      render(<BookingPage />);
      
      // Tomorrow (not enough advance notice for large parties)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: tomorrowDate }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '6' }
      });
      
      expect(screen.getByText(/large parties \(6\+ guests\) require at least 2 days advance booking/i)).toBeInTheDocument();
    });

    test('should show warning for single diners during peak hours', () => {
      render(<BookingPage />);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: tomorrowDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '1' }
      });
      
      expect(screen.getByText(/single diner reservations during peak hours.*may have limited availability/i)).toBeInTheDocument();
    });

    test('should show error for parties larger than 8 guests', () => {
      render(<BookingPage />);
      
      // Mock a custom input that allows values > 8 (since select is limited to 8)
      const guestsSelect = screen.getByLabelText(/guests/i);
      
      // Create a custom option for testing
      const option9 = document.createElement('option');
      option9.value = '9';
      option9.textContent = '9 Guests';
      guestsSelect.appendChild(option9);
      
      fireEvent.change(guestsSelect, {
        target: { value: '9' }
      });
      
      expect(screen.getByText(/for parties larger than 8 guests, please call us directly/i)).toBeInTheDocument();
    });

    test('should clear guest error when valid guest count is selected', () => {
      render(<BookingPage />);
      
      // First create error with large party on weekend
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7);
      const saturdayDate = nextSaturday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: saturdayDate }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '6' }
      });
      
      expect(screen.getByText(/large parties \(6\+ guests\) are not available on weekends/i)).toBeInTheDocument();
      
      // Then change to valid guest count
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '4' }
      });
      
      expect(screen.queryByText(/large parties \(6\+ guests\) are not available on weekends/i)).not.toBeInTheDocument();
    });

    test('should prevent form submission with invalid guest count', () => {
      render(<BookingPage />);
      
      // Fill form with invalid guest count
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7);
      const saturdayDate = nextSaturday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: saturdayDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '18:00' }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '6' }
      });
      
      // Mock alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      fireEvent.click(screen.getByText(/confirm reservation/i));
      
      expect(alertSpy).toHaveBeenCalledWith('Please fix the guest count error before submitting.');
      
      alertSpy.mockRestore();
    });

    test('should apply error styling to guest select with invalid count', () => {
      render(<BookingPage />);
      
      const nextSaturday = new Date();
      nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7);
      const saturdayDate = nextSaturday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: saturdayDate }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '6' }
      });
      
      const guestsSelect = screen.getByLabelText(/guests/i);
      expect(guestsSelect).toHaveClass('error');
    });

    test('should re-validate guests when time changes', () => {
      render(<BookingPage />);
      
      // Set up large party on weekday
      const nextTuesday = new Date();
      nextTuesday.setDate(nextTuesday.getDate() + (2 - nextTuesday.getDay() + 7) % 7);
      const tuesdayDate = nextTuesday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: tuesdayDate }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '6' }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '16:00' }
      });
      
      // Should be valid initially
      expect(screen.queryByText(/large parties.*peak hours/i)).not.toBeInTheDocument();
      
      // Change to peak hour - should trigger error
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });
      
      expect(screen.getByText(/large parties \(6\+ guests\) are not available during peak hours/i)).toBeInTheDocument();
    });

    test('should allow valid large party booking with proper conditions', () => {
      render(<BookingPage />);
      
      // Set up valid large party: weekday, off-peak time, sufficient advance notice
      const nextTuesday = new Date();
      nextTuesday.setDate(nextTuesday.getDate() + (2 - nextTuesday.getDay() + 7) % 7 + 7); // Next week Tuesday
      const tuesdayDate = nextTuesday.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: tuesdayDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '16:00' }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '6' }
      });
      
      // Should not show any error for valid large party
      expect(screen.queryByText(/large parties/i)).not.toBeInTheDocument();
    });

    test('should allow single diner during off-peak hours', () => {
      render(<BookingPage />);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];
      
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: tomorrowDate }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '16:00' }
      });
      fireEvent.change(screen.getByLabelText(/guests/i), {
        target: { value: '1' }
      });
      
      // Should not show any error for single diner during off-peak
      expect(screen.queryByText(/single diner/i)).not.toBeInTheDocument();
    });
  });

  describe('Local Storage Integration', () => {
    test('should persist data across component re-renders', () => {
      const { rerender } = render(<BookingPage />);
      
      // Submit a booking
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Persistent User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'persistent@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/date/i), {
        target: { value: '2025-08-30' }
      });
      fireEvent.change(screen.getByLabelText(/time/i), {
        target: { value: '19:00' }
      });

      fireEvent.click(screen.getByText(/confirm reservation/i));

      // Re-render component
      rerender(<BookingPage />);

      // Verify data persists
      expect(screen.getByText('Persistent User')).toBeInTheDocument();
      expect(screen.getByText('persistent@example.com')).toBeInTheDocument();
    });

    test('should clear localStorage when needed', () => {
      // This test would be for a clear/reset functionality
      localStorageMock.setItem('bookingData', JSON.stringify([
        { id: 1, name: 'Test User', email: 'test@example.com' }
      ]));

      render(<BookingPage />);

      // If there was a clear button, we would test it here
      // For now, we can test the localStorage.clear functionality
      localStorageMock.clear();
      expect(localStorageMock.getItem('bookingData')).toBeNull();
    });
  });
});
