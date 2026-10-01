"""Real Chrome -> frontend -> API checks. Run via backend/scripts/test-frontend-browser.js.
Requires Python Playwright and Chrome; start API/Vite with matching origins first.
Only temporary test records are created. The wrapper removes exact test user IDs.
"""
import json
import subprocess
import os
import re
import secrets
import time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "backend/reports/frontend-browser-report.json"
BASE = os.environ.get("FRONTEND_TEST_URL", "http://localhost:4310")
API = os.environ.get("API_TEST_URL", "http://localhost:5310/api")
report = {"startedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "users": [], "checks": [], "responses": [], "pageErrors": [], "consoleMessages": [], "failedApiRequests": [], "verified": False}
def save():
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
def check(name, **details):
    report["checks"].append({"name": name, "passed": True, **details})
    save()
def login(page, email, password):
    page.goto(BASE + "/login")
    page.locator('input[type=email]').fill(email)
    page.locator('input[type=password]').fill(password)
    page.locator('button[type=submit]').click()
    page.wait_for_url("**/profile")
    expect(page.get_by_role("button", name="Sign Out", exact=True)).to_be_visible()
def record(response):
    if response.url.startswith(API):
        entry = {"method": response.request.method, "path": response.url[len(API):], "status": response.status}
        def redact(value):
            if isinstance(value, dict): return {k: "[redacted]" if k in ("password", "token", "password_hash") else redact(v) for k, v in value.items()}
            if isinstance(value, list): return [redact(v) for v in value]
            return value
        try: entry["body"] = redact(response.json())
        except Exception: pass
        try: entry["payload"] = redact(response.request.post_data_json)
        except Exception: pass
        report["responses"].append(entry)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    context = browser.new_context(service_workers="block")
    page = context.new_page()
    page.on("pageerror", lambda e: report["pageErrors"].append(str(e)))
    page.on("console", lambda m: report["consoleMessages"].append({"type":m.type,"text":m.text}) if m.type in ('error','warning') else None)
    page.on("requestfailed", lambda r: report["failedApiRequests"].append({"url":r.url,"failure":r.failure}) if r.url.startswith(API) else None)
    page.on("response", record)
    stamp = str(time.time_ns())
    password = secrets.token_urlsafe(20) + "Aa9!"
    tourist_email = f"browser-tourist-{stamp}@example.com"
    operator_email = f"browser-operator-{stamp}@example.com"
    try:
        # Registration is exercised through the existing form, not an injected session.
        page.goto(BASE + "/register")
        page.locator('#reg-name').fill("Browser Tourist")
        page.locator('input[type=email]').fill(tourist_email)
        page.locator('input[type=password]').nth(0).fill(password)
        page.locator('input[type=password]').nth(1).fill(password)
        with page.expect_response(lambda r: r.url == API + "/auth/register") as registered:
            page.locator('button[type=submit]').click()
        assert registered.value.status == 201
        report["users"].append(registered.value.json()["user"]["id"]); save()
        check("UI registration", status=201)
        page.goto(BASE + "/login")
        page.locator('input[type=email]').fill(tourist_email)
        page.locator('input[type=password]').fill(password + "wrong")
        with page.expect_response(lambda r: r.url == API + "/auth/login") as incorrect:
            page.locator('button[type=submit]').click()
        assert incorrect.value.status == 401
        assert page.evaluate("sessionStorage.getItem('heritage_api_token')") is None
        check("Incorrect UI login rejected", status=401)
        login(page, tourist_email, password)
        expect(page.get_by_text("Welcome back, Browser Tourist", exact=True).first).to_be_visible()
        page.reload()
        expect(page.get_by_text("Welcome back, Browser Tourist", exact=True).first).to_be_visible()
        check("JWT login and /auth/me profile restoration")
        # Exercise the requested search/detail sequence before creating the trip.
        page.goto(BASE + "/explore")
        for term, expected_count in [("Ahmed", 1), ("Somnath", 1), ("Dwarka", 1), ("Modhera", 1), ("zzzz-no-real-match", 0)]:
            with page.expect_response(lambda r: "/destinations/search?" in r.url and "prefix=" + term in r.url) as found:
                page.get_by_placeholder("Search destinations or districts...").fill(term)
            rows = found.value.json()
            assert found.value.status == 200 and len(rows) == expected_count
            expect(page.get_by_role("button", name="Inspect Site")).to_have_count(expected_count)
            check("Real city search: " + term, names=[r["name"] for r in rows], status=200)
        page.get_by_placeholder("Search destinations or districts...").fill("Ahmed")
        expect(page.get_by_role("button", name="Inspect Site")).to_have_count(1)
        page.get_by_role("button", name="Inspect Site").click()
        expect(page.get_by_text("Sabarmati Ashram", exact=True).first).to_be_visible()
        page.goto(BASE + "/profile")
        page.get_by_role("button", name="Create New Heritage Route").click()
        expect(page.get_by_text("3 Restaurants", exact=True)).to_be_visible()
        check("Planner restaurant count matches real Ahmedabad collection", count=3)
        page.get_by_role("button", name="Continue to Logistics").click()
        hotels = page.locator('[role=dialog] select').first
        selected = next(o for o in hotels.locator('option').evaluate_all('(els)=>els.map(e=>({value:e.value,text:e.text}))') if "The House of MG" in o["text"])
        catalog_hotels = context.request.get(API + "/destinations/ahmedabad/hotels").json()
        selected_price = next(h["price_per_night"] for h in catalog_hotels if h["id"] == selected["value"])
        expected_hotel_total = selected_price * 2
        budget_label = f"\u20b9{expected_hotel_total:,.0f}"
        hotels.select_option(selected["value"])
        page.locator('[role=dialog] input[type=range]').fill("3000")
        page.locator('[role=dialog] input[type=checkbox]').check()
        page.get_by_role("button", name="Review Plan").click()
        with page.expect_response(lambda r: "/generate-itinerary" in r.url) as generated:
            page.get_by_role("button", name="Generate Circular Plan").click()
        dto = generated.value.json()
        assert generated.value.status == 200
        assert dto["trip"]["starting_hotel_id"] == selected["value"]
        assert dto["trip"]["generation_summary"]["hotel_over_budget"] is True
        trip_id = dto["trip"]["id"]
        expect(page.get_by_text("Your selected hotel exceeds", exact=False)).to_be_visible()
        page.reload()
        expect(page.get_by_text("Base Hotel: The House of MG", exact=False)).to_be_visible()
        check("UI create/generate/read/reload retains chosen over-budget hotel", tripId=trip_id, hotelId=selected["value"], hotelOverBudget=True)
        with page.expect_response(lambda r: r.url.endswith(f"/trips/{trip_id}/budget")) as budget_response:
            page.get_by_role("button", name="Budget Planner", exact=True).first.click()
        budget = budget_response.value.json()
        assert budget["total"] == dto["budget"]["total"] == expected_hotel_total
        assert budget["hotel"] == expected_hotel_total
        expect(page.get_by_text(budget_label, exact=True).first).to_be_visible()
        assert "Save ₹2,200" not in page.locator("body").inner_text()
        check("Budget uses same persisted trip", budget=budget)
        page.screenshot(path=str(ROOT / "backend/reports/final-budget-browser.png"), full_page=True)
        saved_config = page.evaluate("sessionStorage.getItem('heritage_active_itinerary_v1')")
        page.evaluate("() => { const c=JSON.parse(sessionStorage.getItem('heritage_active_itinerary_v1')); c.tripId='00000000-0000-4000-8000-000000000001'; sessionStorage.setItem('heritage_active_itinerary_v1',JSON.stringify(c)); }")
        with page.expect_response(lambda r: r.url.endswith('/trips/00000000-0000-4000-8000-000000000001')) as missing_trip:
            page.goto(BASE + "/itinerary")
        assert missing_trip.value.status == 404
        expect(page.get_by_role("alert").first).to_be_visible()
        check("Invalid persisted trip uses real 404 error state", status=404)
        page.evaluate("value => sessionStorage.setItem('heritage_active_itinerary_v1', value)", saved_config)
        page.goto(BASE + "/budget")
        expect(page.get_by_text(budget_label, exact=True).first).to_be_visible()
        # A failed budget fetch cannot leave a previously shown ledger visible.
        page.route("**/trips/*/budget", lambda route: route.fulfill(status=503, json={"error":{"message":"Budget unavailable test"}}))
        page.reload()
        expect(page.get_by_role("alert").filter(has_text="Budget unavailable test")).to_be_visible()
        expect(page.get_by_text(budget_label, exact=True)).to_have_count(0)
        page.unroute("**/trips/*/budget")
        check("Budget network failure hides old totals")
        # Exercise the researched routes through the real planner UI as well as HTTP.
        page.goto(BASE + "/profile")
        page.get_by_role("button", name="Create New Heritage Route").click()
        page.get_by_role("button", name="Continue to Logistics").click()
        cheapest = min(catalog_hotels, key=lambda h: h["price_per_night"])
        page.locator('[role=dialog] select').first.select_option(cheapest["id"])
        page.locator('[role=dialog] input[type=range]').fill("20000")
        page.locator('[role=dialog] input[type=checkbox]').uncheck()
        page.get_by_role("button", name="Review Plan").click()
        with page.expect_response(lambda r: "/generate-itinerary" in r.url) as researched:
            page.get_by_role("button", name="Generate Circular Plan").click()
        real_plan = researched.value.json()
        assert researched.value.status == 200
        visits = [s for day in real_plan["days"] for s in day["stops"] if s["stop_type"] == "attraction"]
        assert len(visits) > 0, real_plan
        page.reload()
        expect(page.get_by_text("Base Hotel: " + cheapest["name"], exact=False)).to_be_visible()
        with page.expect_response(lambda r: r.url.endswith('/trips/' + real_plan["trip"]["id"] + '/budget')) as real_budget:
            page.get_by_role("button", name="Budget Planner", exact=True).first.click()
        assert real_budget.value.json() == real_plan["budget"]
        page.screenshot(path=str(ROOT / "backend/reports/researched-itinerary-budget-browser.png"), full_page=True)
        check("Real researched routes generate attraction visits and persisted budget through UI", attractionVisits=len(visits), budget=real_plan["budget"])
        from completion_flows import run as run_completion_flows
        run_completion_flows(page, context, BASE, API, check)
        # Tourist cannot load the operator catalog; server response is authoritative.
        token = page.evaluate("sessionStorage.getItem('heritage_api_token')")
        denied = page.request.get(API + "/admin/destinations", headers={"Authorization": "Bearer " + token})
        assert denied.status == 403
        check("Tourist admin read rejected", status=403)
        page.goto(BASE + "/admin")
        expect(page.get_by_role("alert").first).to_be_visible()
        expect(page.get_by_role("button", name="Add New Record", exact=True)).to_have_count(0)
        check("Tourist admin screen shows rejection, no catalog table")
        page.goto(BASE + "/explore")
        search = page.get_by_placeholder("Search destinations or districts...")
        expect(page.get_by_role("button", name="Inspect Site").first).to_be_visible()
        searches = []
        page.on("request", lambda r: searches.append(r.url) if "/destinations/search?" in r.url else None)
        search.press_sequentially("Ahmed", delay=25)
        expect(page.get_by_role("button", name="Inspect Site")).to_have_count(0)
        expect(page.get_by_role("button", name="Inspect Site")).to_have_count(1)
        assert len(searches) == 1, searches
        check("Explore debounces search and hides previous results", requests=list(searches))
        page.route("**/destinations/search?**", lambda route: route.fulfill(status=503, json={"error":{"message":"Search unavailable test"}}))
        search.fill("Dwarka")
        expect(page.get_by_role("alert").filter(has_text="Search unavailable test")).to_be_visible()
        expect(page.get_by_role("button", name="Inspect Site")).to_have_count(0)
        page.unroute("**/destinations/search?**")
        search.fill("Ahmed")
        expect(page.get_by_role("button", name="Inspect Site")).to_have_count(1)
        check("Failed search clears results without static fallback")
        page.get_by_role("button", name="Inspect Site").click()
        expect(page.get_by_text("Sabarmati Ashram", exact=True).first).to_be_visible()
        check("Destination detail loads real attractions/hotels/restaurants")
        page.route("**/destinations/*/attractions?**", lambda route: route.fulfill(status=503, json={"error":{"message":"Attractions unavailable test"}}))
        page.reload()
        expect(page.get_by_role("alert").filter(has_text="Attractions unavailable test").first).to_be_visible()
        expect(page.get_by_text("Sabarmati Ashram", exact=True)).to_have_count(0)
        page.unroute("**/destinations/*/attractions?**")
        check("Detail failure hides previous attraction data")
        page.get_by_role("button", name="Ranked Stays", exact=True).first.click()
        expect(page.get_by_text("French Haveli Heritage Stay", exact=True).first).to_be_visible()
        with page.expect_response(lambda r: "/hotels?sort=price" in r.url) as ordered:
            page.get_by_role("button", name="Lowest Price", exact=True).click()
        prices = [float(h["price_per_night"]) for h in ordered.value.json()]
        assert ordered.value.status == 200 and prices == sorted(prices)
        check("Hotels sort comes from API", prices=prices)
        for label, sort in [("Highest Rated", "rating"), ("Best Value (Rating/Cost)", "value")]:
            with page.expect_response(lambda r: "/hotels?sort=" + sort in r.url) as sorted_response:
                page.get_by_role("button", name=label, exact=True).click()
            assert sorted_response.value.status == 200
            rows = sorted_response.value.json()
            for hotel in rows: expect(page.get_by_text(hotel["name"], exact=True).first).to_be_visible()
            check("Hotel sort " + sort, ids=[r["id"] for r in rows], status=200)
        # Operator forms use temporary fixtures, never approved tourism rows.
        reg = page.request.post(API + "/auth/register", data={"name":"Browser Operator","email":operator_email,"password":password,"role":"tourist" if os.environ.get("PRODUCTION_BROWSER_TEST") == "true" else "tour_operator"})
        assert reg.status == 201
        report["users"].append(reg.json()["user"]["id"]); save()
        page.get_by_role("button", name="Sign Out", exact=True).click()
        if os.environ.get("PRODUCTION_BROWSER_TEST") == "true":
            subprocess.run(["node", "backend/scripts/provision-operator.js", operator_email], cwd=ROOT, check=True)
        login(page, operator_email, password)
        page.get_by_role("button", name="Submit New Property for Audit", exact=True).click()
        page.wait_for_url("**/admin?new=hotel")
        expect(page.get_by_role("button", name="Save Record", exact=True)).to_be_visible()
        assert page.locator('input').first.input_value() == ""
        check("Operator profile new-property control opens existing hotel create form")
        page.goto(BASE + "/profile")
        first_listing = page.get_by_role("button", name="Edit", exact=True).first
        first_listing.click()
        page.wait_for_url("**/admin?hotel=*")
        expect(page.get_by_role("button", name="Save Record", exact=True)).to_be_visible()
        assert page.locator('input').first.input_value()
        check("Operator profile Edit opens selected persisted hotel form")
        page.goto(BASE + "/admin")
        expect(page.get_by_role("button", name="Add New Record", exact=True)).to_be_visible()
        for resource, tab in [("destinations","Destinations"),("hotels","Hotels & Stays"),("attractions","Attractions"),("restaurants","Restaurants")]:
            page.get_by_role("button", name=re.compile("^"+re.escape(tab)+" ")).click()
            page.get_by_role("button", name="Add New Record", exact=True).click()
            name = f"Browser fixture {resource} {stamp}"
            inputs = page.locator('input')
            inputs.first.fill(name)
            if resource != "destinations":
                inputs.nth(1).fill("23.0225")
                inputs.nth(2).fill("72.5714")
                if resource == "hotels": inputs.nth(3).fill("1234")
                if resource == "restaurants": inputs.nth(3).fill("150")
            with page.expect_response(lambda r: r.request.method=="POST" and "/admin/"+resource in r.url) as created:
                page.get_by_role("button", name="Save Record", exact=True).click()
            assert created.value.status == 201, created.value.text()
            fixture_id = created.value.json()["id"]
            if resource == "destinations":
                # A genuinely empty temporary city, not an intercepted catalog response.
                empty_page = context.new_page()
                empty_page.on("response", record)
                empty_page.goto(BASE + "/destination/" + fixture_id)
                expect(empty_page.get_by_text(name, exact=True).first).to_be_visible()
                for category in ("attractions", "hotels", "restaurants"):
                    empty = empty_page.request.get(API + f"/destinations/{fixture_id}/{category}")
                    assert empty.status == 200 and empty.json() == []
                # sessionStorage is tab-scoped; authenticate this new tab normally.
                login(empty_page, tourist_email, password)
                empty_page.get_by_role("button", name="Create New Heritage Route").click()
                empty_page.get_by_role("button", name=name + " Not available", exact=True).click()
                expect(empty_page.get_by_text("0 Hotel Options", exact=True)).to_be_visible()
                expect(empty_page.get_by_text("0 Restaurants", exact=True)).to_be_visible()
                empty_page.close()
                check("Real empty city has zero hotels/restaurants without fallback", status=200)
            wrong_role = {}
            for method, path, body in [
                ("POST", f"/admin/{resource}", created.value.request.post_data_json),
                ("PUT", f"/admin/{resource}/{fixture_id}", {"name":"Wrong-role mutation must fail"}),
                ("DELETE", f"/admin/{resource}/{fixture_id}", None),
            ]:
                response = page.request.fetch(API + path, method=method, data=body, headers={"Authorization":"Bearer " + token})
                wrong_role[method] = response.status
                assert response.status == 403, response.text()
            operator_token = page.evaluate("sessionStorage.getItem('heritage_api_token')")
            unchanged = page.request.get(API + f"/admin/{resource}/{fixture_id}", headers={"Authorization":"Bearer " + operator_token})
            assert unchanged.status == 200 and unchanged.json()["name"] == name
            check("Tourist cannot mutate " + resource, statuses=wrong_role, recordUnchanged=True)
            row = page.get_by_role("row").filter(has_text=name)
            row.get_by_role("button", name="Edit", exact=True).click()
            page.locator('input').first.fill(name+" updated")
            if resource in ("hotels", "restaurants"):
                page.locator('input').nth(3).fill("")
                page.get_by_role("button", name="Save Record", exact=True).click()
                expect(page.get_by_text("Enter a known price. A blank price cannot be saved as zero.", exact=True)).to_be_visible()
                after_blank = page.request.get(API + f"/admin/{resource}/{fixture_id}", headers={"Authorization":"Bearer " + operator_token})
                price_field = "price_per_night" if resource == "hotels" else "avg_cost_per_person"
                assert float(after_blank.json()[price_field]) == (1234 if resource == "hotels" else 150)
                page.locator('input').nth(3).fill("1234" if resource == "hotels" else "150")
                check("Blank " + resource + " price is rejected without changing stored cost")
            with page.expect_response(lambda r: r.request.method=="PUT" and "/admin/"+resource in r.url) as updated:
                page.get_by_role("button", name="Save Record", exact=True).click()
            assert updated.value.status == 200, updated.value.text()
            row = page.get_by_role("row").filter(has_text=name+" updated")
            row.get_by_role("button", name="Delete", exact=True).click()
            with page.expect_response(lambda r: r.request.method=="DELETE" and "/admin/"+resource in r.url) as deleted:
                page.get_by_role("button", name="Delete Record", exact=True).click()
            assert deleted.value.status == 204
            expect(page.get_by_role("row").filter(has_text=name)).to_have_count(0)
            check("Operator UI CRUD: "+resource, create=201, update=200, delete=204)
        page.goto(BASE + "/destination/00000000-0000-4000-8000-000000000001")
        expect(page.get_by_text("Sabarmati Ashram", exact=True)).to_have_count(0)
        page.screenshot(path=str(ROOT / "backend/reports/final-invalid-destination-browser.png"), full_page=True)
        check("Invalid destination does not fabricate a catalog card")
        page.evaluate("sessionStorage.removeItem('heritage_api_token')")
        page.goto(BASE + "/profile")
        page.wait_for_url("**/login")
        page.reload()
        expect(page.locator('input[type=password]')).to_be_visible()
        check("Refresh without JWT remains logged out")
        assert not report["pageErrors"], report["pageErrors"]
        duplicate_keys=[m for m in report["consoleMessages"] if 'same key' in m['text']]
        assert not duplicate_keys,duplicate_keys
        check("Repeated itinerary legs render without duplicate React keys")
        report["verified"] = True
    except Exception as error:
        report["failure"] = str(error)
        try: report["failurePageText"] = page.locator('body').inner_text(timeout=2000)
        except Exception: report["failurePageText"] = "Unavailable after failure"
        raise
    finally:
        save()
        browser.close()
