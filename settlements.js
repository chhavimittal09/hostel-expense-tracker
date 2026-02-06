
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  updateSettlements();

  document.getElementById('logoutBtn').addEventListener('click', logout);
});

function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn !== 'true') {
    window.location.href = 'index.html';
  }
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'index.html';
}

function updateSettlements() {
  const settlements = AppData.getSettlements();
  const netBalance = AppData.getNetBalance();
  const totalOwe = AppData.getTotalOwe();
  const totalOwed = AppData.getTotalOwed();

  const netBalanceEl = document.getElementById('netBalance');
  const netBalanceText = document.getElementById('netBalanceText');
  
  if (netBalance > 0) {
    netBalanceEl.textContent = `-₹${formatCurrency(netBalance)}`;
    netBalanceEl.style.color = 'hsl(145, 55%, 38%)';
    netBalanceText.textContent = "You're owed overall";
  } else if (netBalance < 0) {
    netBalanceEl.textContent = `-₹${formatCurrency(Math.abs(netBalance))}`;
    netBalanceEl.style.color = 'hsl(0, 72%, 55%)';
    netBalanceText.textContent = "You owe overall";
  } else {
    netBalanceEl.textContent = '₹0';
    netBalanceEl.style.color = 'hsl(210, 10%, 25%)';
    netBalanceText.textContent = 'All settled up!';
  }

  document.getElementById('totalOwe').textContent = formatCurrency(totalOwe);
  document.getElementById('totalOwed').textContent = formatCurrency(totalOwed);

  const oweCount = settlements.filter(s => s.type === 'owe').length;
  const owedCount = settlements.filter(s => s.type === 'owed').length;
  
  document.getElementById('oweCount').textContent = `${oweCount} ${oweCount === 1 ? 'person' : 'people'}`;
  document.getElementById('owedCount').textContent = `${owedCount} ${owedCount === 1 ? 'person' : 'people'}`;

  updateSettlementsList(settlements);
}

function updateSettlementsList(settlements) {
  const settlementListContainer = document.getElementById('settlementList');

  if (settlements.length === 0) {
    settlementListContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>All settled up!</h3>
        <p>No pending settlements. Add shared expenses to see settlements here.</p>
        <button class="btn btn-primary" onclick="window.location.href='expenses.html'">
          Add Shared Expense
        </button>
      </div>
    `;
    return;
  }

  const sortedSettlements = [
    ...settlements.filter(s => s.type === 'owe'),
    ...settlements.filter(s => s.type === 'owed')
  ];

  settlementListContainer.innerHTML = sortedSettlements.map(settlement => {
    const isOwe = settlement.type === 'owe';
    const text = isOwe 
      ? `${settlement.person.name} owes you`
      : `You owe ${settlement.person.name}`;
    
    const initial = settlement.person.name.charAt(0).toUpperCase();
    const avatarColor = settlement.person.color || 'hsl(210, 10%, 45%)';

    return `
      <div class="card settlement-card ${settlement.type}">
        <div class="settlement-left">
          <div class="settlement-avatar" style="background: ${avatarColor};">
            ${initial}
          </div>
          <div class="settlement-details">
            <div class="settlement-text">${text}</div>
            <div class="settlement-date">From shared expenses</div>
          </div>
        </div>
        <div class="settlement-amount ${settlement.type}">
          ${isOwe ? '+' : '-'}₹${formatCurrency(settlement.amount)}
        </div>
        <div class="settlement-actions">
          <button class="btn btn-ghost btn-sm" onclick="sendReminder('${settlement.person.id}')">
            📱 Remind
          </button>
          <button class="btn btn-${isOwe ? 'primary' : 'success'} btn-sm" onclick="markSettled('${settlement.person.id}')">
            ✓ Settled
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function sendReminder(personId) {
  const person = AppData.roommates.find(r => r.id === personId);
  if (person) {
    alert(`Reminder sent to ${person.name}! 📱\n(In a real app, this would send a notification)`);
  }
}

function markSettled(personId) {
  const person = AppData.roommates.find(r => r.id === personId);
  if (!person) return;

  const confirmed = confirm(`Mark all settlements with ${person.name} as settled?`);
  
  if (confirmed) {
    AppData.expenses = AppData.expenses.filter(expense => {
      if (expense.type !== 'shared') return true;
      
      const isPayer = expense.paidBy === personId || expense.paidBy === AppData.user.id;
      const isShared = expense.sharedWith.includes(personId) && expense.sharedWith.includes(AppData.user.id);
      
      if (isPayer && isShared) return false;
      
      return true;
    });

    AppData.save();
    updateSettlements();
    
    alert(`✓ Settled with ${person.name}!`);
  }
}

function formatCurrency(amount) {
  return amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    AppData.load();
    updateSettlements();
  }
});
