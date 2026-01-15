// ================================
// SHARED DATA SOURCE
// All pages read from this file
// ================================

const AppData = {
  // Current logged-in user
  user: {
    id: 'user-1',
    name: 'You',
    studentId: 'ST2024001',
    color: 'hsl(145, 55%, 38%)'
  },

  // Monthly budget
  budget: {
    total: 10000,
    spent: 0,
    remaining: 10000
  },

  // Roommates
  roommates: [
    {
      id: 'user-1',
      name: 'You',
      color: 'hsl(145, 55%, 38%)',
      isCurrentUser: true
    }
  ],

  // Expenses
  expenses: [],

  // Helper functions
  getTotalSpent() {
    return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  },

  getUserShare(expenseId) {
    const expense = this.expenses.find(e => e.id === expenseId);
    if (!expense) return 0;
    
    if (expense.type === 'personal') {
      return expense.paidBy === this.user.id ? expense.amount : 0;
    } else {
      // Shared expense - split equally
      const shareCount = expense.sharedWith.length;
      return expense.amount / shareCount;
    }
  },

  getTotalUserSpent() {
    return this.expenses.reduce((sum, expense) => {
      return sum + this.getUserShare(expense.id);
    }, 0);
  },

  getSpendingByCategory() {
    const categories = {};
    
    this.expenses.forEach(expense => {
      const userShare = this.getUserShare(expense.id);
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += userShare;
    });

    return categories;
  },

  getSettlements() {
    const settlements = [];
    const balances = {};

    // Calculate who paid what and who owes what
    this.expenses.forEach(expense => {
      if (expense.type === 'shared') {
        const shareAmount = expense.amount / expense.sharedWith.length;
        
        // Person who paid gets credit
        if (!balances[expense.paidBy]) {
          balances[expense.paidBy] = 0;
        }
        balances[expense.paidBy] += expense.amount;

        // Everyone in the group owes their share
        expense.sharedWith.forEach(personId => {
          if (!balances[personId]) {
            balances[personId] = 0;
          }
          balances[personId] -= shareAmount;
        });
      }
    });

    // Convert balances to settlements
    Object.keys(balances).forEach(personId => {
      if (personId === this.user.id) return;
      
      const balance = balances[personId];
      const person = this.roommates.find(r => r.id === personId);
      
      if (balance !== 0 && person) {
        settlements.push({
          person: person,
          amount: Math.abs(balance),
          type: balance < 0 ? 'owe' : 'owed' // They owe you or you owe them
        });
      }
    });

    return settlements;
  },

  getNetBalance() {
    const settlements = this.getSettlements();
    let net = 0;
    
    settlements.forEach(s => {
      if (s.type === 'owed') {
        net += s.amount; // You are owed
      } else {
        net -= s.amount; // You owe
      }
    });

    return net;
  },

  getTotalOwed() {
    const settlements = this.getSettlements();
    return settlements
      .filter(s => s.type === 'owed')
      .reduce((sum, s) => sum + s.amount, 0);
  },

  getTotalOwe() {
    const settlements = this.getSettlements();
    return settlements
      .filter(s => s.type === 'owe')
      .reduce((sum, s) => sum + s.amount, 0);
  },

  // Add expense
  addExpense(expense) {
    this.expenses.unshift({
      id: 'exp-' + Date.now(),
      ...expense,
      date: new Date().toISOString()
    });
    this.updateBudget();
  },

  // Delete expense
  deleteExpense(expenseId) {
    this.expenses = this.expenses.filter(e => e.id !== expenseId);
    this.updateBudget();
  },

  // Update budget calculations
  updateBudget() {
    this.budget.spent = this.getTotalUserSpent();
    this.budget.remaining = this.budget.total - this.budget.spent;
  },

  // Add roommate
  addRoommate(roommate) {
    this.roommates.push({
      id: 'user-' + Date.now(),
      ...roommate
    });
  },

  // Delete roommate
  deleteRoommate(roommateId) {
    if (roommateId === this.user.id) return; // Can't delete yourself
    this.roommates = this.roommates.filter(r => r.id !== roommateId);
    
    // Remove from expenses
    this.expenses = this.expenses.filter(e => {
      if (e.paidBy === roommateId) return false;
      if (e.sharedWith && e.sharedWith.includes(roommateId)) {
        e.sharedWith = e.sharedWith.filter(id => id !== roommateId);
        return e.sharedWith.length > 0;
      }
      return true;
    });
    this.updateBudget();
  },

  // Update budget total
  updateBudgetTotal(newTotal) {
    this.budget.total = newTotal;
    this.updateBudget();
  },

  // Save to localStorage
  save() {
    localStorage.setItem('hostelExpenseData', JSON.stringify({
      user: this.user,
      budget: this.budget,
      roommates: this.roommates,
      expenses: this.expenses
    }));
  },

  // Load from localStorage
  load() {
    const saved = localStorage.getItem('hostelExpenseData');
    if (saved) {
      const data = JSON.parse(saved);
      this.user = data.user;
      this.budget = data.budget;
      this.roommates = data.roommates;
      this.expenses = data.expenses;
    }
  }
};

// Load data on script load
AppData.load();
