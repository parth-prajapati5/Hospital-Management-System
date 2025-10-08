// Test script to check admin frontend functionality
console.log('Admin Dashboard Test');

// Check if required elements exist
const requiredElements = [
  'totalPatients',
  'totalDoctors', 
  'totalAppointments',
  'totalRecords',
  'recentUsersContainer',
  'recentAppointmentsContainer'
];

console.log('Checking for required DOM elements...');

requiredElements.forEach(elementId => {
  const element = document.getElementById(elementId);
  if (element) {
    console.log(`✓ Element ${elementId} found`);
  } else {
    console.log(`✗ Element ${elementId} NOT found`);
  }
});

// Check if apiRequest function exists
if (typeof apiRequest === 'function') {
  console.log('✓ apiRequest function available');
} else {
  console.log('✗ apiRequest function NOT available');
}

// Check if localStorage has required items
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

console.log('LocalStorage check:');
console.log('- Token:', token ? 'Present' : 'Missing');
console.log('- Role:', role ? 'Present' : 'Missing');

if (role === 'admin') {
  console.log('✓ User has admin role');
} else {
  console.log('✗ User does not have admin role');
}