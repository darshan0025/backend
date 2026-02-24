const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateReq, ticketValidation, statusValidation } = require('../utils/validators');

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket (USER, MANAGER)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *     responses:
 *       201:
 *         description: Ticket created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get tickets based on role (MANAGER=all, SUPPORT=assigned, USER=own)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized
 */
// POST /tickets (USER only)
router.post('/', authenticate, authorize(['USER']), ticketValidation, validateReq, ticketController.createTicket);

// GET /tickets (MANAGER all, SUPPORT assigned, USER own)
router.get('/', authenticate, ticketController.getTickets);

/**
 * @swagger
 * /tickets/{id}/assign:
 *   patch:
 *     summary: Assign a ticket to a SUPPORT user (MANAGER only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigneeId
 *             properties:
 *               assigneeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ticket assigned
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket or User not found
 */
// PATCH /tickets/:id/assign (MANAGER only)
router.patch('/:id/assign', authenticate, authorize(['MANAGER']), ticketController.assignTicket);

/**
 * @swagger
 * /tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *     responses:
 *       200:
 *         description: Ticket status updated
 *       400:
 *         description: Invalid transition or bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
// PATCH /tickets/:id/status (MANAGER, SUPPORT)
router.patch('/:id/status', authenticate, authorize(['MANAGER', 'SUPPORT']), statusValidation, validateReq, ticketController.updateTicketStatus);

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete a ticket (MANAGER only)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Ticket deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Ticket not found
 */
// DELETE /tickets/:id (MANAGER)
router.delete('/:id', authenticate, authorize('MANAGER'), ticketController.deleteTicket);

const commentController = require('../controllers/commentController');
const { commentValidation } = require('../utils/validators');

/**
 * @swagger
 * /tickets/{id}/comments:
 *   post:
 *     summary: Add a comment to a ticket
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (no access to ticket)
 * 
 *   get:
 *     summary: List comments for a ticket
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of comments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// POST /tickets/:id/comments
router.post('/:id/comments', authenticate, commentValidation, validateReq, commentController.addComment);

// GET /tickets/:id/comments
router.get('/:id/comments', authenticate, commentController.getComments);

module.exports = router;
