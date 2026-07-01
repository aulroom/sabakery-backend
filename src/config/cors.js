const corsOptions = {
    // 🔥 Berikan daftar VIP secara langsung (Tanpa fungsi, tanpa process.env)
    origin: [
        'http://localhost:5173', 
        'https://sabakery-frontend.vercel.app' 
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = { corsOptions };