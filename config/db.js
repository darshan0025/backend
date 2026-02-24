const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true // Needed to run the init script
});

// Create database if it doesn't exist to ensure tests can run even if it's completely empty
const initializeDatabase = async () => {
    try {
        const rootPool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        await rootPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await rootPool.end();
        console.log(`Database ${process.env.DB_NAME} created or already exists.`);

        // Now run the schema script
        const schemaPath = path.join(__dirname, '../database_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schema);
        console.log('Database schema initialized initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = {
    pool,
    initializeDatabase
};
