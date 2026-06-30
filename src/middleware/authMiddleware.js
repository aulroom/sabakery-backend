const jwt = require('jsonwebtoken');

// Kita export dengan nama fungsi yang jelas: verifyToken
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token hilang!' });

    const decoded = jwt.verify(token, 'RAHASIA_ANDA');
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid!' });
  }
};