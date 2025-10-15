const STORAGE_KEY = "student_finance_tracker";
const SETTINGS_KEY = "student_finance_settings";

export function loadTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return [];
  }
}

export function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error("Failed to save transactions:", error);
    return false;
  }
}

export function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : getDefaultSettings();
  } catch (error) {
    console.error("Failed to load settings:", error);
    return getDefaultSettings();
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Failed to save settings:", error);
    return false;
  }
}

function getDefaultSettings() {
  return {
    baseCurrency: "USD",
    currencies: {
      USD: { symbol: "$", rate: 1.0 },
      EUR: { symbol: "€", rate: 0.92 },
      GBP: { symbol: "£", rate: 0.79 },
    },
    budget: 500,
    categories: [
      "Food",
      "Books",
      "Transport",
      "Entertainment",
      "Fees",
      "Other",
    ],
  };
}

export function exportToJSON(transactions) {
  return JSON.stringify(transactions, null, 2);
}

export function importFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (!Array.isArray(data)) {
      throw new Error("Data must be an array");
    }

    for (const item of data) {
      if (!item.id || typeof item.id !== "string") {
        throw new Error("Each transaction must have a valid id");
      }
      if (!item.description || typeof item.description !== "string") {
        throw new Error("Each transaction must have a valid description");
      }
      if (typeof item.amount !== "number" || item.amount < 0) {
        throw new Error("Each transaction must have a valid amount");
      }
      if (!item.category || typeof item.category !== "string") {
        throw new Error("Each transaction must have a valid category");
      }
      if (!item.date || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        throw new Error("Each transaction must have a valid date");
      }
      if (!item.createdAt || !item.updatedAt) {
        throw new Error(
          "Each transaction must have createdAt and updatedAt timestamps"
        );
      }
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear data:", error);
    return false;
  }
}

export {
  loadTransactions,
  saveTransactions,
  loadSettings,
  saveSettings,
  exportToJSON,
  importFromJSON,
  clearAllData,
};
