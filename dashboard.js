// Dashboard page logic

document.addEventListener('DOMContentLoaded', () => {
  // Check login
  checkAuth();

  // Initialize dashboard
  updateDashboard();

  // Event listeners
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('editBudgetBtn').addEventListener('click', openEditBudgetModal);
  document.getElementById('editBudgetForm').addEventListener('submit', handleEditBudget);
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

function updateDashboard() {
  // Update budget stats
  const budgetTotal = AppData.budget.total;
  const totalUserSpent = AppData.getTotalUserSpent();
  const remaining = budgetTotal - totalUserSpent;
  const expenseCount = AppData.expenses.length;
  const percentage = budgetTotal > 0 ? (totalUserSpent / budgetTotal) * 100 : 0;

  document.getElementById('budgetTotal').textContent = formatCurrency(budgetTotal);
  document.getElementById('totalSpent').textContent = formatCurrency(totalUserSpent);
  document.getElementById('remainingBudget').textContent = formatCurrency(remaining);
  document.getElementById('userPaid').textContent = formatCurrency(totalUserSpent);
  document.getElementById('expenseCount').textContent = `${expenseCount} expense${expenseCount !== 1 ? 's' : ''}`;

  // Budget status message
  const statusEl = document.getElementById('budgetStatus');
  if (percentage < 50) {
    statusEl.textContent = "You're doing great!";
    statusEl.style.color = 'hsl(145, 55%, 38%)';
  } else if (percentage < 80) {
    statusEl.textContent = "Watch your spending";
    statusEl.style.color = 'hsl(45, 95%, 55%)';
  } else if (percentage < 100) {
    statusEl.textContent = "Almost at limit!";
    statusEl.style.color = 'hsl(0, 72%, 55%)';
  } else {
    statusEl.textContent = "Over budget!";
    statusEl.style.color = 'hsl(0, 72%, 55%)';
  }

  // Progress bar
  document.getElementById('progressLabel').textContent = `₹${formatCurrency(totalUserSpent)} of ₹${formatCurrency(budgetTotal)} used`;
  document.getElementById('progressPercent').textContent = `${Math.round(percentage)}%`;
  
  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = `${Math.min(percentage, 100)}%`;
  
  // Change color based on percentage
  if (percentage >= 100) {
    progressFill.className = 'progress-fill danger';
  } else if (percentage >= 80) {
    progressFill.className = 'progress-fill warning';
  } else {
    progressFill.className = 'progress-fill';
  }

  // Update category breakdown
  updateCategoryBars();
}

function updateCategoryBars() {
  const categoryBarsContainer = document.getElementById('categoryBars');
  const spending = AppData.getSpendingByCategory();
  const categoryIcons = {
    'Food': '🍔',
    'Groceries': '🛒',
    'Utilities': '💡',
    'Transport': '🚗',
    'Entertainment': '🎮',
    'Other': '📦'
  };

  if (Object.keys(spending).length === 0) {
    // Show empty state
    categoryBarsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No expenses yet</h3>
        <p>Add your first expense to see category breakdown</p>
        <button class="btn btn-primary" onclick="window.location.href='expenses.html'">
          Add Expense
        </button>
      </div>
    `;
    return;
  }

  // Calculate total and max for scaling
  const total = Object.values(spending).reduce((sum, val) => sum + val, 0);
  const maxSpending = Math.max(...Object.values(spending));

  // Sort by amount descending
  const sortedCategories = Object.entries(spending).sort((a, b) => b[1] - a[1]);

  categoryBarsContainer.innerHTML = sortedCategories.map(([category, amount]) => {
    const percentage = maxSpending > 0 ? (amount / maxSpending) * 100 : 0;
    const icon = categoryIcons[category] || '📦';
    
    return `
      <div class="category-bar-item">
        <div class="category-bar-header">
          <div class="category-bar-label">
            <span class="category-bar-icon">${icon}</span>
            <span>${category}</span>
          </div>
          <span class="category-bar-amount">₹${formatCurrency(amount)}</span>
        </div>
        <div class="category-bar">
          <div class="category-bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function openEditBudgetModal() {
  document.getElementById('newBudget').value = AppData.budget.total;
  document.getElementById('editBudgetModal').classList.remove('hidden');
}

function closeEditBudgetModal() {
  document.getElementById('editBudgetModal').classList.add('hidden');
}

function handleEditBudget(e) {
  e.preventDefault();
  
  const newBudget = parseFloat(document.getElementById('newBudget').value);
  
  if (newBudget > 0) {
    AppData.updateBudgetTotal(newBudget);
    AppData.save();
    updateDashboard();
    closeEditBudgetModal();
  }
}

function formatCurrency(amount) {
  return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Update dashboard when page becomes visible (in case data changed)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    AppData.load();
    updateDashboard();
  }
});