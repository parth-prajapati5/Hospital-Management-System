// DOM Elements
const appointmentForm = document.getElementById('appointmentForm');
const doctorSelect = document.getElementById('doctorSelect');
const appointmentDate = document.getElementById('appointmentDate');
const appointmentTime = document.getElementById('appointmentTime');
const bookBtn = document.getElementById('bookBtn');
const bookText = document.getElementById('bookText');
const bookSpinner = document.getElementById('bookSpinner');
const doctorsContainer = document.getElementById('doctorsContainer');
const appointmentsContainer = document.getElementById('appointmentsContainer');
const recordsContainer = document.getElementById('recordsContainer');
const profileForm = document.getElementById('profileForm');
const updateBtn = document.getElementById('updateBtn');
const updateText = document.getElementById('updateText');
const updateSpinner = document.getElementById('updateSpinner');

// Set min date for appointment booking (today)
const today = new Date().toISOString().split('T')[0];
if (appointmentDate) {
  appointmentDate.min = today;
}

// Load doctors for appointment booking
async function loadDoctors() {
  try {
    const doctors = await apiRequest('/patient/doctors');
    
    if (doctors.length === 0) {
      doctorsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-user-md fa-3x text-muted mb-3"></i>
          <p class="text-muted">No doctors available at the moment</p>
        </div>
      `;
      return;
    }
    
    // Populate doctor select dropdown
    if (doctorSelect) {
      doctorSelect.innerHTML = '<option value="">Choose a doctor</option>';
      doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor._id;
        // Remove "Dr." prefix if it already exists in the name
        const displayName = doctor.name.startsWith('Dr. ') ? doctor.name : `Dr. ${doctor.name}`;
        option.textContent = `${displayName} - ${doctor.specialization}`;
        doctorSelect.appendChild(option);
      });
    }
    
    // Display doctors in cards
    let doctorsHTML = '<div class="row">';
    doctors.forEach(doctor => {
      // Remove "Dr." prefix if it already exists in the name
      const displayName = doctor.name.startsWith('Dr. ') ? doctor.name : `Dr. ${doctor.name}`;
      doctorsHTML += `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${displayName}</h5>
              <p class="card-text text-muted">${doctor.specialization}</p>
              <p class="card-text"><i class="fas fa-phone me-2"></i>${doctor.phone}</p>
              <p class="card-text"><i class="fas fa-envelope me-2"></i>${doctor.email}</p>
            </div>
          </div>
        </div>
      `;
    });
    doctorsHTML += '</div>';
    
    doctorsContainer.innerHTML = doctorsHTML;
  } catch (error) {
    doctorsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Error loading doctors: ${error.message}
      </div>
    `;
  }
}

// Load patient appointments
async function loadAppointments() {
  try {
    const appointments = await apiRequest('/patient/appointments');
    
    if (appointments.length === 0) {
      appointmentsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
          <p class="text-muted">No upcoming appointments</p>
          <a href="/pages/book-appointment.html" class="btn btn-primary">Book Appointment</a>
        </div>
      `;
      return;
    }
    
    // Sort appointments by date
    appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Filter upcoming appointments (today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingAppointments = appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= today;
    });
    
    if (upcomingAppointments.length === 0) {
      appointmentsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
          <p class="text-muted">No upcoming appointments</p>
          <a href="/pages/book-appointment.html" class="btn btn-primary">Book Appointment</a>
        </div>
      `;
      return;
    }
    
    // Display appointments
    let appointmentsHTML = '';
    upcomingAppointments.slice(0, 5).forEach(appointment => {
      const appDate = new Date(appointment.date);
      const formattedDate = appDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Remove "Dr." prefix if it already exists in the name
      const doctorName = appointment.doctorId.name.startsWith('Dr. ') ? appointment.doctorId.name : `Dr. ${appointment.doctorId.name}`;
      
      appointmentsHTML += `
        <div class="appointment-card card mb-3 border-start-${appointment.status}">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title mb-1">${doctorName}</h5>
              <span class="badge bg-${appointment.status}">${appointment.status}</span>
            </div>
            <p class="card-text text-muted mb-2">${appointment.doctorId.specialization}</p>
            <p class="card-text mb-1"><i class="fas fa-calendar-day me-2"></i>${formattedDate}</p>
            <p class="card-text mb-1"><i class="fas fa-clock me-2"></i>${appointment.time}</p>
            ${appointment.notes ? `<p class="card-text mb-2"><i class="fas fa-sticky-note me-2"></i>${appointment.notes}</p>` : ''}
            ${appointment.status === 'booked' ? `
              <button class="btn btn-sm btn-outline-danger cancel-appointment" data-id="${appointment._id}">
                <i class="fas fa-times-circle me-1"></i>Cancel
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });
    
    appointmentsContainer.innerHTML = appointmentsHTML;
    
    // Add event listeners to cancel buttons
    document.querySelectorAll('.cancel-appointment').forEach(button => {
      button.addEventListener('click', async (e) => {
        const appointmentId = e.target.dataset.id || e.target.closest('button').dataset.id;
        if (confirm('Are you sure you want to cancel this appointment?')) {
          try {
            await apiRequest(`/patient/appointments/${appointmentId}/cancel`, {
              method: 'PUT'
            });
            showToast('Success', 'Appointment canceled successfully', 'success');
            loadAppointments(); // Reload appointments
          } catch (error) {
            showToast('Error', error.message, 'error');
          }
        }
      });
    });
    
    // Update appointment count in dashboard
    const appointmentCountElement = document.getElementById('appointmentCount');
    if (appointmentCountElement) {
      appointmentCountElement.textContent = upcomingAppointments.length;
    }
  } catch (error) {
    appointmentsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Error loading appointments: ${error.message}
      </div>
    `;
  }
}

// Load medical records
async function loadMedicalRecords() {
  try {
    const records = await apiRequest('/patient/records');
    
    if (records.length === 0) {
      recordsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-file-medical fa-3x text-muted mb-3"></i>
          <p class="text-muted">No medical records available</p>
        </div>
      `;
      return;
    }
    
    // Sort records by visit date (newest first)
    records.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
    
    // Display records
    let recordsHTML = '';
    records.forEach(record => {
      const visitDate = new Date(record.visitDate);
      const formattedDate = visitDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Remove "Dr." prefix if it already exists in the name
      const doctorName = record.doctorId.name.startsWith('Dr. ') ? record.doctorId.name : `Dr. ${record.doctorId.name}`;
      
      recordsHTML += `
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Visit on ${formattedDate}</h5>
            <span class="badge bg-primary">${record.doctorId.specialization}</span>
          </div>
          <div class="card-body">
            <h6 class="card-title">${doctorName}</h6>
            <div class="mb-3">
              <h6 class="text-primary">Diagnosis</h6>
              <p class="mb-0">${record.diagnosis}</p>
            </div>
            ${record.prescription ? `
            <div class="mb-3">
              <h6 class="text-primary">Prescription</h6>
              <p class="mb-0">${record.prescription}</p>
            </div>
            ` : ''}
            ${record.followUpDate ? `
            <div class="mb-3">
              <h6 class="text-primary">Follow-up Date</h6>
              <p class="mb-0">${new Date(record.followUpDate).toLocaleDateString()}</p>
            </div>
            ` : ''}
          </div>
        </div>
      `;
    });
    
    recordsContainer.innerHTML = recordsHTML;
  } catch (error) {
    recordsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Error loading medical records: ${error.message}
      </div>
    `;
  }
}

// Load patient profile
async function loadProfile() {
  try {
    const profile = await apiRequest('/patient/profile');
    
    if (profileForm) {
      document.getElementById('name').value = profile.name || '';
      document.getElementById('email').value = profile.email || '';
      document.getElementById('gender').value = profile.gender || '';
      document.getElementById('phone').value = profile.phone || '';
      document.getElementById('address').value = profile.address || '';
      document.getElementById('emergencyContact').value = profile.emergencyContact || '';
    }
  } catch (error) {
    showToast('Error', 'Failed to load profile: ' + error.message, 'error');
  }
}

// Update patient profile
async function updateProfile(profileData) {
  try {
    const updatedProfile = await apiRequest('/patient/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    
    // Update local storage with new name if changed
    if (updatedProfile.name) {
      localStorage.setItem('userName', updatedProfile.name);
      // Update name in navigation
      const userNameElements = document.querySelectorAll('#userName, #welcomeName');
      userNameElements.forEach(element => {
        element.textContent = updatedProfile.name;
      });
    }
    
    showToast('Success', 'Profile updated successfully', 'success');
    return updatedProfile;
  } catch (error) {
    showToast('Error', error.message, 'error');
    throw error;
  }
}

// Book appointment
async function bookAppointment(appointmentData) {
  try {
    const appointment = await apiRequest('/patient/appointments/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
    
    showToast('Success', 'Appointment booked successfully!', 'success');
    return appointment;
  } catch (error) {
    showToast('Error', error.message, 'error');
    throw error;
  }
}

// Generate time slots for appointment booking
function generateTimeSlots() {
  if (!appointmentTime) return;
  
  // Clear existing options
  appointmentTime.innerHTML = '<option value="">Select time slot</option>';
  
  // Generate time slots from 9:00 AM to 5:00 PM in 30-minute intervals
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = formatTime(hour, minute);
      const option = document.createElement('option');
      option.value = timeString;
      option.textContent = displayTime;
      appointmentTime.appendChild(option);
    }
  }
}

// Format time for display
function formatTime(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

// Event Listeners
if (appointmentForm) {
  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const doctorId = doctorSelect.value;
    const date = appointmentDate.value;
    const time = appointmentTime.value;
    const notes = document.getElementById('appointmentNotes').value;
    
    if (!doctorId || !date || !time) {
      showToast('Error', 'Please fill in all required fields', 'error');
      return;
    }
    
    // Show loading state
    bookText.classList.add('d-none');
    bookSpinner.classList.remove('d-none');
    bookBtn.disabled = true;
    
    try {
      await bookAppointment({ doctorId, date, time, notes });
      
      // Reset form
      appointmentForm.reset();
      
      // Reload appointments if on dashboard
      if (window.location.pathname.includes('dashboard')) {
        loadAppointments();
      }
    } catch (error) {
      // Error already handled in bookAppointment
    } finally {
      // Reset loading state
      bookText.classList.remove('d-none');
      bookSpinner.classList.add('d-none');
      bookBtn.disabled = false;
    }
  });
}

if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const profileData = {
      name: document.getElementById('name').value,
      gender: document.getElementById('gender').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      emergencyContact: document.getElementById('emergencyContact').value
    };
    
    // Show loading state
    updateText.classList.add('d-none');
    updateSpinner.classList.remove('d-none');
    updateBtn.disabled = true;
    
    try {
      await updateProfile(profileData);
    } catch (error) {
      // Error already handled in updateProfile
    } finally {
      // Reset loading state
      updateText.classList.remove('d-none');
      updateSpinner.classList.add('d-none');
      updateBtn.disabled = false;
    }
  });
}

// Load data when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Generate time slots
  generateTimeSlots();
  
  // Load appropriate data based on current page
  if (window.location.pathname.includes('book-appointment')) {
    loadDoctors();
  } else if (window.location.pathname.includes('dashboard')) {
    loadAppointments();
  } else if (window.location.pathname.includes('medical-records')) {
    loadMedicalRecords();
  } else if (window.location.pathname.includes('profile')) {
    loadProfile();
  }
});