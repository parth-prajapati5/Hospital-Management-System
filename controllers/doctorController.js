const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

// Get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    // First check if the user is a doctor
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Find doctor record
    const doctor = await Doctor.findOne({ email: user.email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { name, specialization, phone, availableSchedule } = req.body;
    
    // First check if the user is a doctor
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Find and update doctor record
    const doctor = await Doctor.findOne({ email: user.email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found' });
    }
    
    // Update doctor fields
    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.phone = phone || doctor.phone;
    doctor.availableSchedule = availableSchedule || doctor.availableSchedule;
    
    const updatedDoctor = await doctor.save();
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor appointments
const getDoctorAppointments = async (req, res) => {
  try {
    // First check if the user is a doctor
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Find doctor record
    const doctor = await Doctor.findOne({ email: user.email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found' });
    }
    
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name phone')
      .sort({ date: 1, time: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient details
const getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if the user is a doctor
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    
    const patient = await User.findById(id).select('-password');
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add medical record
const addMedicalRecord = async (req, res) => {
  try {
    const { patientId, visitDate, diagnosis, prescription, followUpDate } = req.body;
    
    // First check if the user is a doctor
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    
    // Find doctor record
    const doctor = await Doctor.findOne({ email: user.email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found' });
    }
    
    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Create medical record
    const medicalRecord = new MedicalRecord({
      patientId,
      doctorId: doctor._id,
      visitDate,
      diagnosis,
      prescription,
      followUpDate
    });
    
    const savedRecord = await medicalRecord.save();
    
    // Populate patient and doctor details
    await savedRecord.populate('patientId', 'name');
    await savedRecord.populate('doctorId', 'name specialization');
    
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // First check if the user is a doctor
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    
    // Find doctor record
    const doctor = await Doctor.findOne({ email: user.email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor record not found' });
    }
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if this appointment belongs to this doctor
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Access denied. This is not your appointment.' });
    }
    
    // Update status
    appointment.status = status;
    const updatedAppointment = await appointment.save();
    
    // Populate patient and doctor details
    await updatedAppointment.populate('patientId', 'name');
    await updatedAppointment.populate('doctorId', 'name specialization');
    
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getPatientDetails,
  addMedicalRecord,
  updateAppointmentStatus
};