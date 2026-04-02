from __future__ import annotations

import csv
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Iterable


DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "stations"


@dataclass(frozen=True)
class Station:
    station_id: str
    uic: str
    country_code: str
    name: str
    city_node: str
    latitude: float
    longitude: float
    aliases: tuple[str, ...]


class StationNormalizer:
    def __init__(self, min_confidence: float = 0.80) -> None:
        self.min_confidence = min_confidence
        self._stations = self._load_stations(DATA_DIR / "canonical_registry.csv")
        self._manual = self._load_manual_overrides(DATA_DIR / "manual_overrides.csv")
        self._city_nodes = self._load_city_nodes(DATA_DIR / "city_nodes.csv")

    @staticmethod
    def _normalize_text(value: str) -> str:
        return " ".join(value.casefold().replace("'", " ").replace("-", " ").split())

    def _load_stations(self, path: Path) -> dict[str, Station]:
        stations: dict[str, Station] = {}
        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                aliases = tuple(a.strip() for a in row["aliases"].split("|") if a.strip())
                stations[row["station_id"]] = Station(
                    station_id=row["station_id"],
                    uic=row["uic"],
                    country_code=row["country_code"],
                    name=row["name"],
                    city_node=row["city_node"],
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                    aliases=aliases,
                )
        return stations

    def _load_manual_overrides(self, path: Path) -> dict[tuple[str, str], str]:
        overrides: dict[tuple[str, str], str] = {}
        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = (self._normalize_text(row["source_name"]), row["source_country"].upper())
                overrides[key] = row["canonical_station_id"]
        return overrides

    @staticmethod
    def _load_city_nodes(path: Path) -> dict[str, tuple[str, ...]]:
        nodes: dict[str, tuple[str, ...]] = {}
        with path.open(newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                nodes[row["city_node"]] = tuple(row["member_station_ids"].split("|"))
        return nodes

    def map_to_station_id(self, station_name: str, country_code: str) -> tuple[str | None, float, str]:
        normalized_name = self._normalize_text(station_name)
        normalized_country = country_code.upper()

        manual_key = (normalized_name, normalized_country)
        if manual_key in self._manual:
            station_id = self._manual[manual_key]
            return station_id, 1.0, "manual_override"

        best_station_id: str | None = None
        best_score = 0.0

        for station in self._stations.values():
            if station.country_code != normalized_country:
                continue

            candidates = (station.name, *station.aliases)
            for candidate in candidates:
                score = SequenceMatcher(None, normalized_name, self._normalize_text(candidate)).ratio()
                if score > best_score:
                    best_station_id = station.station_id
                    best_score = score

        if best_score >= self.min_confidence and best_station_id:
            return best_station_id, best_score, "fuzzy"

        return None, best_score, "unmatched"

    def normalize_search_results(self, results: Iterable[dict[str, str]]) -> list[dict[str, str | float | None]]:
        normalized: list[dict[str, str | float | None]] = []
        for row in results:
            station_id, confidence, match_method = self.map_to_station_id(
                station_name=row["station_name"],
                country_code=row["country_code"],
            )
            city_node = self._stations[station_id].city_node if station_id else None
            normalized.append(
                {
                    **row,
                    "canonical_station_id": station_id,
                    "canonical_city_node": city_node,
                    "match_confidence": round(confidence, 4),
                    "match_method": match_method,
                }
            )
        return normalized

    def expand_city_node(self, city_node: str) -> tuple[str, ...]:
        return self._city_nodes.get(city_node, ())


if __name__ == "__main__":
    incoming_results = [
        {"provider": "foo", "station_name": "Paris Nord", "country_code": "FR"},
        {"provider": "foo", "station_name": "London St Pancrs", "country_code": "GB"},
        {"provider": "bar", "station_name": "Berlin Central Station", "country_code": "DE"},
    ]

    normalizer = StationNormalizer()
    for item in normalizer.normalize_search_results(incoming_results):
        print(item)
