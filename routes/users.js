const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateReq, userValidation } = require('../utils/validators');

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user (MANAGER)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [MANAGER, SUPPORT, USER]
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorize('MANAGER'), userValidation, validateReq, userController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users (MANAGER)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, authorize('MANAGER'), userController.getUsers);

module.exports = router;
