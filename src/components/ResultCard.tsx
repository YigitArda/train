import React from 'react';

export interface JourneyResult {
  id: string;
  title: string;
  duration: string;
  price: string;
  operatorMix: string;
  transferStation: string;
  fareConditions: string;
}

interface ResultCardProps {
  result: JourneyResult;
}

export function ResultCard({ result }: ResultCardProps) {
  return (
    <article aria-label={`Result ${result.id}`}>
      <h3>{result.title}</h3>
      <p>Duration: {result.duration}</p>
      <p>Price: {result.price}</p>

      <dl>
        <dt>Operator mix</dt>
        <dd>{result.operatorMix}</dd>

        <dt>Transfer station</dt>
        <dd>{result.transferStation}</dd>

        <dt>Fare conditions</dt>
        <dd>{result.fareConditions}</dd>
      </dl>
    </article>
  );
}
