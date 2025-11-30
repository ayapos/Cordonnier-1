import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('CHF');
  const [isLoading, setIsLoading] = useState(true);

  // Detect country via IP on first load
  useEffect(() => {
    const detectCountry = async () => {
      // Check if currency is already set in localStorage
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency) {
        setCurrency(savedCurrency);
        setIsLoading(false);
        return;
      }

      // Detect via IP
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // European countries use EUR, Switzerland uses CHF
        const europeanCountries = ['FR', 'DE', 'IT', 'BE', 'LU', 'AT', 'NL', 'ES', 'PT'];
        
        if (data.country_code === 'CH') {
          setCurrency('CHF');
          localStorage.setItem('currency', 'CHF');
        } else if (europeanCountries.includes(data.country_code)) {
          setCurrency('EUR');
          localStorage.setItem('currency', 'EUR');
        } else {
          // Default to CHF for other countries
          setCurrency('CHF');
          localStorage.setItem('currency', 'CHF');
        }
      } catch (error) {
        console.log('Could not detect country, defaulting to CHF');
        setCurrency('CHF');
        localStorage.setItem('currency', 'CHF');
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const formatPrice = (price) => {
    // 1 EUR = 1 CHF (as requested)
    const symbol = currency === 'EUR' ? '€' : 'CHF';
    return `${price.toFixed(2)}${symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
