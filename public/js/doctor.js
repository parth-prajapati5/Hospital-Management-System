// DOM Elements
const appointmentsContainer = document.getElementById('appointmentsContainer');
const doctorProfileForm = document.getElementById('doctorProfileForm');

// Load doctor appointments
async function loadDoctorAppointments() {
  try {
    const appointments = await apiRequest('/doctor/appointments');
    
    if (appointments.length === 0) {
      appointmentsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
          <p class="text-muted">No appointments scheduled</p>
        </div>
      `;
      return;
    }
    
    // Sort appointments by date and time
    appointments.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
    
    // Filter today's appointments
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(app => app.date === todayString);
    
    if (todaysAppointments.length === 0) {
      appointmentsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
          <p class="text-muted">No appointments scheduled for today</p>
        </div>
      `;
      return;
    }
    
    // Display appointments
    let appointmentsHTML = '';
    todaysAppointments.forEach(appointment => {
      const appDate = new Date(appointment.date);
      const formattedDate = appDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      appointmentsHTML += `
        <div class="appointment-card card mb-3 border-start-${appointment.status}">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h5 class="card-title mb-1">${appointment.patientId.name}</h5>
              <span class="badge bg-${appointment.status}">${appointment.status}</span>
            </div>
            <p class="card-text text-muted mb-2">${appointment.patientId.phone}</p>
            <p class="card-text mb-1"><i class="fas fa-calendar-day me-2"></i>${formattedDate}</p>
            <p class="card-text mb-1"><i class="fas fa-clock me-2"></i>${appointment.time}</p>
            ${appointment.notes ? `<p class="card-text mb-2"><i class="fas fa-sticky-note me-2"></i>${appointment.notes}</p>` : ''}
            ${appointment.status === 'booked' ? `
              <div class="mt-2">
                <button class="btn btn-sm btn-success complete-appointment me-2" data-id="${appointment._id}">
                  <i class="fas fa-check-circle me-1"></i>Complete
                </button>
                <button class="btn btn-sm btn-outline-danger cancel-appointment" data-id="${appointment._id}">
                  <i class="fas fa-times-circle me-1"></i>Cancel
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });
    
    appointmentsContainer.innerHTML = appointmentsHTML;
    
    // Add event listeners to action buttons
    document.querySelectorAll('.complete-appointment').forEach(button => {
      button.addEventListener('click', async (e) => {
        const appointmentId = e.target.dataset.id || e.target.closest('button').dataset.id;
        await updateAppointmentStatus(appointmentId, 'completed');
      });
    });
    
    document.querySelectorAll('.cancel-appointment').forEach(button => {
      button.addEventListener('click', async (e) => {
        const appointmentId = e.target.dataset.id || e.target.closest('button').dataset.id;
        await updateAppointmentStatus(appointmentId, 'canceled');
      });
    });
    
    // Update appointment count in dashboard
    const appointmentCountElement = document.getElementById('appointmentCount');
    if (appointmentCountElement) {
      appointmentCountElement.textContent = todaysAppointments.length;
    }
  } catch (error) {
    appointmentsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Error loading appointments: ${error.message}
      </div>
    `;
  }
}

// Update appointment status
async function updateAppointmentStatus(appointmentId, status) {
  try {
    await apiRequest(`/doctor/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    
    const statusText = status === 'completed' ? 'completed' : 'canceled';
    showToast('Success', `Appointment ${statusText} successfully`, 'success');
    loadDoctorAppointments(); // Reload appointments
  } catch (error) {
    showToast('Error', error.message, 'error');
  }
}

// Load doctor profile
async function loadDoctorProfile() {
  try {
    const profile = await apiRequest('/doctor/profile');
    
    if (doctorProfileForm) {
      document.getElementById('name').value = profile.name || '';
      document.getElementById('specialization').value = profile.specialization || '';
      document.getElementById('email').value = profile.email || '';
      document.getElementById('phone').value = profile.phone || '';
      
      // Load available schedule
      const scheduleContainer = document.getElementById('scheduleContainer');
      if (scheduleContainer && profile.availableSchedule) {
        profile.availableSchedule.forEach((slot, index) => {
          addScheduleSlot(slot, index);
        });
      }
    }
    
    // Update name in navigation
    const doctorNameElements = document.querySelectorAll('#doctorName, #welcomeName');
    doctorNameElements.forEach(element => {
      element.textContent = profile.name || 'Doctor';
    });
  } catch (error) {
    showToast('Error', 'Failed to load profile: ' + error.message, 'error');
  }
}

// Add schedule slot input
function addScheduleSlot(value = '', index = null) {
  const scheduleContainer = document.getElementById('scheduleContainer');
  const slotIndex = index !== null ? index : Date.now();
  
  const slotDiv = document.createElement('div');
  slotDiv.className = 'input-group mb-2 schedule-slot';
  slotDiv.innerHTML = `
    <input type="text" class="form-control" name="scheduleSlot" value="${value}" placeholder="e.g., Mon 10-1, Wed 2-5">
    <button class="btn btn-outline-danger remove-slot" type="button">
      <i class="fas fa-trash"></i>
    </button>
  `;
  
  scheduleContainer.appendChild(slotDiv);
  
  // Add event listener to remove button
  const removeBtn = slotDiv.querySelector('.remove-slot');
  removeBtn.addEventListener('click', () => {
    slotDiv.remove();
  });
}

// Update doctor profile
async function updateDoctorProfile(profileData) {
  try {
    const updatedProfile = await apiRequest('/doctor/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    
    // Update local storage with new name if changed
    if (updatedProfile.name) {
      localStorage.setItem('userName', updatedProfile.name);
      // Update name in navigation
      const doctorNameElements = document.querySelectorAll('#doctorName, #welcomeName');
      doctorNameElements.forEach(element => {
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

// Event Listeners
if (doctorProfileForm) {
  // Add schedule slot button
  document.getElementById('addSlotBtn').addEventListener('click', (e) => {
    e.preventDefault();
    addScheduleSlot();
  });
  
  // Form submission
  doctorProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const profileData = {
      name: document.getElementById('name').value,
      specialization: document.getElementById('specialization').value,
      phone: document.getElementById('phone').value,
      availableSchedule: Array.from(document.querySelectorAll('input[name="scheduleSlot"]'))
        .map(input => input.value)
        .filter(value => value.trim() !== '')
    };
    
    // Show loading state
    const updateBtn = document.getElementById('updateBtn');
    const updateText = document.getElementById('updateText');
    const updateSpinner = document.getElementById('updateSpinner');
    
    updateText.classList.add('d-none');
    updateSpinner.classList.remove('d-none');
    updateBtn.disabled = true;
    
    try {
      await updateDoctorProfile(profileData);
    } catch (error) {
      // Error already handled in updateDoctorProfile
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
  // Load appropriate data based on current page
  if (window.location.pathname.includes('doctor-dashboard')) {
    loadDoctorAppointments();
  } else if (window.location.pathname.includes('doctor-profile')) {
    loadDoctorProfile();
  }
});