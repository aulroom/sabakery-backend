const multer = require('multer');

// Gunakan memoryStorage agar foto TIDAK disimpan di folder lokal (karena Render tidak mengizinkan)
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

module.exports = upload;