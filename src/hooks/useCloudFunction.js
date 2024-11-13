import { useState, useEffect } from 'react';

export const useCloudFunction = (functionName, params = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = async () => {
    setIsLoading(true);
    try {
      // Replace this with your own API call
      const response = await fetch(`/api/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, error, isLoading, fetch };
};
