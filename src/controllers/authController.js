const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER: Kirim teks asli, biarkan model User.js yang mengacaknya otomatis!
exports.register = async (req, res) => {
  try {
    const { full_name, username, email, password } = req.body;

    // Bikin akun dengan mengirimkan password asli (TIDAK PERLU BCRYPT DI SINI)
    const newUser = await User.create({
      full_name: full_name || username, 
      username: username,
      email: email,
      password_hash: password, // <--- Langsung kirim teks asli!
      role: 'pembeli' 
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: { id: newUser.id, username: newUser.username, role: newUser.role }
    });

  } catch (error) {
    let pesanError = error.message; 
    if (error.parent && error.parent.message) pesanError = error.parent.message;
    else if (error.errors && error.errors.length > 0) pesanError = error.errors[0].message;
    
    console.error("ERROR REGISTRASI:", pesanError);
    res.status(500).json({ success: false, message: `INFO ERROR DATABASE: ${pesanError}` });
  }
};

// 2. LOGIN: Membandingkan password ketikan dengan password acak di database
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    
    // B. Bandingkan password yang diketik dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // C. Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      'RAHASIA_ANDA', 
      { expiresIn: '1d' }
    );

    res.json({
        success: true,
        message: 'Login berhasil!',
        token: token,
        user: { 
            id: user.id, 
            username: user.username, 
            role: user.role 
        }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};