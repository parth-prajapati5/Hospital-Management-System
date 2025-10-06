const express = require('express');
const router = express.Router();
const {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getPatientDetails,
  addMedicalRecord,
  updateAppointmentStatus
} = require('../controllers/doctorController');
const { auth, doctorAuth } = require('../middleware/auth');

// All doctor routes require authentication and doctor role
router.use(auth);
router.use(doctorAuth);

// Doctor profile routes
router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);

// Appointment routes
router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

// Patient details route
router.get('/patients/:id', getPatientDetails);

// Medical record route
router.post('/records', addMedicalRecord);

module.exports = router;