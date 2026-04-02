const db = require('./db.cjs');

async function markAllVerified() {
    try {
        console.log('Marking all existing users as verified...');
        const result = await db.query('UPDATE users SET email_verified = TRUE WHERE email_verified IS NOT TRUE');
        console.log(`Successfully updated ${result.rowCount} users.`);
    } catch (err) {
        console.error('Error updating users:', err);
    } finally {
        process.exit();
    }
}

markAllVerified();
