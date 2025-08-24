const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Admin = require('../models/AdminModel.js');
const Cafe = require('../models/CafeModel.js');
const { adminAuth } = require('../middlewares/adminAuth.js');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
const isValidPassword = (password) => {
  return password && password.length >= 8;
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    console.log('Generated token:', token);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    // Get features from Cafe model
    let features = {
      ordersToggle: false,
      eventsToggle: false,
      dailyOfferToggle: false
    };
    
    try {
      const cafe = await Cafe.findOne();
      if (cafe && cafe.features) {
        features = cafe.features;
      }
    } catch (err) {
      console.log('Error fetching cafe features:', err);
    }

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        features
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    admin.resetPasswordOTP = otp;
    admin.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { otp, password } = req.body;

    if (!otp || !password) {
      return res.status(400).json({ message: 'OTP and new password are required' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const admin = await Admin.findOne({
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(12);
    admin.password = await bcrypt.hash(password, salt);
    admin.resetPasswordOTP = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Get features from Cafe model
    let features = {
      ordersToggle: false,
      eventsToggle: false,
      dailyOfferToggle: false
    };
    
    try {
      const cafe = await Cafe.findOne();
      if (cafe && cafe.features) {
        features = cafe.features;
      }
    } catch (err) {
      console.log('Error fetching cafe features:', err);
    }

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        features
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addOrUpdateTable = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { tableId, isActive } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Initialize tables if it doesn't exist
    if (!admin.tables) {
      admin.tables = new Map();
    }

    // Set the table status
    admin.tables.set(tableId, isActive);
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Table ${tableId} ${isActive ? 'activated' : 'deactivated'} successfully`,
      tables: Object.fromEntries(admin.tables)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTables = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    res.status(200).json({
      success: true,
      tables: admin.tables ? Object.fromEntries(admin.tables) : {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeTable = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { tableId } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    if (admin.tables && admin.tables.has(tableId)) {
      admin.tables.delete(tableId);
      await admin.save();
      
      res.status(200).json({
        success: true,
        message: `Table ${tableId} removed successfully`,
        tables: Object.fromEntries(admin.tables)
      });
    } else {
      res.status(404).json({ message: 'Table not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGSTSettings = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { gstIncluded, cgst, sgst } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    if (gstIncluded !== undefined) admin.gstIncluded = gstIncluded;
    if (cgst !== undefined) admin.cgst = cgst;
    if (sgst !== undefined) admin.sgst = sgst;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'GST settings updated successfully',
      gstSettings: {
        gstIncluded: admin.gstIncluded,
        cgst: admin.cgst,
        sgst: admin.sgst
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderingStatus = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { allowOrdering } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    admin.allowOrdering = allowOrdering;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Ordering ${allowOrdering ? 'enabled' : 'disabled'} successfully`,
      allowOrdering: admin.allowOrdering
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeatures = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      success: true,
      features: admin.features || {
        ordersToggle: false,
        eventsToggle: false,
        dailyOfferToggle: false
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeatures = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { ordersToggle, eventsToggle, dailyOfferToggle } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (!admin.features) {
      admin.features = {};
    }

    if (ordersToggle !== undefined) admin.features.ordersToggle = ordersToggle;
    if (eventsToggle !== undefined) admin.features.eventsToggle = eventsToggle;
    if (dailyOfferToggle !== undefined) admin.features.dailyOfferToggle = dailyOfferToggle;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Features updated successfully',
      features: admin.features
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  login,
  forgotPassword,
  resetPassword,
  signup,
  addOrUpdateTable,
  getTables,
  removeTable,
  updateGSTSettings,
  updateOrderingStatus,
  getFeatures,
  updateFeatures
};