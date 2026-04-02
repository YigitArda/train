import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

export interface CityOption {
  city_id: string;
  city_name: string;
}

interface CitySelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  minSearchLength?: number;
  searchDebounceMs?: number;
  searchCities: (query: string, signal: AbortSignal) => Promise<CityOption[]>;
  onSubmit: (city: CityOption) => void;
}

export function CitySelect({
  id = 'city-select',
  label = 'Şehir',
  placeholder = 'Şehir ara...',
  minSearchLength = 2,
  searchDebounceMs = 300,
  searchCities,
  onSubmit,
}: CitySelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [results, setResults] = useState<CityOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef('');
  const requestSeqRef = useRef(0);

  const listboxId = `${id}-listbox`;

  useEffect(() => {
    const query = inputValue.trim();

    if (!isOpen || query.length < minSearchLength) {
      abortRef.current?.abort();
      setIsLoading(false);
      setResults([]);
      setErrorMessage(null);
      setActiveIndex(-1);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      const sequence = ++requestSeqRef.current;
      lastQueryRef.current = query;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextResults = await searchCities(query, controller.signal);

        if (sequence !== requestSeqRef.current) {
          return;
        }

        setResults(nextResults);
        setActiveIndex(nextResults.length > 0 ? 0 : -1);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (sequence !== requestSeqRef.current) {
          return;
        }

        setResults([]);
        setActiveIndex(-1);
        setErrorMessage(error instanceof Error ? error.message : 'Şehir araması sırasında bir hata oluştu.');
      } finally {
        if (sequence === requestSeqRef.current) {
          setIsLoading(false);
        }
      }
    }, searchDebounceMs);

    return () => clearTimeout(timeoutId);
  }, [inputValue, isOpen, minSearchLength, searchCities, searchDebounceMs]);

  const selectCity = (city: CityOption) => {
    setSelectedCity(city);
    setInputValue(city.city_name);
    setIsOpen(false);
    setResults([]);
    setActiveIndex(-1);
    setValidationMessage(null);
  };

  const handleRetry = async () => {
    if (!lastQueryRef.current) return;

    setInputValue(lastQueryRef.current);
    setIsOpen(true);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setIsOpen(true);
    setValidationMessage(null);

    if (selectedCity && value !== selectedCity.city_name) {
      setSelectedCity(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
      }
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < results.length) {
      event.preventDefault();
      selectCity(results[activeIndex]);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!selectedCity?.city_id) {
      setValidationMessage('Lütfen listeden geçerli bir şehir seçin.');
      return;
    }

    setValidationMessage(null);
    onSubmit(selectedCity);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      {isOpen && (
        <div>
          {isLoading ? <p>Loading cities...</p> : null}

          {!isLoading && errorMessage ? (
            <div>
              <p>{errorMessage}</p>
              <button type="button" onClick={handleRetry}>
                Retry
              </button>
            </div>
          ) : null}

          {!isLoading && !errorMessage && results.length === 0 && inputValue.trim().length >= minSearchLength ? (
            <p>No results</p>
          ) : null}

          {!isLoading && !errorMessage && results.length > 0 ? (
            <ul id={listboxId} role="listbox" aria-label="Şehir sonuçları">
              {results.map((city, index) => (
                <li
                  id={`${id}-option-${index}`}
                  key={city.city_id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectCity(city)}
                >
                  {city.city_name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      {validationMessage ? <p role="alert">{validationMessage}</p> : null}

      <button type="submit">Devam et</button>
    </form>
  );
}
