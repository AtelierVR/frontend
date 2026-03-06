import { useState, useEffect } from 'react';
import { countriesService, Country } from '../countries';

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    countriesService
      .get()
      .then(setCountries)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { countries, loading, error };
}
