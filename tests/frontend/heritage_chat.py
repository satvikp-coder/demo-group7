"""Isolated real auth/API/PostgreSQL; provider double explicitly marked, never live-AI proof."""
import os,json,time,secrets
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ["FRONTEND_TEST_URL"];api=os.environ["API_TEST_URL"];assert ":5310/" in api
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel="chrome",headless=True)
 for width in [1440,768,390]:
  ctx=browser.new_context(viewport={"width":width,"height":950});page=ctx.new_page();errors=[];requests=[]
  page.on("pageerror",lambda e:errors.append(str(e)))
  page.on("request",lambda r:requests.append(r.url) if "/api/chat" in r.url else None)
  page.goto(base);launcher=page.get_by_role("button",name="Open Heritage Guide",exact=True);expect(launcher).to_be_visible()
  assert not page.locator("#heritage-guide-panel").count();assert not requests
  launcher.click();panel=page.locator("#heritage-guide-panel");expect(panel).to_be_visible()
  assert not requests;expect(panel.get_by_role("button",name="Sign in to chat")).to_be_visible()
  panel.get_by_role("button",name="Close Heritage Guide").click();expect(launcher).to_be_focused()
  launcher.click();panel.get_by_role("button",name="Sign in to chat").click();page.wait_for_url("**/login")
  email="chat-"+str(time.time_ns())+"@example.test";password=secrets.token_urlsafe(20)+"Aa9!"
  assert ctx.request.post(api+"/auth/register",data={"name":"Isolated chat user","email":email,"password":password,"role":"tourist"}).status==201
  page.locator("input[type=email]").fill(email);page.locator("input[type=password]").fill(password);page.locator("button[type=submit]").click();page.wait_for_url("**/profile")
  page.get_by_role("button",name="Open Heritage Guide").click();panel=page.locator("#heritage-guide-panel");expect(panel).to_be_visible()
  input=panel.get_by_role("textbox",name="Ask Heritage Guide");expect(input).to_be_focused()
  input.fill("Tell me about Modhera.");input.press("Enter")
  expect(panel.get_by_role("status")).to_be_visible();expect(panel.locator('[data-chat-role=assistant]').last).to_contain_text("TEST PROVIDER — Modhera")
  input.fill("What attractions are there?");input.press("Enter");expect(panel.locator('[data-chat-role=assistant]')).to_have_count(2)
  input.fill("TEST_PROVIDER_FAILURE");input.press("Enter");expect(panel.get_by_role("alert")).to_contain_text("temporarily unavailable")
  panel.get_by_role("button",name="Retry",exact=True).click();expect(panel.get_by_role("alert")).to_be_visible()
  panel.get_by_role("button",name="Clear conversation").click();expect(panel.locator('[data-chat-role=assistant]')).to_have_count(0)
  panel.get_by_text("Database-only mode (not AI)",exact=True).click();panel.get_by_label("Destination",exact=True).select_option(label="Modhera")
  panel.get_by_role("button",name="Look up",exact=True).click();expect(panel.locator('[data-chat-role=assistant]').last).to_contain_text("no AI request was made")
  expect(panel.locator('[data-chat-role=assistant]').last).to_contain_text("Sun Temple")
  assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
  box=panel.bounding_box();assert box["x"]>=0 and box["x"]+box["width"]<=width
  assert not errors
  # AI output is escaped React text; duplicate Enter does not create two requests.
  panel.get_by_text("Database-only mode (not AI)",exact=True).click()
  before=len(requests);input.fill("TEST_HTML");input.press("Enter");input.press("Enter")
  expect(panel.locator('[data-chat-role=assistant]').last).to_contain_text("<img")
  assert len(requests)==before+1 and panel.locator("img").count()==0
  assert page.evaluate("window.chatUnsafe") is None
  input.fill("TEST_RATE_LIMIT");input.press("Enter");expect(panel.get_by_role("alert")).to_contain_text("temporary free usage limit")
  expect(panel.get_by_role("button",name="Retry",exact=True)).to_be_disabled()
  # Database-only mode remains available when the external AI quota is exhausted.
  panel.get_by_text("Database-only mode (not AI)",exact=True).click()
  panel.get_by_role("button",name="Look up",exact=True).click()
  expect(panel.locator('[data-chat-role=assistant]').last).to_contain_text("no AI request was made")
  Path("reports").mkdir(exist_ok=True);page.screenshot(path=f"reports/heritage-guide-{width}.png")
  page.keyboard.press("Escape");expect(page.get_by_role("button",name="Open Heritage Guide")).to_be_focused()
  # Same-tab logout/account change immediately discards private messages.
  page.evaluate("sessionStorage.removeItem('heritage_api_token');window.dispatchEvent(new Event('heritage-auth-change'))")
  page.get_by_role("button",name="Open Heritage Guide").click();expect(page.locator("#heritage-guide-panel").get_by_role("button",name="Sign in to chat")).to_be_visible()
  assert not page.locator('[data-chat-role=assistant]').count()
  results.append({"viewport":width,"passed":True,"consoleErrors":errors,"provider":"TEST_DOUBLE_NOT_LIVE_GROQ","realDatabase":True})
  # Localized launcher/panel and suggestions; opening never sends provider requests.
  for language in ["hi","gu"]:
   page.evaluate("lang=>localStorage.setItem('app_language',lang)",language);page.goto(base)
   localized=page.locator('button[aria-controls="heritage-guide-panel"]');expect(localized).to_be_visible()
   assert localized.get_attribute("aria-label")!="Open Heritage Guide"
   before=len(requests);localized.click();expect(page.locator("#heritage-guide-panel")).to_be_visible();assert len(requests)==before
  ctx.close()
 browser.close()
Path("reports/heritage-guide-browser.json").write_text(json.dumps({"verified":True,"results":results},indent=2))
