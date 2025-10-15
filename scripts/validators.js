export const REGEX_PATTERNS = {
  description: {
    pattern: /^\S(?:.*\S)?$/,
    message: "Description cannot have leading or trailing spaces",
    test: (value) => {
      if (!value || value.trim() === "") return "Description is required";
      if (!/^\S(?:.*\S)?$/.test(value))
        return "Description cannot have leading or trailing spaces";
      if (/\s{2,}/.test(value))
        return "Description cannot have multiple consecutive spaces";
      return null;
    },
  },
  amount: {
    pattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    message: "Amount must be a valid number with up to 2 decimal places",
    test: (value) => {
      if (!value) return "Amount is required";
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return "Amount must be a number";
      if (numValue < 0) return "Amount cannot be negative";
      if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value))
        return "Amount must be a valid number with up to 2 decimal places";
      return null;
    },
  },
  date: {
    pattern: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    message: "Date must be in YYYY-MM-DD format",
    test: (value) => {
      if (!value) return "Date is required";
      if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value))
        return "Date must be in YYYY-MM-DD format";
      const date = new Date(value);
      if (isNaN(date.getTime())) return "Invalid date";
      return null;
    },
  },
  category: {
    pattern: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    message: "Category must contain only letters, spaces, and hyphens",
    test: (value) => {
      if (!value) return "Category is required";
      if (!/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(value))
        return "Category must contain only letters, spaces, and hyphens";
      return null;
    },
  },
  duplicateWords: {
    pattern: /\b(\w+)\s+\1\b/i,
    message: "Contains duplicate consecutive words",
    test: (value) => {
      if (/\b(\w+)\s+\1\b/i.test(value))
        return "Description contains duplicate consecutive words";
      return null;
    },
  },
};

export function validateField(fieldName, value) {
  const validator = REGEX_PATTERNS[fieldName];
  if (!validator) return null;
  return validator.test(value);
}

export function validateTransaction(transaction) {
  const errors = {};

  const descError = validateField("description", transaction.description);
  if (descError) errors.description = descError;

  const dupError = validateField("duplicateWords", transaction.description);
  if (dupError) errors.duplicateWords = dupError;

  const amountError = validateField("amount", transaction.amount?.toString());
  if (amountError) errors.amount = amountError;

  const dateError = validateField("date", transaction.date);
  if (dateError) errors.date = dateError;

  const categoryError = validateField("category", transaction.category);
  if (categoryError) errors.category = categoryError;

  return Object.keys(errors).length > 0 ? errors : null;
}

export function showFieldError(fieldElement, errorMessage) {
  const errorId = `${fieldElement.id}-error`;
  let errorElement = document.getElementById(errorId);

  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.id = errorId;
    errorElement.className = "field-error";
    errorElement.setAttribute("role", "alert");
    fieldElement.parentNode.appendChild(errorElement);
  }

  errorElement.textContent = errorMessage;
  fieldElement.setAttribute("aria-invalid", "true");
  fieldElement.setAttribute("aria-describedby", errorId);
}

export function clearFieldError(fieldElement) {
  const errorId = `${fieldElement.id}-error`;
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.remove();
  }

  fieldElement.removeAttribute("aria-invalid");
  fieldElement.removeAttribute("aria-describedby");
}
