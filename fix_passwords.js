const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function fixPasswords() {
    try {
        const hash = await bcrypt.hash('password123', 10);
        await db.pool.query('UPDATE users SET password = ? WHERE email IN (?, ?)', [
            hash,
            'support@test.com',
            'user@test.com'
        ]);
        console.log('Fixed Support and User passwords!');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

fixPasswords();