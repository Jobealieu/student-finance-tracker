export function compileRegex(pattern, flags = "i") {
  try {
    return pattern ? new RegExp(pattern, flags) : null;
  } catch (error) {
    return null;
  }
}

export function highlightMatches(text, regex) {
  if (!regex || !text) return text;

  try {
    return text.replace(regex, (match) => `<mark>${escapeHtml(match)}</mark>`);
  } catch (error) {
    return text;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function searchTransactions(
  transactions,
  searchPattern,
  caseSensitive = false
) {
  if (!searchPattern) return transactions;

  const regex = compileRegex(searchPattern, caseSensitive ? "g" : "gi");
  if (!regex) return transactions;

  return transactions.filter((transaction) => {
    return (
      regex.test(transaction.description) ||
      regex.test(transaction.category) ||
      regex.test(transaction.amount.toString()) ||
      regex.test(transaction.date)
    );
  });
}

export function getSearchSuggestions() {
  return [
    { label: "Find amounts with cents", pattern: "\\.\\d{2}\\b" },
    { label: "Find coffee or tea", pattern: "(coffee|tea)" },
    { label: "Find duplicate words", pattern: "\\b(\\w+)\\s+\\1\\b" },
    { label: "Find Food category", pattern: "^Food$" },
    { label: "Find amounts over $50", pattern: "[5-9]\\d\\.\\d{2}|\\d{3,}" },
  ];
}
