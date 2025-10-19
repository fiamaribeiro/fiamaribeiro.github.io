
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Listen for console events and print them to the terminal
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        page.goto("http://localhost:8000/index.html")

        try:
            # Wait for the element to appear
            page.wait_for_selector("#repo-grid .proj")
            element = page.query_selector("#repo-grid")
            if element:
                element.screenshot(path="jules-scratch/verification/verification.png")
                print("Success screenshot taken.")
        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # On failure, take a screenshot of the entire page for debugging
            page.screenshot(path="jules-scratch/verification/failure.png")
            print("Failure screenshot taken.")
        finally:
            browser.close()

run()
