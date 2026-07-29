require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server_port = process.env.PORT || 3001;

// Configure CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const availabilitySchema = new mongoose.Schema({
    startDate: Date,
    endDate: Date,
    start: String,
    end: String,
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    bgmiId: { type: String, required: true, unique: true },
    pin: { type: String, required: true, select: false },
    availability: [availabilitySchema]
});

userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, JWT_SECRET, {
        expiresIn: '30d'
    });
};

const User = mongoose.model('User', userSchema);

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token, user: { _id: user._id, name: user.name, bgmiId: user.bgmiId } });
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    const { name, bgmiId, pin } = req.body;
    if (!name || !bgmiId || !pin) {
        return res.status(400).json({ message: 'Please provide name, BGMI ID, and a 4-digit PIN' });
    }
    if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash(pin, salt);
        const user = await User.create({ name, bgmiId, pin: hashedPin });
        sendTokenResponse(user, 201, res);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { name, pin } = req.body;
    if (!name || !pin) {
        return res.status(400).json({ message: 'Please provide your name and PIN' });
    }

    try {
        const user = await User.findOne({ name }).select('+pin +bgmiId');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(pin, user.pin);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid PIN' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Middleware to protect routes ---
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// --- API Routes ---
// Note: The '/api/users' route will now implicitly not return the pin
// because of the `select: false` option in the schema.
app.get('/api/users', protect, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.post('/api/users/availability', protect, async (req, res) => {
    const { availability } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { availability },
            { new: true }
        );
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: 'User not found' });
    }
});

app.get('/api/auth/me', protect, async (req, res) => {
    res.status(200).json(req.user);
});

app.listen(server_port, () => {
    console.log(`Server is running on http://localhost:${server_port}`);
});
