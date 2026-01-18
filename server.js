// straysafe-backend/server.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // Added for file uploads
const path = require('path');   // Added for handling file paths
const fs = require('fs');       // Added for interacting with the file system

const app = express();
const PORT = process.env.PORT || 5000;

// --- DIRECTORY SETUP ---
// Ensure the 'uploads' directory exists for storing media files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files statically so they can be accessed by URL
app.use('/uploads', express.static(uploadsDir));


// --- MULTER CONFIG FOR FILE UPLOADS ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid conflicts
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- MONGOOSE SCHEMAS & MODELS ---

// Model for Incident Reports
const ReportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  reporterName: { type: String, required: true },
  reporterPhone: { type: String, required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  aiPriority: String,
  aiJustification: String,
  status: { type: String, default: 'Open' },
  submittedAt: { type: Date, default: Date.now }
});
const Report = mongoose.model('Report', ReportSchema);

// Model for Volunteers
const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  interests: [String],
  registeredAt: { type: Date, default: Date.now }
});
const Volunteer = mongoose.model('Volunteer', VolunteerSchema);


// --- API ENDPOINTS (ROUTES) ---

// GET: Fetch all incident reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ submittedAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reports', error: err });
  }
});

// POST: Create a new incident report (NOW WITH FILE UPLOAD)
app.post('/api/reports', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Media file is required.' });
        }
        
        // Construct the full URL for the uploaded file
        const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        const newReport = new Report({
            ...req.body,
            coordinates: JSON.parse(req.body.coordinates), // The frontend sends this as a string
            mediaUrl: mediaUrl, // Use the actual URL of the saved file
            mediaType: req.file.mimetype.startsWith('image') ? 'image' : 'video',
        });
        
        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (err) {
        console.error("Error saving report:", err);
        res.status(400).json({ message: 'Error saving report', error: err.toString() });
    }
});

// PATCH: Update the status of a specific report (FIXED ROUTE)
app.patch('/api/reports/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Open', 'In Progress', 'Resolved', 'Escalated'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const updatedReport = await Report.findByIdAndUpdate(id, { status: status }, { new: true });
    if (!updatedReport) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    res.json(updatedReport);
  } catch (err) {
    console.error("Error updating report status:", err);
    res.status(500).json({ message: 'Error updating report status', error: err });
  }
});

// GET: Fetch all volunteers
app.get('/api/volunteers', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ registeredAt: -1 });
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching volunteers', error: err });
  }
});

// POST: Create a new volunteer registration
app.post('/api/volunteers', async (req, res) => {
    try {
        const newVolunteer = new Volunteer(req.body);
        const savedVolunteer = await newVolunteer.save();
        res.status(201).json(savedVolunteer);
    } catch (err) {
        res.status(400).json({ message: 'Error saving volunteer', error: err });
    }
});

// --- START THE SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});