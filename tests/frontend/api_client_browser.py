"""Transport edge cases against the real shared client, with intercepted responses.
No application UI is mounted and no database requests are made.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

base = os.environ.get("FRONTEND_TEST_URL", "http://localhost:4310")
report = {"checks": [], "verified": False}
with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page(service_workers="block")
    page.route("**/__api-client-test", lambda r: r.fulfill(content_type="text/html", body="<html></html>"))
    page.goto(base + "/__api-client-test")
    page.evaluate("async () => { window.client = await import('/src/api/index.ts'); }")
    def run(name, expression):
        result = page.evaluate(expression)
        report["checks"].append({"name": name, "passed": result is True, "result": result})
    page.route("**/trips/check/budget", lambda r: r.fulfill(status=200, content_type="text/html", body="<html>proxy fallback</html>"))
    run("Invalid successful JSON response is rejected", "async () => { try { await client.api.budget('check'); return false; } catch (e) { return e instanceof client.ApiError; } }")
    page.unroute("**/trips/check/budget")
    page.route("**/trips/check/budget", lambda r: r.fulfill(status=200, json={}))
    run("Missing budget values cannot become fabricated zero totals", "async () => { try { await client.api.budget('check'); return false; } catch (e) { return e instanceof client.ApiError; } }")
    page.route("**/destinations?**", lambda r: r.fulfill(status=200, json={"items":[]}))
    run("Invalid collection shape is rejected", "async () => { try { await client.api.destinations(); return false; } catch (e) { return e instanceof client.ApiError; } }")
    page.unroute("**/destinations?**")
    page.route("**/destinations?**", lambda r: r.fulfill(status=200, json=[{}]))
    run("Missing catalog identity fields cannot display a fabricated blank destination", "async () => { try { await client.api.destinations(); return false; } catch (e) { return e instanceof client.ApiError; } }")
    page.route("**/destinations/check", lambda r: r.fulfill(status=200, json={}))
    for resource in ["attractions","hotels","restaurants"]:
        page.route("**/destinations/check/"+resource+"?**", lambda r: r.fulfill(status=200, json=[]))
    run("Malformed destination detail is rejected", "async () => { try { await client.api.destination('check'); return false; } catch (e) { return e instanceof client.ApiError; } }")
    page.route("**/destinations/catalog?**", lambda r: r.fulfill(status=200, json=[{"id":"city","name":"City","attractions":{},"hotels":[],"restaurants":[]}]))
    run("Batched catalog rejects malformed children", "async () => { try { await client.api.catalog(); return false; } catch (e) { return e instanceof client.ApiError; } }")
    page.route("**/destinations/catalog?**", lambda r: r.fulfill(status=200, json=[{"id":"city","name":"City","attractions":[{"id":"a","name":"A","destination_id":"wrong"}],"hotels":[],"restaurants":[]}]))
    run("Batched catalog rejects cross-city child records", "async () => { try { await client.api.catalog(); return false; } catch (e) { return e instanceof client.ApiError; } }")
    page.route("**/destinations/catalog?**", lambda r: r.fulfill(status=200, json=[{"id":"city","name":"City","attractions":[],"hotels":[],"restaurants":[]}]))
    run("Batched empty-city catalog remains truthful", "async () => { const rows = await client.api.catalog(); return rows.length === 1 && rows[0].attractions.length === 0; }")
    budget = {"trip_id":"another-trip","budget":100,"hotel":120,"attractions":0,"meals":0,"transit":0,"total":120,"remaining":-20}
    page.route("**/trips/mismatch", lambda r: r.fulfill(status=200, json={"trip":{"id":"mismatch"},"days":[],"budget":budget}))
    run("Persisted itinerary rejects another trip's budget", "async () => { try { await client.api.trip('mismatch'); return false; } catch (e) { return e instanceof client.ApiError; } }")
    page.route("**/auth/login", lambda r: r.fulfill(status=200, json={}))
    run("Malformed login never stores an invalid token", "async () => { sessionStorage.clear(); try { await client.api.login('test@example.com','unused'); } catch {} return client.session.token() === null; }")
    held = []
    page.route("**/trips/old-request", lambda r: held.append(r))
    page.evaluate("() => { sessionStorage.setItem('heritage_api_token','old-session'); window.oldRequest = client.api.trip('old-request').catch(e => e.status); }")
    page.wait_for_timeout(100)
    assert held, "Request did not reach interception"
    page.evaluate("sessionStorage.setItem('heritage_api_token','new-session')")
    held[0].fulfill(status=401, json={"error":{"message":"Expired token"}})
    run("Late old-session 401 cannot clear a new login", "async () => { await window.oldRequest; return client.session.token() === 'new-session'; }")
    page.route("**/trips/current-request", lambda r: r.fulfill(status=401, json={"error":{"message":"Expired token"}}))
    run("Current-session 401 still clears authentication", "async () => { try { await client.api.trip('current-request'); } catch {} return client.session.token() === null; }")
    browser.close()
report["verified"] = all(c["passed"] for c in report["checks"])
Path(__file__).resolve().parents[2].joinpath("backend/reports/frontend-api-client-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report))
raise SystemExit(0 if report["verified"] else 1)
