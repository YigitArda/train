import React from 'react';

export interface JourneyCity {
  city_id: string;
  display_name: string;
  country_code: string;
}

export interface JourneyResult {
  id: string;
  title: string;
  duration: string;
  price: string;
  operatorMix: string;
  transferStation: string;
  fareConditions: string;
  transferCity?: JourneyCity | null;
}

interface ResultCardProps {
  result: JourneyResult;
  transferStationLabel?: string;
}

export function ResultCard({ result, transferStationLabel }: ResultCardProps) {
  return (
    <article aria-label={`Result ${result.id}`}>
      <h3>{result.title}</h3>
      <p>Duration: {result.duration}</p>
      <p>Price: {result.price}</p>

      <dl>
        <dt>Operator mix</dt>
        <dd>{result.operatorMix}</dd>

        <dt>Transfer station</dt>
        <dd>{transferStationLabel ?? result.transferStation}</dd>

        <dt>Fare conditions</dt>
        <dd>{result.fareConditions}</dd>
      </dl>
    </article>
  );
}
