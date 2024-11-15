let users = [];
let loggedInUser = null;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budget = JSON.parse(localStorage.getItem('budget')) || {
    income: 0,
    housing: 0,
    food: 0,
    entertainment: 0,
    others: 0,
    remaining: 0,
    spent: 0
};

let budgetPieChart, expensesBarChart;

window.onload = function () {
    loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    }

    let darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // Load existing budget and expenses data on page load
    updateDashboard();
};

// Register User
function registerUser() {
    let username = document.getElementById('regUsername').value;
    let email = document.getElementById('regEmail').value;
    let password = document.getElementById('regPassword').value;

    if (username && email && password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        alert('Registration Successful');
        window.location.href = 'login.html';
    } else {
        alert('Please fill all fields');
    }
}

// Login User
function loginUser() {
    let username = document.getElementById('loginUsername').value;
    let password = document.getElementById('loginPassword').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        alert('Login Successful');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid Credentials');
    }
}

// Logout User
function logoutUser() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}

// Add Expense
function addExpense() {
    let name = document.getElementById('expenseName').value;
    let amount = parseFloat(document.getElementById('expenseAmount').value);
    let category = document.getElementById('expenseCategory').value;
    let date = document.getElementById('expenseDate').value || new Date().toISOString().split('T')[0];

    if (name && amount && category) {
        let expense = { id: Date.now(), name, amount, category, date };
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateDashboard();
        checkBudgetLimits();
    } else {
        alert('Please fill all fields');
    }
}

// Edit Expense
function editExpense(id) {
    let expense = expenses.find(e => e.id === id);
    if (expense) {
        document.getElementById('expenseName').value = expense.name;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseDate').value = expense.date;
        deleteExpense(id);
    }
}

// Delete Expense
function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateDashboard();
}

// Add or Update Budget
function updateBudget() {
    let income = parseFloat(document.getElementById('income').value);
    let housingPercentage = parseFloat(document.getElementById('housingPercentage').value);
    let foodPercentage = parseFloat(document.getElementById('foodPercentage').value);
    let entertainmentPercentage = parseFloat(document.getElementById('entertainmentPercentage').value);
    let othersPercentage = parseFloat(document.getElementById('othersPercentage').value);

    if (income && housingPercentage + foodPercentage + entertainmentPercentage + othersPercentage === 100) {
        budget.income = income;
        budget.housing = (housingPercentage / 100) * income;
        budget.food = (foodPercentage / 100) * income;
        budget.entertainment = (entertainmentPercentage / 100) * income;
        budget.others = (othersPercentage / 100) * income;
        budget.remaining = income - expenses.reduce((total, expense) => total + expense.amount, 0);
        localStorage.setItem('budget', JSON.stringify(budget));
        updateDashboard();
    } else {
        alert('Please fill all fields and ensure percentages add up to 100.');
    }
}

// Check if expenses exceed budget
function checkBudgetLimits() {
    let totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    if (totalExpenses > budget.income) {
        alert('Warning: You have exceeded your budget!');
    } else if (totalExpenses > budget.income * 0.9) {
        alert('Warning: You are about to exceed your budget!');
    }
}

// Update Dashboard with Data and Charts
function updateDashboard() {
    let totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    budget.spent = (totalExpenses / budget.income) * 100;
    budget.remaining = budget.income - totalExpenses;

    document.getElementById('currentBudget').textContent = budget.income.toFixed(2);
    document.getElementById('remainingBudget').textContent = budget.remaining.toFixed(2);
    document.getElementById('budgetSpent').textContent = budget.spent.toFixed(2) + '%';

    let expensesList = document.getElementById('expenses');
    expensesList.innerHTML = '';
    expenses.forEach(expense => {
        let expenseItem = document.createElement('div');
        expenseItem.innerHTML = `
            <p>${expense.name} - $${expense.amount} [${expense.category}] on ${expense.date}</p>
            <button onclick="editExpense(${expense.id})">Edit</button>
            <button onclick="deleteExpense(${expense.id})">Delete</button>
        `;
        expensesList.appendChild(expenseItem);
    });

    updateBudgetPieChart();
    updateExpensesBarChart();
}

// Update the Pie Chart for budget allocation
function updateBudgetPieChart() {
    const ctx = document.getElementById('budgetPieChart').getContext('2d');
    if (budgetPieChart) budgetPieChart.destroy();
    
    budgetPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Housing', 'Food', 'Entertainment', 'Others'],
            datasets: [{
                data: [budget.housing, budget.food, budget.entertainment, budget.others],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Update the Bar Chart for expenses by category
function updateExpensesBarChart() {
    const ctx = document.getElementById('expensesBarChart').getContext('2d');
    if (expensesBarChart) expensesBarChart.destroy();

    let categories = ['Housing', 'Food', 'Entertainment', 'Others'];
    let expenseData = { 'Housing': 0, 'Food': 0, 'Entertainment': 0, 'Others': 0 };

    expenses.forEach(expense => {
        if (expenseData[expense.category]) {
            expenseData[expense.category] += expense.amount;
        } else {
            expenseData[expense.category] = expense.amount;
        }
    });

    expensesBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Expenses',
                data: [expenseData['Housing'], expenseData['Food'], expenseData['Entertainment'], expenseData['Others']],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    let isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

// Export Expenses to CSV
function exportExpensesToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Name,Amount,Category,Date\n";
    expenses.forEach(expense => {
        csvContent += `${expense.name},${expense.amount},${expense.category},${expense.date}\n`;
    });
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'expenses.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
