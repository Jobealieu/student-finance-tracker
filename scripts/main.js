import { appState } from "./state.js";
import {
  renderDashboard,
  renderTransactionsTable,
  populateCategoryOptions,
  handleTransactionSubmit,
  resetTransactionForm,
  handleSearch,
  handleSort,
  handleImport,
  handleExport,
} from "./ui.js";
import { clearAllData } from "./storage.js";

function initializeApp() {
  appState.initialize();

  appState.subscribe((state) => {
    const currentPage = document.body.dataset.page;

    if (currentPage === "dashboard") {
      renderDashboard();
    } else if (currentPage === "records") {
      renderTransactionsTable();
    }
  });

  const currentPage = document.body.dataset.page;

  if (currentPage === "dashboard") {
    initializeDashboard();
  } else if (currentPage === "records") {
    initializeRecords();
  } else if (currentPage === "settings") {
    initializeSettings();
  }

  setupSkipLink();
}

function initializeDashboard() {
  renderDashboard();
}

function initializeRecords() {
  const form = document.getElementById("transaction-form");
  if (form) {
    populateCategoryOptions();
    form.addEventListener("submit", handleTransactionSubmit);

    document.getElementById("cancel-btn").addEventListener("click", () => {
      resetTransactionForm();
    });
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }

  const sortHeaders = document.querySelectorAll(".sortable");
  sortHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const column = header.dataset.sort;
      handleSort(column);
    });
  });

  document.querySelectorAll(".search-suggestion").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const pattern = e.target.dataset.pattern;
      document.getElementById("search-input").value = pattern;
      handleSearch({ target: { value: pattern } });
    });
  });

  renderTransactionsTable();
}

function initializeSettings() {
  const state = appState.getState();

  document.getElementById("base-currency").value = state.settings.baseCurrency;
  document.getElementById("budget").value = state.settings.budget;
  document.getElementById("usd-rate").value =
    state.settings.currencies.USD.rate;
  document.getElementById("eur-rate").value =
    state.settings.currencies.EUR.rate;
  document.getElementById("gbp-rate").value =
    state.settings.currencies.GBP.rate;

  document.getElementById("settings-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const newSettings = {
      baseCurrency: document.getElementById("base-currency").value,
      budget: parseFloat(document.getElementById("budget").value),
      currencies: {
        USD: {
          symbol: "$",
          rate: parseFloat(document.getElementById("usd-rate").value),
        },
        EUR: {
          symbol: "€",
          rate: parseFloat(document.getElementById("eur-rate").value),
        },
        GBP: {
          symbol: "£",
          rate: parseFloat(document.getElementById("gbp-rate").value),
        },
      },
    };

    appState.updateSettings(newSettings);

    const statusEl = document.getElementById("status-announcer");
    statusEl.textContent = "Settings saved successfully";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  });

  document.getElementById("import-btn").addEventListener("click", handleImport);
  document.getElementById("export-btn").addEventListener("click", handleExport);

  document
    .getElementById("clear-data-btn")
    .addEventListener("click", async () => {
      if (
        confirm(
          "Are you sure you want to clear all data? This cannot be undone."
        )
      ) {
        const { clearAllData } = await import("./storage.js");
        clearAllData();
        appState.initialize();
        alert("All data cleared");
        window.location.href = "dashboard.html";
      }
    });
}

function setupSkipLink() {
  const skipLink = document.getElementById("skip-link");
  if (skipLink) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView();
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
