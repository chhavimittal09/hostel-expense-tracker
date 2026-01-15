// Roommates page logic

document.addEventListener('DOMContentLoaded', () => {
  // Check login
  checkAuth();

  // Initialize
  updateRoommateList();

  // Event listeners
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('addRoommateBtn').addEventListener('click', openAddRoommateModal);
  document.getElementById('addRoommateForm').addEventListener('submit', handleAddRoommate);

  // Select first color by default
  const firstColorOption = document.querySelector('.color-option div');
  if (firstColorOption) {
    selectColor(firstColorOption);
  }
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

function updateRoommateList() {
  const roommateListContainer = document.getElementById('roommateList');
  
  if (AppData.roommates.length === 0) {
    roommateListContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">👥</div>
        <h3>No roommates yet</h3>
        <p>Add roommates to split expenses and track who owes what</p>
        <button class="btn btn-primary" onclick="openAddRoommateModal()">
          Add Your First Roommate
        </button>
      </div>
    `;
    return;
  }

  roommateListContainer.innerHTML = AppData.roommates.map(roommate => {
    const initial = roommate.name.charAt(0).toUpperCase();
    const isCurrentUser = roommate.isCurrentUser;
    
    return `
      <div class="card roommate-card">
        <div class="roommate-avatar" style="background: ${roommate.color};">
          ${initial}
        </div>
        <div class="roommate-info">
          <div class="roommate-name">
            ${roommate.name}
            ${isCurrentUser ? '<span class="badge-you">YOU</span>' : ''}
          </div>
          <p class="text-muted" style="font-size: 0.875rem;">
            ${isCurrentUser ? 'Primary account' : 'Roommate'}
          </p>
        </div>
        <div class="roommate-actions">
          ${!isCurrentUser ? `
            <button class="btn btn-ghost btn-icon" onclick="deleteRoommate('${roommate.id}')" title="Remove roommate">
              🗑️
            </button>
          ` : `
            <button class="btn btn-ghost btn-icon" disabled style="opacity: 0.3; cursor: not-allowed;" title="Cannot delete yourself">
              🗑️
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function openAddRoommateModal() {
  document.getElementById('addRoommateForm').reset();
  
  // Reset color selection
  document.querySelectorAll('.color-option div').forEach(el => {
    el.style.border = '3px solid transparent';
  });
  
  // Select first color
  const firstColorOption = document.querySelector('.color-option div');
  if (firstColorOption) {
    selectColor(firstColorOption);
  }
  
  document.getElementById('addRoommateModal').classList.remove('hidden');
}

function closeAddRoommateModal() {
  document.getElementById('addRoommateModal').classList.add('hidden');
}

function selectColor(element) {
  // Remove selection from all
  document.querySelectorAll('.color-option div').forEach(el => {
    el.style.border = '3px solid transparent';
  });
  
  // Select this one
  element.style.border = '3px solid hsl(145, 55%, 38%)';
  
  // Check the radio button
  const radio = element.parentElement.querySelector('input[type="radio"]');
  if (radio) {
    radio.checked = true;
  }
}

function handleAddRoommate(e) {
  e.preventDefault();

  const name = document.getElementById('roommateName').value.trim();
  const selectedColor = document.querySelector('input[name="color"]:checked');
  
  if (!name) {
    alert('Please enter a name');
    return;
  }

  if (!selectedColor) {
    alert('Please select a color');
    return;
  }

  const color = selectedColor.value;

  // Add roommate
  AppData.addRoommate({
    name,
    color,
    isCurrentUser: false
  });

  AppData.save();
  updateRoommateList();
  closeAddRoommateModal();
}

function deleteRoommate(roommateId) {
  const roommate = AppData.roommates.find(r => r.id === roommateId);
  
  if (!roommate) return;
  
  if (roommate.isCurrentUser) {
    alert("You cannot delete yourself!");
    return;
  }

  const confirmed = confirm(`Remove ${roommate.name}? This will also delete all their associated expenses.`);
  
  if (confirmed) {
    AppData.deleteRoommate(roommateId);
    AppData.save();
    updateRoommateList();
  }
}

// Update list when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    AppData.load();
    updateRoommateList();
  }
});