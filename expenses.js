// Expenses page logic

let currentCategoryFilter = 'all';
let currentTypeFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  // Check login
  checkAuth();

  // Initialize
  updateExpenseList();
  setupFilters();

  // Event listeners
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('addExpenseBtn').addEventListener('click', openAddExpenseModal);
  document.getElementById('addExpenseForm').addEventListener('submit', handleAddExpense);
  document.getElementById('expenseType').addEventListener('change', toggleSharedOptions);
});

function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn !== 'true') {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'login.html';
}

function setupFilters() {
  // Category filters
  const categoryFilters = document.querySelectorAll('#categoryFilters .filter-pill');
  categoryFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      categoryFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      currentCategoryFilter = filter.dataset.category;
      updateExpenseList();
    });
  });

  // Type filters
  const typeFilters = document.querySelectorAll('#typeFilters .filter-pill');
  typeFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      typeFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      currentTypeFilter = filter.dataset.type;
      updateExpenseList();
    });
  });
}

function updateExpenseList() {
  const expenseListContainer = document.getElementById('expenseList');
  
  // Filter expenses
  let expenses = AppData.expenses;
  
  if (currentCategoryFilter !== 'all') {
    expenses = expenses.filter(e => e.category === currentCategoryFilter);
  }
  
  if (currentTypeFilter !== 'all') {
    expenses = expenses.filter(e => e.type === currentTypeFilter);
  }

  if (expenses.length === 0) {
    expenseListContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💸</div>
        <h3>No expenses found</h3>
        <p>Try adjusting your filters or add a new expense</p>
        <button class="btn btn-primary" onclick="openAddExpenseModal()">
          Add Expense
        </button>
      </div>
    `;
    return;
  }

  // Render expenses
  const categoryIcons = {
    'Food': '🍔',
    'Groceries': '🛒',
    'Utilities': '💡',
    'Transport': '🚗',
    'Entertainment': '🎮',
    'Other': '📦'
  };

  expenseListContainer.innerHTML = expenses.map(expense => {
    const icon = categoryIcons[expense.category] || '📦';
    const paidByPerson = AppData.roommates.find(r => r.id === expense.paidBy);
    const paidByName = paidByPerson ? paidByPerson.name : 'Unknown';
    const userShare = AppData.getUserShare(expense.id);
    const date = new Date(expense.date);
    const formattedDate = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    return `
      <div class="card expense-card">
        <div class="expense-card-left">
          <div class="expense-icon">${icon}</div>
          <div class="expense-details">
            <div class="expense-title">${expense.title}</div>
            <div class="expense-meta">
              <span class="expense-date">📅 ${formattedDate}</span>
              <span class="expense-payer">💳 ${paidByName}</span>
            </div>
            <div class="expense-tags">
              <span class="tag tag-category">${expense.category}</span>
              <span class="tag tag-${expense.type}">${expense.type === 'shared' ? 'Shared' : 'Personal'}</span>
            </div>
          </div>
        </div>
        <div class="expense-amount">
          <div class="expense-total">₹${formatCurrency(expense.amount)}</div>
          <div class="expense-share">Your share: ₹${formatCurrency(userShare)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function openAddExpenseModal() {
  // Populate roommate options
  populateRoommateOptions();
  
  // Reset form
  document.getElementById('addExpenseForm').reset();
  document.getElementById('sharedWithGroup').style.display = 'none';
  
  document.getElementById('addExpenseModal').classList.remove('hidden');
}

function closeAddExpenseModal() {
  document.getElementById('addExpenseModal').classList.add('hidden');
}

function populateRoommateOptions() {
  // Populate "Paid by" dropdown
  const paidBySelect = document.getElementById('paidBy');
  paidBySelect.innerHTML = AppData.roommates.map(roommate => 
    `<option value="${roommate.id}">${roommate.name}</option>`
  ).join('');

  // Populate "Share with" checkboxes
  const checkboxContainer = document.getElementById('roommateCheckboxes');
  checkboxContainer.innerHTML = AppData.roommates.map(roommate => `
    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
      <input 
        type="checkbox" 
        name="sharedWith" 
        value="${roommate.id}"
        ${roommate.isCurrentUser ? 'checked' : ''}
        style="width: 18px; height: 18px; cursor: pointer;"
      >
      <span style="font-weight: 500; color: hsl(210, 10%, 25%);">${roommate.name}</span>
    </label>
  `).join('');
}

function toggleSharedOptions() {
  const expenseType = document.getElementById('expenseType').value;
  const sharedWithGroup = document.getElementById('sharedWithGroup');
  
  if (expenseType === 'shared') {
    sharedWithGroup.style.display = 'block';
  } else {
    sharedWithGroup.style.display = 'none';
  }
}

function handleAddExpense(e) {
  e.preventDefault();

  const title = document.getElementById('expenseTitle').value.trim();
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const type = document.getElementById('expenseType').value;
  const paidBy = document.getElementById('paidBy').value;

  let sharedWith = [paidBy]; // Always include payer
  
  if (type === 'shared') {
    const checkedBoxes = document.querySelectorAll('input[name="sharedWith"]:checked');
    if (checkedBoxes.length === 0) {
      alert('Please select at least one person to share with');
      return;
    }
    sharedWith = Array.from(checkedBoxes).map(cb => cb.value);
  }

  // Add expense
  AppData.addExpense({
    title,
    amount,
    category,
    type,
    paidBy,
    sharedWith
  });

  AppData.save();
  updateExpenseList();
  closeAddExpenseModal();
}

function formatCurrency(amount) {
  return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Update list when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    AppData.load();
    updateExpenseList();
  }
});
