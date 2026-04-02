import React, { useMemo, useState } from 'react';
import { ResultCard, JourneyResult } from './ResultCard';
import { SearchFilters, SearchFiltersValue } from './SearchFilters';

interface SearchResultsPageProps {
  operators: string[];
  results: JourneyResult[];
  showRailPassFilter?: boolean;
}

const defaultFilters: SearchFiltersValue = {
  directOnly: false,
  maxTransfers: 3,
  seatClass: 'any',
  operator: '',
  overnightOrSleeper: false,
  railPassEligible: false,
};

export function SearchResultsPage({
  operators,
  results,
  showRailPassFilter = false,
}: SearchResultsPageProps) {
  const [filters, setFilters] = useState<SearchFiltersValue>(defaultFilters);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      if (filters.operator && !result.operatorMix.includes(filters.operator)) {
        return false;
      }

      if (filters.directOnly && result.transferStation !== 'Direct') {
        return false;
      }

      return true;
    });
  }, [filters, results]);

  return (
    <main>
      {/* Existing search area can stay where it is; this keeps results page structure intact. */}
      <SearchFilters
        value={filters}
        operators={operators}
        onChange={setFilters}
        showRailPassFilter={showRailPassFilter}
      />

      <section aria-label="Journey search results">
        {filteredResults.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </section>
    </main>
  );
}
