// DOM Elements
const totalPatientsElement = document.getElementById('totalPatients');
const totalDoctorsElement = document.getElementById('totalDoctors');
const totalAppointmentsElement = document.getElementById('totalAppointments');
const totalRecordsElement = document.getElementById('totalRecords');
const recentUsersContainer = document.getElementById('recentUsersContainer');
const recentAppointmentsContainer = document.getElementById('recentAppointmentsContainer');

// Load dashboard stats
async function loadDashboardStats() {
  try {
    const reports = await apiRequest('/admin/reports');
    
    // Update stats
    if (totalPatientsElement) {
      totalPatientsElement.textContent = reports.totals.patients;
    }
    
    if (totalDoctorsElement) {
      totalDoctorsElement.textContent = reports.totals.doctors;
    }
    
    if (totalAppointmentsElement) {
      totalAppointmentsElement.textContent = reports.totals.appointments;
    }
    
    // For medical records, we'll need to fetch them separately
    if (totalRecordsElement) {
      try {
        // Since we don't have a count endpoint, we'll fetch all records and count them
        const recordsResponse = await apiRequest('/admin/reports');
        // We can use the reports endpoint to get record count
        totalRecordsElement.textContent = '0'; // Default to 0
        // In a real app, you might want to add a specific count endpoint
      } catch (error) {
        totalRecordsElement.textContent = '0';
      }
    }
    
    // Display recent users
    if (recentUsersContainer && reports.recentUsers) {
      if (reports.recentUsers.length === 0) {
        recentUsersContainer.innerHTML = `
          <div class="text-center py-3">
            <p class="text-muted mb-0">No recent users</p>
          </div>
        `;
      } else {
        let usersHTML = '<div class="list-group">';
        reports.recentUsers.slice(0, 5).forEach(user => {
          usersHTML += `
            <div class="list-group-item list-group-item-action">
              <div class="d-flex justify-content-between">
                <h6 class="mb-1">${user.name || user.username}</h6>
                <small class="text-muted">${user.role}</small>
              </div>
              <p class="mb-1 text-muted">${user.email}</p>
              <small class="text-muted">${new Date(user.createdAt).toLocaleDateString()}</small>
            </div>
          `;
        });
        usersHTML += '</div>';
        recentUsersContainer.innerHTML = usersHTML;
      }
    }
    
    // Display recent appointments
    if (recentAppointmentsContainer && reports.recentAppointments) {
      if (reports.recentAppointments.length === 0) {
        recentAppointmentsContainer.innerHTML = `
          <div class="text-center py-3">
            <p class="text-muted mb-0">No recent appointments</p>
          </div>
        `;
      } else {
        let appointmentsHTML = '<div class="list-group">';
        reports.recentAppointments.slice(0, 5).forEach(appointment => {
          const appDate = new Date(appointment.date);
          const formattedDate = appDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          // Remove "Dr." prefix if it already exists in the name
          const doctorName = appointment.doctorId.name.startsWith('Dr. ') ? appointment.doctorId.name : `Dr. ${appointment.doctorId.name}`;
          
          appointmentsHTML += `
            <div class="list-group-item list-group-item-action">
              <div class="d-flex justify-content-between">
                <h6 class="mb-1">${appointment.patientId.name}</h6>
                <small class="text-muted">${formattedDate}</small>
              </div>
              <p class="mb-1">${doctorName} - ${appointment.time}</p>
              <small class="badge bg-${appointment.status}">${appointment.status}</small>
            </div>
          `;
        });
        appointmentsHTML += '</div>';
        recentAppointmentsContainer.innerHTML = appointmentsHTML;
      }
    }
  } catch (error) {
    showToast('Error', 'Failed to load dashboard stats: ' + error.message, 'error');
  }
}

// Load all users
async function loadUsers() {
  try {
    const users = await apiRequest('/admin/users');
    
    if (users.length === 0) {
      usersContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-users fa-3x text-muted mb-3"></i>
          <p class="text-muted">No users found</p>
        </div>
      `;
      return;
    }
    
    // Display users in table
    let usersHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    users.forEach(user => {
      const createdDate = new Date(user.createdAt);
      const formattedDate = createdDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      usersHTML += `
        <tr>
          <td>${user.name || user.username}</td>
          <td>${user.email}</td>
          <td><span class="badge bg-${user.role === 'admin' ? 'danger' : user.role === 'doctor' ? 'success' : 'primary'}">${user.role}</span></td>
          <td>${user.phone || 'N/A'}</td>
          <td>${formattedDate}</td>
          <td>
            ${user.role !== 'admin' ? `
              <button class="btn btn-sm btn-danger delete-user" data-id="${user._id}">
                <i class="fas fa-trash"></i>
              </button>
            ` : `
              <button class="btn btn-sm btn-secondary" disabled>
                <i class="fas fa-trash"></i>
              </button>
            `}
          </td>
        </tr>
      `;
    });
    
    usersHTML += `
          </tbody>
        </table>
      </div>
    `;
    
    usersContainer.innerHTML = usersHTML;
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-user').forEach(button => {
      button.addEventListener('click', async (e) => {
        const userId = e.target.closest('button').dataset.id;
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          try {
            await apiRequest(`/admin/users/${userId}`, {
              method: 'DELETE'
            });
            showToast('Success', 'User deleted successfully', 'success');
            loadUsers(); // Reload users
          } catch (error) {
            showToast('Error', error.message, 'error');
          }
        }
      });
    });
  } catch (error) {
    usersContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Error loading users: ${error.message}
      </div>
    `;
  }
}

// Load all appointments
async function loadAppointments() {
  try {
    const appointments = await apiRequest('/admin/appointments');
    
    if (appointments.length === 0) {
      appointmentsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
          <p class="text-muted">No appointments found</p>
        </div>
      `;
      return;
    }
    
    // Display appointments in table
    let appointmentsHTML = `
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    appointments.forEach(appointment => {
      const appDate = new Date(appointment.date);
      const formattedDateTime = `${appDate.toLocaleDateString()} ${appointment.time}`;
      const createdDate = new Date(appointment.createdAt);
      const formattedCreatedDate = createdDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      // Remove "Dr." prefix if it already exists in the name
      const doctorName = appointment.doctorId.name.startsWith('Dr. ') ? appointment.doctorId.name : `Dr. ${appointment.doctorId.name}`;
      
      appointmentsHTML += `
        <tr>
          <td>${appointment.patientId.name}</td>
          <td>${doctorName}</td>
          <td>${formattedDateTime}</td>
          <td><span class="badge bg-${appointment.status}">${appointment.status}</span></td>
          <td>${formattedCreatedDate}</td>
        </tr>
      `;
    });
    
    appointmentsHTML += `
          </tbody>
        </table>
      </div>
    `;
    
    appointmentsContainer.innerHTML = appointmentsHTML;
  } catch (error) {
    appointmentsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Error loading appointments: ${error.message}
      </div>
    `;
  }
}

// Load reports
async function loadReports() {
  try {
    const reports = await apiRequest('/admin/reports');
    
    // Display reports
    let reportsHTML = `
      <div class="row">
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Appointments by Status</h5>
            </div>
            <div class="card-body">
              <canvas id="statusChart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="col-md-6">
          <div class="card shadow-sm mb-4">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-user-md me-2"></i>Appointments by Doctor</h5>
            </div>
            <div class="card-body">
              <canvas id="doctorChart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card shadow-sm">
        <div class="card-header">
          <h5 class="mb-0"><i class="fas fa-history me-2"></i>Recent Appointments</h5>
        </div>
        <div class="card-body">
    `;
    
    if (reports.recentAppointments.length === 0) {
      reportsHTML += `
        <div class="text-center py-3">
          <p class="text-muted mb-0">No recent appointments</p>
        </div>
      `;
    } else {
      reportsHTML += `
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      reports.recentAppointments.forEach(appointment => {
        const appDate = new Date(appointment.date);
        const formattedDateTime = `${appDate.toLocaleDateString()} ${appointment.time}`;
        
        // Remove "Dr." prefix if it already exists in the name
        const doctorName = appointment.doctorId.name.startsWith('Dr. ') ? appointment.doctorId.name : `Dr. ${appointment.doctorId.name}`;
        
        reportsHTML += `
          <tr>
            <td>${appointment.patientId.name}</td>
            <td>${doctorName}</td>
            <td>${formattedDateTime}</td>
            <td><span class="badge bg-${appointment.status}">${appointment.status}</span></td>
          </tr>
        `;
      });
      
      reportsHTML += `
            </tbody>
          </table>
        </div>
      `;
    }
    
    reportsHTML += `
        </div>
      </div>
    `;
    
    reportsContainer.innerHTML = reportsHTML;
    
    // Render charts (if Chart.js is available)
    if (typeof Chart !== 'undefined') {
      renderCharts(reports);
    }
  } catch (error) {
    reportsContainer.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>Error loading reports: ${error.message}
      </div>
    `;
  }
}

// Render charts
function renderCharts(reports) {
  // Status chart
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx) {
    const statusData = {
      labels: reports.appointmentsByStatus.map(item => item._id),
      datasets: [{
        data: reports.appointmentsByStatus.map(item => item.count),
        backgroundColor: [
          'rgba(26, 115, 232, 0.8)',
          'rgba(52, 168, 83, 0.8)',
          'rgba(234, 67, 53, 0.8)'
        ],
        borderColor: [
          'rgba(26, 115, 232, 1)',
          'rgba(52, 168, 83, 1)',
          'rgba(234, 67, 53, 1)'
        ],
        borderWidth: 1
      }]
    };
    
    new Chart(statusCtx, {
      type: 'pie',
      data: statusData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Doctor chart
  const doctorCtx = document.getElementById('doctorChart');
  if (doctorCtx) {
    const doctorData = {
      labels: reports.appointmentsByDoctor.map(item => item._id),
      datasets: [{
        label: 'Appointments',
        data: reports.appointmentsByDoctor.map(item => item.count),
        backgroundColor: 'rgba(26, 115, 232, 0.8)',
        borderColor: 'rgba(26, 115, 232, 1)',
        borderWidth: 1
      }]
    };
    
    new Chart(doctorCtx, {
      type: 'bar',
      data: doctorData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}

// Add doctor form submission
document.getElementById('addDoctorForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('doctorName').value;
  const specialization = document.getElementById('doctorSpecialization').value;
  const email = document.getElementById('doctorEmail').value;
  const phone = document.getElementById('doctorPhone').value;
  
  try {
    await apiRequest('/admin/doctors', {
      method: 'POST',
      body: JSON.stringify({
        name,
        specialization,
        email,
        phone
      })
    });
    
    showToast('Success', 'Doctor added successfully', 'success');
    
    // Reset form
    document.getElementById('addDoctorForm').reset();
    
    // Reload users if on users page
    if (window.location.pathname.includes('admin-users')) {
      loadUsers();
    }
  } catch (error) {
    showToast('Error', error.message, 'error');
  }
});

// Load data when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load appropriate data based on current page
  if (window.location.pathname.includes('admin-dashboard')) {
    loadDashboardStats();
  } else if (window.location.pathname.includes('admin-users')) {
    loadUsers();
  } else if (window.location.pathname.includes('admin-appointments')) {
    loadAppointments();
  } else if (window.location.pathname.includes('admin-reports')) {
    loadReports();
  }
});