# Community Health Clinic Appointments and Records System

A full-stack web application for managing appointments and patient medical records in a community health clinic. The system allows patients, doctors, and admins to interact with different functionalities through separate dashboards.

## 🏥 Overview

This application automates appointment scheduling, record-keeping, and notifications while maintaining security and privacy. It features a modern, responsive UI with role-based access control.

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Bootstrap 5
- Font Awesome

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose ORM)

### Security
- JWT Authentication
- bcrypt for password hashing
- Role-based access control
- Input validation

## 🎯 Core Modules

### 👤 Patient Module
- Patient registration and login
- View/edit personal profile
- Book appointments with doctors
- Cancel or reschedule appointments
- View appointment history
- Access personal medical records

### 🩺 Doctor Module
- Doctor login
- View personal schedule and upcoming appointments
- View patient details
- Add consultation notes, diagnoses, and prescriptions
- Update patient records after each appointment

### 🛠️ Admin Module
- Admin login
- Add/remove doctors and patients
- Manage all appointments and user accounts
- Generate reports
- Configure clinic hours and holidays

## 🗃️ Database Design

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,
  role: String, // 'patient', 'doctor', 'admin'
  name: String,
  gender: String,
  phone: String,
  address: String,
  emergencyContact: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Doctors Collection
```javascript
{
  _id: ObjectId,
  name: String,
  specialization: String,
  email: String,
  phone: String,
  availableSchedule: [String], // Example: ["Mon 10-1", "Wed 2-5"]
  createdAt: Date,
  updatedAt: Date
}
```

### Appointments Collection
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  date: String,
  time: String,
  status: String, // 'booked', 'canceled', 'completed'
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### MedicalRecords Collection
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  visitDate: Date,
  diagnosis: String,
  prescription: String,
  followUpDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following:
```env
NODE_ENV=development
PORT=5007
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:5007`

## 📁 Project Structure
```
/clinic-app
├── /config
│   └── db.js
├── /controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── doctorController.js
│   └── patientController.js
├── /middleware
│   └── auth.js
├── /models
│   ├── Appointment.js
│   ├── Doctor.js
│   ├── MedicalRecord.js
│   └── User.js
├── /public
│   ├── /css
│   ├── /js
│   ├── /pages
│   ├── index.html
│   ├── login.html
│   └── register.html
├── /routes
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── doctorRoutes.js
│   └── patientRoutes.js
├── .env
├── package.json
├── server.js
└── README.md
```

## 🔐 Security Features

- JWT Authentication for all roles
- bcrypt for password hashing
- Role-based access control for routes
- Input validation for all user data
- HTTPS-ready setup

## 🎨 UI Design

- Modern flat design with rounded card-based layout
- Drop shadows and hover effects
- Primary colors: #1A73E8 (blue), #F8F9FA (white), #34A853 (green)
- Sidebar navigation for dashboard pages
- Responsive design for all device sizes

## 📊 Reports & Analytics

- Total appointments per doctor/day/week
- Most visited doctors
- Patient growth trends
- Upcoming follow-ups summary

## ☁️ Deployment

### Frontend
- Vercel
- Netlify

### Backend
- Render
- Railway
- Heroku

### Database
- MongoDB Atlas

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

For support, email [your-email] or open an issue in the repository.