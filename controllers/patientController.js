const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

// Get patient profile
const getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user._id).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update patient profile
const updatePatientProfile = async (req, res) => {
  try {
    const { name, gender, phone, address, emergencyContact } = req.body;
    
    const patient = await User.findById(req.user._id);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Update patient fields
    patient.name = name || patient.name;
    patient.gender = gender || patient.gender;
    patient.phone = phone || patient.phone;
    patient.address = address || patient.address;
    patient.emergencyContact = emergencyContact || patient.emergencyContact;
    
    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-__v');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: 'booked'
    });
    
    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    // Create new appointment
    const appointment = new Appointment({
      patientId: req.user._id,
      doctorId,
      date,
      time,
      notes
    });
    
    const savedAppointment = await appointment.save();
    
    // Populate doctor and patient details
    await savedAppointment.populate('doctorId', 'name specialization');
    await savedAppointment.populate('patientId', 'name');
    
    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient appointments
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findOne({
      _id: id,
      patientId: req.user._id
    });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }
    
    appointment.status = 'canceled';
    const updatedAppointment = await appointment.save();
    
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient medical records
const getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .sort({ visitDate: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getAllDoctors,
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  getMedicalRecords
};