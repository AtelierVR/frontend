import { useState, useEffect } from 'react';
import { languagesService, Language } from '../languages';

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    languagesService
      .get()
      .then(setLanguages)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { languages, loading, error };
}
