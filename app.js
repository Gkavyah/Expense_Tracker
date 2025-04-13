let total = 0;

function addExpense() {
  const name = document.getElementById('name').value;
  const amount = parseFloat(document.getElementById('amount').value);

  if (name && !isNaN(amount)) {
    const li = document.createElement('li');
    li.textContent = `${name}: ₹${amount}`;
    document.getElementById('expense-list').appendChild(li);

    total += amount;
    document.getElementById('total').textContent = total.toFixed(2);

    // Clear input fields
    document.getElementById('name').value = '';
    document.getElementById('amount').value = '';
  } else {
    alert('Please enter valid expense name and amount');
  }
}
