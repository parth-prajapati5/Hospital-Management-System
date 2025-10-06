const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  updatePatientProfile,
  getAllDoctors,
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  getMedicalRecords
} = require('../controllers/patientController');
const { auth, patientAuth } = require('../middleware/auth');

// All patient routes require authentication and patient role
router.use(auth);
router.use(patientAuth);

// Patient profile routes
router.get('/profile', getPatientProfile);
router.put('/profile', updatePatientProfile);

// Doctor routes
router.get('/doctors', getAllDoctors);

// Appointment routes
router.post('/appointments/book', bookAppointment);
router.get('/appointments', getPatientAppointments);
router.put('/appointments/:id/cancel', cancelAppointment);

// Medical records routes
router.get('/records', getMedicalRecords);

module.exports = router;