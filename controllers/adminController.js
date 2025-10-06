const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add doctor
const addDoctor = async (req, res) => {
  try {
    const { name, specialization, email, phone, availableSchedule } = req.body;
    
    // Check if user already exists with this email
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create user with doctor role
    const user = new User({
      username: email.split('@')[0],
      email,
      password: 'doctor123', // Default password, should be changed by admin
      role: 'doctor',
      name
    });
    
    const savedUser = await user.save();
    
    // Create doctor record
    const doctor = new Doctor({
      name,
      specialization,
      email,
      phone,
      availableSchedule
    });
    
    const savedDoctor = await doctor.save();
    
    res.status(201).json({
      user: savedUser,
      doctor: savedDoctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is a doctor, also delete doctor record
    if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ email: user.email });
    }
    
    // Delete related appointments and medical records
    await Appointment.deleteMany({ 
      $or: [{ patientId: id }, { doctorId: id }] 
    });
    
    await MedicalRecord.deleteMany({ 
      $or: [{ patientId: id }, { doctorId: id }] 
    });
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1, time: -1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reports
const getReports = async (req, res) => {
  try {
    // Get total counts
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAppointments = await Appointment.countDocuments();
    
    // Get appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get appointments by doctor
    const appointmentsByDoctor = await Appointment.aggregate([
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $group: {
          _id: '$doctor.name',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patientId', 'name')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      totals: {
        patients: totalPatients,
        doctors: totalDoctors,
        appointments: totalAppointments
      },
      appointmentsByStatus,
      appointmentsByDoctor,
      recentAppointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  addDoctor,
  deleteUser,
  getAllAppointments,
  getReports
};