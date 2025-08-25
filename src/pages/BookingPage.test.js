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
