const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Enforce role enum limit at API level to be safe before DB constraint
        const allowedRoles = ['MANAGER', 'SUPPORT', 'USER'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if user already exists
        const [existing] = await db.pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Get Role ID
        const [roles] = await db.pool.query('SELECT id FROM roles WHERE name = ?', [role]);
        if (roles.length === 0) {
            return res.status(400).json({ message: 'Role does not exist in DB' });
        }
        const roleId = roles[0].id;

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.pool.query(
            'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, roleId]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: result.insertId,
                name,
                email,
                role
            }
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.pool.query(
            `SELECT u.id, u.name, u.email, r.name as role, u.created_at
             FROM users u
             JOIN roles r ON u.role_id = r.id`
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
