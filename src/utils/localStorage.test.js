import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component that uses localStorage for reading
const TestComponent = ({ storageKey = 'testData', defaultValue = [] }) => {
  const [data, setData] = React.useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${error.message}`);
      return defaultValue;
    }
  });

  const addItem = (newItem) => {
    const updatedData = [...data, newItem];
    setData(updatedData);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    } catch (error) {
      console.error(`Error writing to localStorage: ${error.message}`);
    }
  };

  return (
    <div>
      <div data-testid="data-display">
        {data.map((item, index) => (
          <div key={index} data-testid={`item-${index}`}>
            {typeof item === 'object' ? JSON.stringify(item) : item}
          </div>
        ))}
      </div>
      <button onClick={() => addItem(`Item ${data.length + 1}`)}>
        Add Item
      </button>
    </div>
  );
};

// Mock localStorage
const createLocalStorageMock = () => {
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
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
};

const localStorageMock = createLocalStorageMock();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('LocalStorage Read Operations', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Basic Read Operations', () => {
    test('should read existing data from localStorage on component initialization', () => {
      const testData = ['item1', 'item2', 'item3'];
      localStorageMock.setItem('testData', JSON.stringify(testData));

      render(<TestComponent />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('testData');
      expect(screen.getByTestId('item-0')).toHaveTextContent('item1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('item2');
      expect(screen.getByTestId('item-2')).toHaveTextContent('item3');
    });

    test('should use default value when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const defaultValue = ['default1', 'default2'];

      render(<TestComponent defaultValue={defaultValue} />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('testData');
      expect(screen.getByTestId('item-0')).toHaveTextContent('default1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('default2');
    });

    test('should read data with custom storage key', () => {
      const customData = ['custom1', 'custom2'];
      localStorageMock.setItem('customKey', JSON.stringify(customData));

      render(<TestComponent storageKey="customKey" />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('customKey');
      expect(screen.getByTestId('item-0')).toHaveTextContent('custom1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('custom2');
    });

    test('should read complex object data from localStorage', () => {
      const complexData = [
        { id: 1, name: 'John', email: 'john@test.com' },
        { id: 2, name: 'Jane', email: 'jane@test.com' }
      ];
      localStorageMock.setItem('testData', JSON.stringify(complexData));

      render(<TestComponent />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('testData');
      expect(screen.getByTestId('item-0')).toHaveTextContent(JSON.stringify(complexData[0]));
      expect(screen.getByTestId('item-1')).toHaveTextContent(JSON.stringify(complexData[1]));
    });
  });

  describe('Error Handling in Read Operations', () => {
    test('should handle JSON parsing errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json string {');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const defaultValue = ['fallback'];

      render(<TestComponent defaultValue={defaultValue} />);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading from localStorage:')
      );
      expect(screen.getByTestId('item-0')).toHaveTextContent('fallback');

      consoleSpy.mockRestore();
    });

    test('should handle localStorage access errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage is not available');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const defaultValue = ['error-fallback'];

      render(<TestComponent defaultValue={defaultValue} />);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading from localStorage: localStorage is not available')
      );
      expect(screen.getByTestId('item-0')).toHaveTextContent('error-fallback');

      consoleSpy.mockRestore();
    });

    test('should handle null values from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const defaultValue = ['null-fallback'];

      render(<TestComponent defaultValue={defaultValue} />);

      expect(screen.getByTestId('item-0')).toHaveTextContent('null-fallback');
    });

    test('should handle undefined values from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(undefined);
      const defaultValue = ['undefined-fallback'];

      render(<TestComponent defaultValue={defaultValue} />);

      expect(screen.getByTestId('item-0')).toHaveTextContent('undefined-fallback');
    });

    test('should handle empty string from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('');
      const defaultValue = ['empty-fallback'];

      render(<TestComponent defaultValue={defaultValue} />);

      expect(screen.getByTestId('item-0')).toHaveTextContent('empty-fallback');
    });
  });

  describe('Data Type Handling', () => {
    test('should read and parse array data correctly', () => {
      const arrayData = [1, 2, 3, 4, 5];
      localStorageMock.setItem('testData', JSON.stringify(arrayData));

      render(<TestComponent />);

      expect(screen.getByTestId('item-0')).toHaveTextContent('1');
      expect(screen.getByTestId('item-4')).toHaveTextContent('5');
    });

    test('should read and parse boolean values correctly', () => {
      const booleanData = [true, false, true];
      localStorageMock.setItem('testData', JSON.stringify(booleanData));

      render(<TestComponent />);

      expect(screen.getByTestId('item-0')).toHaveTextContent('true');
      expect(screen.getByTestId('item-1')).toHaveTextContent('false');
      expect(screen.getByTestId('item-2')).toHaveTextContent('true');
    });

    test('should read and parse nested object data correctly', () => {
      const nestedData = [
        {
          user: { name: 'John', preferences: { theme: 'dark', lang: 'en' } },
          settings: { notifications: true }
        }
      ];
      localStorageMock.setItem('testData', JSON.stringify(nestedData));

      render(<TestComponent />);

      expect(screen.getByTestId('item-0')).toHaveTextContent(JSON.stringify(nestedData[0]));
    });

    test('should handle mixed data types in array', () => {
      const mixedData = ['string', 123, true, null, { key: 'value' }];
      localStorageMock.setItem('testData', JSON.stringify(mixedData));

      render(<TestComponent />);

      expect(screen.getByTestId('item-0')).toHaveTextContent('string');
      expect(screen.getByTestId('item-1')).toHaveTextContent('123');
      expect(screen.getByTestId('item-2')).toHaveTextContent('true');
      expect(screen.getByTestId('item-4')).toHaveTextContent('{"key":"value"}');
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large data sets from localStorage', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
      localStorageMock.setItem('testData', JSON.stringify(largeData));

      render(<TestComponent />);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('testData');
      expect(screen.getByTestId('item-0')).toHaveTextContent('item-0');
      expect(screen.getByTestId('item-999')).toHaveTextContent('item-999');
    });

    test('should call localStorage.getItem only once during initialization', () => {
      const testData = ['test1', 'test2'];
      localStorageMock.setItem('testData', JSON.stringify(testData));

      render(<TestComponent />);

      expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('testData');
    });

    test('should not re-read from localStorage on re-renders', () => {
      const testData = ['test1', 'test2'];
      localStorageMock.setItem('testData', JSON.stringify(testData));

      const { rerender } = render(<TestComponent />);
      
      // Clear the mock calls from initial render
      localStorageMock.getItem.mockClear();
      
      // Re-render the component
      rerender(<TestComponent />);

      // Should not call getItem again on re-render
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });

    test('should handle special characters in localStorage data', () => {
      const specialData = ['café', 'naïve', '🚀', '中文', 'emoji: 😀'];
      localStorageMock.setItem('testData', JSON.stringify(specialData));

      render(<TestComponent />);

      expect(screen.getByTestId('item-0')).toHaveTextContent('café');
      expect(screen.getByTestId('item-1')).toHaveTextContent('naïve');
      expect(screen.getByTestId('item-2')).toHaveTextContent('🚀');
      expect(screen.getByTestId('item-3')).toHaveTextContent('中文');
      expect(screen.getByTestId('item-4')).toHaveTextContent('emoji: 😀');
    });
  });

  describe('Integration with React State', () => {
    test('should initialize React state with localStorage data', () => {
      const initialData = ['initial1', 'initial2'];
      localStorageMock.setItem('testData', JSON.stringify(initialData));

      render(<TestComponent />);

      // Verify the data is displayed (indicating state was initialized correctly)
      expect(screen.getByTestId('data-display').children).toHaveLength(2);
      expect(screen.getByTestId('item-0')).toHaveTextContent('initial1');
      expect(screen.getByTestId('item-1')).toHaveTextContent('initial2');
    });

    test('should maintain state consistency after localStorage read', () => {
      const testData = ['consistent1', 'consistent2'];
      localStorageMock.setItem('testData', JSON.stringify(testData));

      render(<TestComponent />);

      // Add a new item to verify state is working
      act(() => {
        screen.getByText('Add Item').click();
      });

      // Should have original items plus new item
      expect(screen.getByTestId('data-display').children).toHaveLength(3);
      expect(screen.getByTestId('item-2')).toHaveTextContent('Item 3');
    });
  });
});
