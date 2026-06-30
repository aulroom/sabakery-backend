const { User } = require('./src/models'); 

async function resetDanBuatAkun() {
    try {
        console.log('⏳ Sedang membersihkan data lama...');
        await User.destroy({ where: {}, truncate: true, cascade: true }); 

        // KITA KIRIM TEKS ASLI, BIARKAN USER.JS BOS YANG MENGACAKNYA!
        await User.create({
            username: 'admin',
            email: 'admin@sabakery.com',
            password_hash: 'bos123',    // <--- Langsung teks asli!
            full_name: 'CEO SA Bakery',
            role: 'owner'
        });

        await User.create({
            username: 'kasir',
            email: 'kasir@sabakery.com',
            password_hash: 'kasir123',  // <--- Langsung teks asli!
            full_name: 'Mbak Kasir',
            role: 'kasir'
        });

        console.log('✅ BERHASIL! Akun dibuat (Satpam User.js telah mengacaknya otomatis)!');
        process.exit();
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }
}

resetDanBuatAkun();