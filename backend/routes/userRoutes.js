const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateUser = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/getUserInfo', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId);
        res.status(200).send({user})
    } catch (err) {
        console.error("Error fetching user information:", error);
        res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/verify-password', authenticateUser, async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.userId;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch){
            return res.status(200).json({ message: 'Password verified successfully.' }); 
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        } 
    
    } catch (err) {
        console.error("Error verifying password:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email, phoneNumber, oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update name, email, phone if provided
        if (name) user.name = name;
        if (email) user.username = email; // you store email in username
        if (phoneNumber) user.phoneNumber = phoneNumber;

        // If password change is requested
        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({ message: 'Old password is required to change password' });
            }

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Old password is incorrect' });
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            user.password = hashed;
        }

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;