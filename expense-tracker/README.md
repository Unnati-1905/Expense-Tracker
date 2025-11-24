# Expense Tracker (HTML, CSS, JavaScript)

A responsive, front‑end Expense Tracker that lets users add **income and expenses**, categorize transactions, and view **totals and net balance**. Data is persisted with **localStorage**. Includes optional **filtering**, **editing**, **export/import JSON**, and a **pie chart** for expense distribution (via Chart.js CDN).

## 🎯 Objective
Design and build an Expense Tracker web app using vanilla **HTML, CSS, and JavaScript** that:
- Accepts transactions (date, description, category, amount, type)
- Calculates **total income**, **total expenses**, and **net**
- Displays a **transaction list** with categories and actions
- Is **responsive** and validates inputs

## 🚀 Getting Started
1. Download and unzip the project.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. (Optional) Serve with a simple local server (e.g., VS Code “Live Server”) for best experience.

## 🧩 Features
- Add **Income** or **Expense** transactions with date, description, category, and amount.
- **Validation** ensures all fields are correct.
- **Totals**: income, expense, and net automatically update.
- **Transaction list** with **edit** and **delete** actions.
- **Filters**: by category, search text, and sort order.
- **Responsive** layout for desktop/tablet/mobile.
- **Persistence**: stored in `localStorage`.
- **Export/Import**: JSON file of transactions.
- **Chart**: optional pie chart of expenses by category (loads if Chart.js is available).

## 📂 Project Structure
```
expense-tracker/
├─ index.html      # UI structure, summary cards, form, filters, list, chart
├─ styles.css      # Visual styles and responsive layout
├─ app.js          # App logic: state, validation, rendering, storage, chart
├─ README.md       # How to run and use
└─ DOCS.md         # Code structure and documentation
```

## 📝 How to Use
1. Fill the **form** and click **Add Transaction**.
2. Use **Filters** to narrow by category, search, or sort.
3. Click **Edit** to modify a transaction; **Save Changes** or **Cancel Edit**.
4. Click **Delete** to remove a transaction.
5. Use **Export JSON** / **Import JSON** for backups.
6. Use **Clear All** to wipe all data (with confirmation).

## 🛠️ Tech
- **HTML5**, **CSS3**, **JavaScript (ES6+)**
- **Chart.js** via CDN (optional)

## ✅ Requirements Mapping
- **User Interface**: clean, responsive UI with sections for income, expenses, list, and form.
- **Transaction Mgmt**: add income/expense separately; categories included and displayed.
- **Calculations**: total income, total expenses, net.
- **Styling & Responsiveness**: modern design; mobile friendly.
- **Validation**: required fields; amount > 0; error messages.
- **Persistence**: localStorage.
- **Bonus**: filter by category, pie chart, edit/update, export/import.

## 📄 License
MIT — use freely for learning and projects.
