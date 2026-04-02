import React from 'react';

export type SeatClass = '2nd' | '1st' | 'any';

export interface SearchFiltersValue {
  directOnly: boolean;
  maxTransfers: number;
  seatClass: SeatClass;
  operator: string;
  overnightOrSleeper: boolean;
  railPassEligible?: boolean;
}

interface SearchFiltersProps {
  value: SearchFiltersValue;
  operators: string[];
  onChange: (next: SearchFiltersValue) => void;
  showRailPassFilter?: boolean;
}

export function SearchFilters({
  value,
  operators,
  onChange,
  showRailPassFilter = false,
}: SearchFiltersProps) {
  const update = <K extends keyof SearchFiltersValue>(key: K, next: SearchFiltersValue[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <section aria-label="Search filters">
      <label>
        <input
          type="checkbox"
          checked={value.directOnly}
          onChange={(e) => update('directOnly', e.target.checked)}
        />
        Direct only
      </label>

      <label>
        Max transfers
        <input
          type="number"
          min={0}
          value={value.maxTransfers}
          onChange={(e) => update('maxTransfers', Number(e.target.value))}
        />
      </label>

      <fieldset>
        <legend>Seat class</legend>
        <label>
          <input
            type="radio"
            name="seatClass"
            checked={value.seatClass === '2nd'}
            onChange={() => update('seatClass', '2nd')}
          />
          2nd
        </label>
        <label>
          <input
            type="radio"
            name="seatClass"
            checked={value.seatClass === '1st'}
            onChange={() => update('seatClass', '1st')}
          />
          1st
        </label>
      </fieldset>

      <label>
        Operator
        <select value={value.operator} onChange={(e) => update('operator', e.target.value)}>
          <option value="">All</option>
          {operators.map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={value.overnightOrSleeper}
          onChange={(e) => update('overnightOrSleeper', e.target.checked)}
        />
        Overnight / sleeper
      </label>

      {showRailPassFilter ? (
        <label>
          <input
            type="checkbox"
            checked={Boolean(value.railPassEligible)}
            onChange={(e) => update('railPassEligible', e.target.checked)}
          />
          Rail pass eligible
        </label>
      ) : null}
    </section>
  );
}
