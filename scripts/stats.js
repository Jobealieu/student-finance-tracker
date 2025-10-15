export function calculateStats(transactions, settings) {
  const stats = {
    totalRecords: transactions.length,
    totalAmount: 0,
    topCategory: null,
    last7Days: [],
    categoryBreakdown: {},
    averageTransaction: 0,
    budgetRemaining: 0,
    budgetPercentage: 0,
  };

  if (transactions.length === 0) {
    stats.budgetRemaining = settings.budget;
    return stats;
  }

  stats.totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  stats.averageTransaction = stats.totalAmount / transactions.length;

  const categoryCount = {};
  transactions.forEach((t) => {
    stats.categoryBreakdown[t.category] =
      (stats.categoryBreakdown[t.category] || 0) + t.amount;
    categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
  });

  let maxCount = 0;
  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count;
      stats.topCategory = category;
    }
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  stats.last7Days = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= sevenDaysAgo;
  });

  stats.budgetRemaining = settings.budget - stats.totalAmount;
  stats.budgetPercentage = (stats.totalAmount / settings.budget) * 100;

  return stats;
}

export function formatCurrency(amount, settings) {
  const currency = settings.currencies[settings.baseCurrency];
  return `${currency.symbol}${amount.toFixed(2)}`;
}

export function convertCurrency(amount, fromCurrency, toCurrency, settings) {
  const fromRate = settings.currencies[fromCurrency].rate;
  const toRate = settings.currencies[toCurrency].rate;
  return (amount / fromRate) * toRate;
}

export function getDailyTrend(transactions, days = 7) {
  const trend = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const dayTotal = transactions
      .filter((t) => t.date === dateString)
      .reduce((sum, t) => sum + t.amount, 0);

    trend.push({
      date: dateString,
      amount: dayTotal,
      label: i === 0 ? "Today" : `${i}d ago`,
    });
  }

  return trend;
}
