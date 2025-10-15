import {
  loadTransactions,
  saveTransactions,
  loadSettings,
  saveSettings,
} from "./storage.js";

class AppState {
  constructor() {
    this.transactions = [];
    this.settings = null;
    this.currentView = "dashboard";
    this.editingId = null;
    this.searchPattern = "";
    this.sortBy = "date";
    this.sortOrder = "desc";
    this.listeners = [];
  }

  initialize() {
    this.transactions = loadTransactions();
    this.settings = loadSettings();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  getState() {
    return {
      transactions: this.transactions,
      settings: this.settings,
      currentView: this.currentView,
      editingId: this.editingId,
      searchPattern: this.searchPattern,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };
  }

  addTransaction(transaction) {
    const newTransaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.transactions.push(newTransaction);
    saveTransactions(this.transactions);
    this.notify();
    return newTransaction;
  }

  updateTransaction(id, updates) {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.transactions[index] = {
      ...this.transactions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveTransactions(this.transactions);
    this.notify();
    return true;
  }

  deleteTransaction(id) {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.transactions.splice(index, 1);
    saveTransactions(this.transactions);
    this.notify();
    return true;
  }

  setTransactions(transactions) {
    this.transactions = transactions;
    saveTransactions(this.transactions);
    this.notify();
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    saveSettings(this.settings);
    this.notify();
  }

  setSearchPattern(pattern) {
    this.searchPattern = pattern;
    this.notify();
  }

  setSorting(sortBy, sortOrder) {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.notify();
  }

  setEditingId(id) {
    this.editingId = id;
    this.notify();
  }

  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `txn_${timestamp}_${random}`;
  }

  sortTransactions(transactions) {
    const sorted = [...transactions];

    sorted.sort((a, b) => {
      let compareA, compareB;

      switch (this.sortBy) {
        case "date":
          compareA = new Date(a.date);
          compareB = new Date(b.date);
          break;
        case "description":
          compareA = a.description.toLowerCase();
          compareB = b.description.toLowerCase();
          break;
        case "amount":
          compareA = a.amount;
          compareB = b.amount;
          break;
        case "category":
          compareA = a.category.toLowerCase();
          compareB = b.category.toLowerCase();
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return this.sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return this.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }
}

export const appState = new AppState();
