// addUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const addUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const username = '221400020@gift.edu.pk';
    const password = 'admin123';
    const name = 'Eman Faisal';
    const phoneNumber = '03237300043'

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash, name , phoneNumber });
    await user.save();

    console.log('✅ Admin user created');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error creating user:', err);
  }
};

addUser();
