const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  addDoctor,
  deleteUser,
  getAllAppointments,
  getReports
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminAuth);

// User management routes
router.get('/users', getAllUsers);
router.post('/doctors', addDoctor);
router.delete('/users/:id', deleteUser);

// Appointment management routes
router.get('/appointments', getAllAppointments);

// Reports route
router.get('/reports', getReports);

module.exports = router;