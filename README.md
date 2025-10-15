*Student Finance Tracker*

A responsive, accessible, vanilla HTML/CSS/JS application to track student expenses, set budgets, and analyze spending with regex-powered search and validation.

Live demo: https://Jobealieu.github.io/student-finance-tracker

Author: Alieu O Jobe
Contact: a.jobe@alustudent.com
Repository: https://github.com/Jobealieu/student-finance-tracker

Overview
Student Finance Tracker helps students record transactions, monitor spending against a monthly budget, and explore data using regular expressions. The app stores data in localStorage and supports JSON import/export.

Features
	* Add, edit (inline via form), and delete transactions
	* Live regex search with safe compilation and highlighting
	* Sortable columns: date, description, category, amount
	* Dashboard: total transactions, total spent, top category, budget remaining
	* Last-7-days spending mini chart
	* Manual multi-currency support (USD/EUR/GBP) with editable rates
	* Import/Export JSON with structure validation
	* Seed data (seed.json) with diverse records
	* Accessibility: skip link, semantic structure, visible focus, keyboard-only flows, ARIA live regions
	* Tests page (tests.html) for validator assertions

File structure
	* index.html, dashboard.html, records.html, settings.html, about.html
	* styles/: main.css, responsive.css, animations.css
	* scripts/: main.js, state.js, storage.js, ui.js, validators.js, search.js, stats.js
	* seed.json, tests.html, README.md

Installation / Run locally
	1. Clone the repository:
git clone https://github.com/Jobealieu/student-finance-tracker.git
	2. Open project in VSCode.
	3. Serve with a static server (required for modules):

		* Python: python3 -m http.server 5500
		* Or use Live Server VSCode extension
	4. Open http://localhost:5500 in your browser.

Deployment
	1. Push to GitHub (main branch).
	2. Go to Repository > Settings > Pages, choose branch: main and folder: / (root), save.
	3. Wait for the GitHub Pages URL and update the README.

Data model
Each transaction:
{
  id: "txn_0001",
  description: "Lunch at cafeteria",
  amount: 12.50,
  category: "Food",
  date: "YYYY-MM-DD",
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}

Regex catalog (patterns + examples)
	* Description: /^\S(?:.*\S)?$/


		* Purpose: forbids leading/trailing spaces
		* Example: "Lunch" valid, " Lunch" invalid
	* Numeric amount: /^(0|[1-9]\d*)(.\d{1,2})?$/


		* Purpose: integer or decimal with up to 2 decimals
		* Example: "12.50" valid, "12.345" invalid
	* Date (YYYY-MM-DD): /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/


		* Purpose: ensure ISO date format
	* Category/tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/


		* Purpose: letters, spaces and hyphens only
		* Example: "Student Fees" valid
	* Advanced: /\b(\w+)\s+\1\b/i (back-reference)


		* Purpose: detect duplicate consecutive words (e.g., "the the")
	* Search examples:


		* Find cents: .\d{2}\b
		* Beverage words: (coffee|tea)
		* Duplicate words: \b(\w+)\s+\1\b

Keyboard map
	* Tab / Shift+Tab: navigate interactive controls
	* Enter: activate button or submit focused form
	* Escape: cancel actions (where applicable)
	* Arrow keys: when focusable lists or controls require it
	* Skip link: press Tab then Enter to jump to content

Accessibility notes
	* Semantic landmarks: header, nav, main, section, footer
	* Skip-to-content link implemented
	* Form inputs have associated labels
	* Visible focus styles and focus-visible-friendly design
	* aria-live region (#status-announcer) for status and budget messages
	* Reduced-motion media query supported

Tests
Open tests.html in a browser with a static server to run small assertions for validators and regex compilation.

Troubleshooting
	* If imports fail, ensure you serve files over an HTTP server (file:// will not work for ES modules).
	* If GitHub Pages shows 404, ensure branch main is selected and index.html present at root.
