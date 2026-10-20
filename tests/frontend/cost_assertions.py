"""Strict assertions for persisted known/unknown itinerary costs, never null-to-zero."""
from decimal import Decimal

def assert_known_budget(dto):
    stops=[s for day in dto['days'] for s in day['stops']]
    known=[Decimal(str(s['cost'])) for s in stops if s['cost'] is not None]
    assert all(v.is_finite() and v>=0 for v in known)
    subtotal=sum(known,Decimal(0)).quantize(Decimal('.01'))
    budget=dto['budget'];details=budget['cost_details']
    assert subtotal==Decimal(str(budget['total'])).quantize(Decimal('.01'))
    assert subtotal==Decimal(str(details['known_subtotal'])).quantize(Decimal('.01'))
    for stop in stops:
        if stop['cost'] is None:
            key=str(stop['day_number'])+':'+str(stop['stop_order'])
            assert dto['trip']['generation_summary']['cost_states'][key]=='UNKNOWN'
    if any(s['cost'] is None for s in stops):
        assert details['complete'] is False and details['final_total'] is None
        assert details['unknown_components']
