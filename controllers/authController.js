import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import mongoose from 'mongoose';

const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, businessName, address } = req.body;
    
    // Check if user exists in users collection
    const existingUser = await mongoose.connection.db
      .collection("users")
      .findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate user_id
    const userCount = await mongoose.connection.db.collection("users").countDocuments();
    const user_id = `USR${String(userCount + 1).padStart(4, '0')}`;
    
    // Create user object
    const newUser = {
      fullName: fullName || email.split('@')[0],
      email,
      phone: phone || '',
      passwordHash,
      role: role || "retailer",
      businessName: businessName || '',
      address: address || {},
      status: "active",
      createdAt: new Date(),
      createdBy: null,
      updatedAt: null,
      updatedBy: null,
      deletedAt: null,
      deletedBy: null,
      user_id
    };
    
    const result = await mongoose.connection.db
      .collection("users")
      .insertOne(newUser);
    
    res.status(201).json({
      _id: result.insertedId,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      businessName: newUser.businessName,
      user_id: newUser.user_id,
      token: generateToken(result.insertedId)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    
    // Check only users collection
    const user = await mongoose.connection.db.collection('users').findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('User status:', user.status);
      console.log('Password hash from DB:', user.passwordHash);
      
      if (user.status === 'active') {
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        console.log('Password valid:', isValidPassword);
          
        if (isValidPassword) {
          const sessionTimeout = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          
          res.json({
            success: true,
            message: "Login successful",
            user: {
              _id: user._id,
              fullName: user.fullName,
              email: user.email,
              phone: user.phone,
              role: user.role,
              businessName: user.businessName,
              user_id: user.user_id,
              status: user.status,
              address: user.address
            },
            token: generateToken(user._id),
            sessionTimeout: sessionTimeout,
            loginTime: new Date(),
            permissions: user.role === 'admin' ? ['read', 'write', 'delete'] : ['read', 'write']
          });
        } else {
          res.status(401).json({ message: 'Invalid email or password' });
        }
      } else {
        res.status(401).json({ message: 'User account is inactive' });
      }
    } else {
      res.status(401).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logout successful",
      logoutTime: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, loginUser, logoutUser };