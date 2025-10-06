// API Base URL
const API_BASE_URL = '/api';

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const toast = document.getElementById('toast');
const toastTitle = document.getElementById('toastTitle');
const toastBody = document.getElementById('toastBody');

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  // If we're on a protected page and no token, redirect to login
  const protectedPages = [
    '/pages/patient-dashboard.html',
    '/pages/doctor-dashboard.html',
    '/pages/admin-dashboard.html',
    '/pages/book-appointment.html',
    '/pages/medical-records.html',
    '/pages/profile.html',
    '/pages/doctor-appointments.html',
    '/pages/doctor-profile.html',
    '/pages/admin-users.html',
    '/pages/admin-appointments.html',
    '/pages/admin-reports.html'
  ];
  
  const currentPage = window.location.pathname;
  
  if (protectedPages.includes(currentPage) && !token) {
    window.location.href = '/login.html';
    return false;
  }
  
  return !!token;
}

// Show toast notification
function showToast(title, message, type = 'info') {
  // Check if toast elements exist
  if (!toast || !toastTitle || !toastBody) {
    console.warn('Toast elements not found in DOM');
    // Fallback to alert
    alert(`${title}: ${message}`);
    return;
  }
  
  toastTitle.textContent = title;
  toastBody.textContent = message;
  
  // Set toast background based on type
  toast.className = 'toast';
  if (type === 'success') {
    toast.classList.add('bg-success', 'text-white');
  } else if (type === 'error') {
    toast.classList.add('bg-danger', 'text-white');
  } else if (type === 'warning') {
    toast.classList.add('bg-warning', 'text-dark');
  } else {
    toast.classList.add('bg-info', 'text-white');
  }
  
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}

// API Request Helper
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    showToast('Error', error.message, 'error');
    throw error;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  window.location.href = '/login.html';
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format date and time
function formatDateTime(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Get user info from token
function getUserInfo() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      role: localStorage.getItem('role'),
      name: localStorage.getItem('userName')
    };
  } catch (error) {
    return null;
  }
}

// Event Listeners
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // Set user name in navigation if element exists
  const userNameElements = document.querySelectorAll('#userName, #doctorName, #adminName, #welcomeName');
  const userName = localStorage.getItem('userName');
  
  if (userName && userNameElements.length > 0) {
    userNameElements.forEach(element => {
      element.textContent = userName;
    });
  }
});

// Export functions for use in other modules
window.apiRequest = apiRequest;
window.showToast = showToast;
window.logout = logout;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getUserInfo = getUserInfo;