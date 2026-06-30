const User = require('../models/User'); // Pastikan U besar sesuai nama file di foldermu

// Kita export satu-satu secara baku
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    user.full_name = full_name || user.full_name;
    user.phone = phone || user.phone;
    await user.save();

    res.json({ success: true, message: 'Profil berhasil diperbarui!', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal update profil', error: error.message });
  }
};