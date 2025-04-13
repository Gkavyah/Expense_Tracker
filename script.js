const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const ctx = document.getElementById("expenseChart").getContext("2d");

let expenses = [];
let chart;

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("expense-name").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;

  const expense = { name, amount, category };
  expenses.push(expense);
  renderExpenses();
  updateChart();
  form.reset();
});

function renderExpenses() {
  expenseList.innerHTML = "";
  expenses.forEach((expense, index) => {
    const li = document.createElement("li");
    li.textContent = `${expense.name}: ₹${expense.amount} (${expense.category})`;
    expenseList.appendChild(li);
  });
}

function updateChart() {
  const categoryTotals = {};

  expenses.forEach(expense => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (chart) chart.destroy(); // Destroy old chart if it exists

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        label: "Expense Breakdown",
        data,
        backgroundColor: [
          "#3498db",
          "#e67e22",
          "#9b59b6",
          "#1abc9c",
          "#f1c40f"
        ]
      }]
    }
  });
}
