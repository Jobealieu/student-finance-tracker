import { appState } from "./state.js";
import { calculateStats, formatCurrency, getDailyTrend } from "./stats.js";
import {
  searchTransactions,
  highlightMatches,
  compileRegex,
} from "./search.js";
import {
  validateTransaction,
  showFieldError,
  clearFieldError,
} from "./validators.js";
import { exportToJSON, importFromJSON, clearAllData } from "./storage.js";

export function announceStatus(message, priority = "polite") {
  const statusElement = document.getElementById("status-announcer");
  if (!statusElement) return;

  statusElement.setAttribute("aria-live", priority);
  statusElement.textContent = message;

  setTimeout(() => {
    statusElement.textContent = "";
  }, 3000);
}

export function renderDashboard() {
  const state = appState.getState();
  const stats = calculateStats(state.transactions, state.settings);

  const totalRecordsEl = document.getElementById("total-records");
  const totalAmountEl = document.getElementById("total-amount");
  const topCategoryEl = document.getElementById("top-category");
  const budgetRemainingEl = document.getElementById("budget-remaining");
  const budgetBarEl = document.getElementById("budget-bar");

  if (totalRecordsEl) totalRecordsEl.textContent = stats.totalRecords;
  if (totalAmountEl)
    totalAmountEl.textContent = formatCurrency(
      stats.totalAmount,
      state.settings
    );
  if (topCategoryEl) topCategoryEl.textContent = stats.topCategory || "N/A";
  if (budgetRemainingEl) {
    budgetRemainingEl.textContent = formatCurrency(
      Math.abs(stats.budgetRemaining),
      state.settings
    );
    budgetRemainingEl.className =
      stats.budgetRemaining >= 0 ? "positive" : "negative";
  }

  if (budgetBarEl) {
    const percentage = Math.min(stats.budgetPercentage, 100);
    budgetBarEl.style.width = `${percentage}%`;
    budgetBarEl.className =
      percentage > 90 ? "danger" : percentage > 75 ? "warning" : "success";
    budgetBarEl.setAttribute("aria-valuenow", percentage.toFixed(0));
  }

  if (stats.budgetRemaining < 0) {
    announceStatus(
      `Budget exceeded by ${formatCurrency(
        Math.abs(stats.budgetRemaining),
        state.settings
      )}`,
      "assertive"
    );
  } else if (stats.budgetPercentage > 90) {
    announceStatus(
      `Warning: ${stats.budgetPercentage.toFixed(0)}% of budget used`,
      "polite"
    );
  }

  renderCategoryBreakdown(stats.categoryBreakdown, state.settings);
  renderLast7DaysTrend(state.transactions, state.settings);
}

export function renderCategoryBreakdown(breakdown, settings) {
  const container = document.getElementById("category-breakdown");
  if (!container) return;

  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    container.innerHTML = '<p class="empty-state">No transactions yet</p>';
    return;
  }

  container.innerHTML = entries
    .map(
      ([category, amount]) => `
    <div class="category-item">
      <span class="category-name">${category}</span>
      <span class="category-amount">${formatCurrency(amount, settings)}</span>
    </div>
  `
    )
    .join("");
}

export function renderLast7DaysTrend(transactions, settings) {
  const container = document.getElementById("trend-chart");
  if (!container) return;

  const trend = getDailyTrend(transactions, 7);
  const maxAmount = Math.max(...trend.map((d) => d.amount), 1);

  container.innerHTML = trend
    .map((day) => {
      const height = (day.amount / maxAmount) * 100;
      return `
      <div class="trend-bar-wrapper">
        <div class="trend-bar" style="height: ${height}%" 
             aria-label="${day.label}: ${formatCurrency(day.amount, settings)}">
          <span class="trend-amount">${formatCurrency(
            day.amount,
            settings
          )}</span>
        </div>
        <span class="trend-label">${day.label}</span>
      </div>
    `;
    })
    .join("");
}

export function renderTransactionsTable() {
  const state = appState.getState();
  let transactions = state.transactions;

  if (state.searchPattern) {
    transactions = searchTransactions(transactions, state.searchPattern);
  }

  transactions = appState.sortTransactions(transactions);

  const tbody = document.getElementById("transactions-tbody");
  const emptyState = document.getElementById("empty-state");

  if (!tbody) return;

  if (transactions.length === 0) {
    tbody.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  const regex = compileRegex(state.searchPattern);

  tbody.innerHTML = transactions
    .map((transaction) => {
      const description = regex
        ? highlightMatches(transaction.description, regex)
        : transaction.description;
      const category = regex
        ? highlightMatches(transaction.category, regex)
        : transaction.category;

      return `
      <tr data-id="${transaction.id}">
        <td data-label="Date">${transaction.date}</td>
        <td data-label="Description">${description}</td>
        <td data-label="Category">${category}</td>
        <td data-label="Amount">${formatCurrency(
          transaction.amount,
          state.settings
        )}</td>
        <td data-label="Actions" class="actions-cell">
          <button class="btn-icon btn-edit" data-id="${
            transaction.id
          }" aria-label="Edit transaction">
            Edit
          </button>
          <button class="btn-icon btn-delete" data-id="${
            transaction.id
          }" aria-label="Delete transaction">
            Delete
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  attachTableEventListeners();
}

function attachTableEventListeners() {
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", handleEdit);
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", handleDelete);
  });
}

function handleEdit(e) {
  const id = e.currentTarget.dataset.id;
  const state = appState.getState();
  const transaction = state.transactions.find((t) => t.id === id);

  if (!transaction) return;

  document.getElementById("transaction-id").value = transaction.id;
  document.getElementById("description").value = transaction.description;
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("category").value = transaction.category;
  document.getElementById("date").value = transaction.date;

  document.getElementById("form-title").textContent = "Edit Transaction";
  document.getElementById("submit-btn").textContent = "Update Transaction";

  document.getElementById("description").focus();
  announceStatus("Editing transaction", "polite");
}

function handleDelete(e) {
  const id = e.currentTarget.dataset.id;

  if (confirm("Are you sure you want to delete this transaction?")) {
    appState.deleteTransaction(id);
    announceStatus("Transaction deleted", "polite");
  }
}

export function populateCategoryOptions() {
  const categorySelect = document.getElementById("category");
  if (!categorySelect) return;

  const state = appState.getState();
  const categories = (state.settings && state.settings.categories) || [
    "Food",
    "Books",
    "Transport",
    "Entertainment",
    "Fees",
    "Other",
  ];

  categorySelect.innerHTML = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");
}

export function handleTransactionSubmit(e) {
  e.preventDefault();

  const formData = {
    description: document.getElementById("description").value.trim(),
    amount: parseFloat(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
  };

  const errors = validateTransaction(formData);

  document.querySelectorAll(".field-error").forEach((el) => el.remove());
  document.querySelectorAll("[aria-invalid]").forEach((el) => {
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  });

  if (errors) {
    Object.entries(errors).forEach(([field, message]) => {
      const fieldElement = document.getElementById(field);
      if (fieldElement) {
        showFieldError(fieldElement, message);
      }
    });
    announceStatus("Please fix form errors", "assertive");
    return;
  }

  const id = document.getElementById("transaction-id").value;

  if (id) {
    appState.updateTransaction(id, formData);
    announceStatus("Transaction updated successfully", "polite");
  } else {
    appState.addTransaction(formData);
    announceStatus("Transaction added successfully", "polite");
  }

  resetTransactionForm();
  renderTransactionsTable();
  renderDashboard();
}

export function resetTransactionForm() {
  document.getElementById("transaction-form").reset();
  document.getElementById("transaction-id").value = "";
  document.getElementById("form-title").textContent = "Add Transaction";
  document.getElementById("submit-btn").textContent = "Add Transaction";

  document.querySelectorAll(".field-error").forEach((el) => el.remove());
  document.querySelectorAll("[aria-invalid]").forEach((el) => {
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  });
}

export function handleSearch(e) {
  const pattern = e.target.value;
  appState.setSearchPattern(pattern);
  renderTransactionsTable();

  const regex = compileRegex(pattern);
  const searchError = document.getElementById("search-error");

  if (pattern && !regex) {
    searchError.textContent = "Invalid regular expression pattern";
    searchError.style.display = "block";
  } else {
    searchError.style.display = "none";
  }
}

export function handleSort(column) {
  const state = appState.getState();
  let newOrder = "asc";

  if (state.sortBy === column) {
    newOrder = state.sortOrder === "asc" ? "desc" : "asc";
  }

  appState.setSorting(column, newOrder);
  renderTransactionsTable();

  document.querySelectorAll(".sortable").forEach((th) => {
    th.classList.remove("sort-asc", "sort-desc");
  });

  const header = document.querySelector(`[data-sort="${column}"]`);
  if (header) {
    header.classList.add(`sort-${newOrder}`);
  }
}

export function handleImport() {
  const fileInput = document.getElementById("import-file");
  const file = fileInput.files[0];

  if (!file) {
    announceStatus("Please select a file", "assertive");
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;
    const result = importFromJSON(content);

    if (result.success) {
      appState.setTransactions(result.data);
      announceStatus(`Imported ${result.data.length} transactions`, "polite");
      renderTransactionsTable();
      renderDashboard();
    } else {
      announceStatus(`Import failed: ${result.error}`, "assertive");
    }
  };

  reader.readAsText(file);
}

export function handleExport() {
  const state = appState.getState();
  const json = exportToJSON(state.transactions);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finance-tracker-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  announceStatus("Data exported successfully", "polite");
}
