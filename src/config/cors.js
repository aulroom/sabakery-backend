const corsOptions = {
    origin: (origin, callback) => {
        // 🔥 TAMBAHKAN LINK VERCEL DI SINI (Di dalam kurung siku bersama localhost)
        const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
            'http://localhost:5173', 
            'https://sabakery-frontend.vercel.app' // Ini tiket masuk buat Vercel!
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = { corsOptions };