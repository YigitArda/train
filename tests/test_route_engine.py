from datetime import date

from src.pricing.route_engine import Leg, TimeDependentRouteEngine, scan_nearby_dates_for_cheaper


def test_pareto_frontier_returns_distinct_profiles():
    engine = TimeDependentRouteEngine(transfer_buffer_min=30)
    legs = [
        Leg("IST", "FRA", 8 * 60, 10 * 60, 95),
        Leg("FRA", "LHR", 11 * 60, 12 * 60 + 15, 65),
        Leg("IST", "AMS", 8 * 60 + 10, 11 * 60, 140),
        Leg("AMS", "LHR", 11 * 60 + 50, 12 * 60 + 20, 35),
        Leg("IST", "LHR", 9 * 60, 13 * 60 + 15, 180),
        Leg("IST", "LHR", 6 * 60 + 30, 10 * 60 + 45, 260),
    ]

    itineraries = engine.find_itineraries("IST", "LHR", legs, earliest_departure_min=6 * 60)
    frontier = engine.pareto_frontier(itineraries)

    assert frontier["cheapest"] is not None
    assert frontier["fastest"] is not None
    assert frontier["best_value"] is not None

    assert frontier["cheapest"].total_fare <= frontier["fastest"].total_fare
    assert frontier["fastest"].total_duration <= frontier["cheapest"].total_duration


def test_scan_nearby_dates_for_cheaper():
    base = date(2026, 6, 20)
    prices = {
        date(2026, 6, 17): 220,
        date(2026, 6, 18): 180,
        date(2026, 6, 19): 205,
        date(2026, 6, 20): 240,
        date(2026, 6, 21): 190,
        date(2026, 6, 22): 230,
        date(2026, 6, 23): 175,
    }

    def provider(_o, _d, dt):
        return prices.get(dt)

    result = scan_nearby_dates_for_cheaper("IST", "LHR", base, provider)

    assert len(result) == 7
    assert result[0][0] == date(2026, 6, 23)
    assert result[0][1] == 175
    assert result[-1][1] == 240
