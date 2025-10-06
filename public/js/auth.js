// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const registerText = document.getElementById('registerText');
const registerSpinner = document.getElementById('registerSpinner');

// Login Function
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data._id);
      localStorage.setItem('userName', data.name || data.username);
      
      showToast('Success', 'Login successful!', 'success');
      
      // Redirect based on role
      if (data.role === 'admin') {
        setTimeout(() => {
          window.location.href = '/pages/admin-dashboard.html';
        }, 1000);
      } else if (data.role === 'doctor') {
        setTimeout(() => {
          window.location.href = '/pages/doctor-dashboard.html';
        }, 1000);
      } else {
        setTimeout(() => {
          window.location.href = '/pages/patient-dashboard.html';
        }, 1000);
      }
    } else {
      showToast('Login Failed', data.message, 'error');
    }
  } catch (error) {
    showToast('Error', 'An error occurred during login', 'error');
  }
}

// Register Function
async function register(userData) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Success', 'Registration successful! Please login.', 'success');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else {
      showToast('Registration Failed', data.message, 'error');
    }
    
    return { ok: response.ok, data };
  } catch (error) {
    showToast('Error', 'An error occurred during registration', 'error');
    return { ok: false, error };
  }
}

// Event Listeners
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    loginText.classList.add('d-none');
    loginSpinner.classList.remove('d-none');
    loginBtn.disabled = true;
    
    await login(email, password);
    
    // Reset loading state (always reset, even on error)
    loginText.classList.remove('d-none');
    loginSpinner.classList.add('d-none');
    loginBtn.disabled = false;
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const username = document.getElementById('username').value;
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const emergencyContact = document.getElementById('emergencyContact').value;
    
    // Log form data for debugging
    console.log('Registration form data:', {
      username,
      name,
      email,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]',
      gender,
      phone,
      address: address || '[EMPTY]',
      emergencyContact: emergencyContact || '[EMPTY]'
    });
    
    // Validate required fields
    if (!username || !username.trim()) {
      showToast('Error', 'Username is required', 'error');
      return;
    }
    
    if (!name || !name.trim()) {
      showToast('Error', 'Full Name is required', 'error');
      return;
    }
    
    if (!email || !email.trim()) {
      showToast('Error', 'Email is required', 'error');
      return;
    }
    
    if (!password || !password.trim()) {
      showToast('Error', 'Password is required', 'error');
      return;
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
      showToast('Error', 'Passwords do not match', 'error');
      return;
    }
    
    // Show loading state
    registerText.classList.add('d-none');
    registerSpinner.classList.remove('d-none');
    registerBtn.disabled = true;
    
    // Send registration data
    const result = await register({
      username,
      name,
      email,
      password,
      role: 'patient',
      gender,
      phone
    });
    
    // Reset loading state (always reset, even on error)
    registerText.classList.remove('d-none');
    registerSpinner.classList.add('d-none');
    registerBtn.disabled = false;
    
    // Log result for debugging
    console.log('Registration result:', result);
  });
}