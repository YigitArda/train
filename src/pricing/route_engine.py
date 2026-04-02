from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Callable, Dict, Iterable, List, Optional, Tuple


@dataclass(frozen=True)
class Leg:
    """A directed, time-dependent leg between two stations/airports."""

    origin: str
    destination: str
    departure_min: int
    arrival_min: int
    fare: float


@dataclass
class Itinerary:
    """A complete path made of one or more legs."""

    legs: List[Leg] = field(default_factory=list)

    @property
    def total_fare(self) -> float:
        return sum(leg.fare for leg in self.legs)

    @property
    def total_duration(self) -> int:
        if not self.legs:
            return 0
        return self.legs[-1].arrival_min - self.legs[0].departure_min

    @property
    def transfers(self) -> int:
        return max(0, len(self.legs) - 1)

    @property
    def min_transfer_buffer(self) -> int:
        if len(self.legs) < 2:
            return 0
        buffers = [
            self.legs[i + 1].departure_min - self.legs[i].arrival_min
            for i in range(len(self.legs) - 1)
        ]
        return min(buffers)


@dataclass(frozen=True)
class ScoredItinerary:
    itinerary: Itinerary
    weighted_cost: float


class TimeDependentRouteEngine:
    """
    Builds routes over a time-dependent graph and produces Pareto frontier options.
    """

    def __init__(
        self,
        transfer_buffer_min: int = 45,
        max_legs: int = 4,
        weights: Optional[Dict[str, float]] = None,
    ) -> None:
        self.transfer_buffer_min = transfer_buffer_min
        self.max_legs = max_legs
        self.weights = weights or {
            "fare": 1.0,
            "duration": 0.02,
            "transfers": 25.0,
            "buffer_penalty": 3.0,
        }

    def find_itineraries(
        self,
        origin: str,
        destination: str,
        legs: Iterable[Leg],
        earliest_departure_min: int = 0,
    ) -> List[Itinerary]:
        graph: Dict[str, List[Leg]] = {}
        for leg in legs:
            graph.setdefault(leg.origin, []).append(leg)

        for node_legs in graph.values():
            node_legs.sort(key=lambda l: l.departure_min)

        out: List[Itinerary] = []

        def dfs(node: str, current: List[Leg], used: set[str], earliest: int) -> None:
            if len(current) > self.max_legs:
                return
            if node == destination and current:
                out.append(Itinerary(legs=list(current)))
                return
            for edge in graph.get(node, []):
                if edge.departure_min < earliest:
                    continue
                if edge.destination in used:
                    continue
                current.append(edge)
                used.add(edge.destination)
                next_earliest = edge.arrival_min + self.transfer_buffer_min
                dfs(edge.destination, current, used, next_earliest)
                used.remove(edge.destination)
                current.pop()

        dfs(origin, [], {origin}, earliest_departure_min)
        return out

    def score(self, itinerary: Itinerary) -> ScoredItinerary:
        penalty = max(0, self.transfer_buffer_min - itinerary.min_transfer_buffer)
        weighted = (
            itinerary.total_fare * self.weights["fare"]
            + itinerary.total_duration * self.weights["duration"]
            + itinerary.transfers * self.weights["transfers"]
            + penalty * self.weights["buffer_penalty"]
        )
        return ScoredItinerary(itinerary=itinerary, weighted_cost=weighted)

    def pareto_frontier(self, itineraries: Iterable[Itinerary]) -> Dict[str, Optional[Itinerary]]:
        options = list(itineraries)
        if not options:
            return {"cheapest": None, "fastest": None, "best_value": None}

        cheapest = min(options, key=lambda i: (i.total_fare, i.total_duration, i.transfers))
        fastest = min(options, key=lambda i: (i.total_duration, i.total_fare, i.transfers))
        best_value = min(options, key=lambda i: self.score(i).weighted_cost)

        return {
            "cheapest": cheapest,
            "fastest": fastest,
            "best_value": best_value,
        }


DatePriceProvider = Callable[[str, str, date], Optional[float]]


def scan_nearby_dates_for_cheaper(
    origin: str,
    destination: str,
    target_date: date,
    price_provider: DatePriceProvider,
    day_range: int = 3,
) -> List[Tuple[date, float]]:
    """Scans ±day_range dates and returns available prices sorted by ascending fare."""

    scanned: List[Tuple[date, float]] = []
    for offset in range(-day_range, day_range + 1):
        d = target_date + timedelta(days=offset)
        price = price_provider(origin, destination, d)
        if price is not None:
            scanned.append((d, price))

    return sorted(scanned, key=lambda x: x[1])
