const db = require('../config/db');

// Helper function to check if user has access to a ticket
const canAccessTicket = async (ticketId, user) => {
    if (user.role === 'MANAGER') return true;

    const [tickets] = await db.pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) return false;

    const ticket = tickets[0];
    if (user.role === 'SUPPORT' && ticket.assigned_to === user.id) return true;
    if (user.role === 'USER' && ticket.created_by === user.id) return true;

    return false;
};

exports.addComment = async (req, res) => {
    try {
        const ticketId = req.params.id; // from /tickets/:id/comments
        const { comment } = req.body;
        const userId = req.user.id;

        if (!comment) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const hasAccess = await canAccessTicket(ticketId, req.user);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this ticket' });
        }

        const [result] = await db.pool.query(
            'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
            [ticketId, userId, comment]
        );

        res.status(201).json({
            message: 'Comment added successfully',
            comment: {
                id: result.insertId,
                ticket_id: ticketId,
                user_id: userId,
                comment
            }
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const ticketId = req.params.id; // from /tickets/:id/comments

        const hasAccess = await canAccessTicket(ticketId, req.user);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this ticket' });
        }

        const [comments] = await db.pool.query(
            `SELECT c.id, c.comment, c.created_at, u.name as author_name, r.name as author_role
             FROM ticket_comments c
             JOIN users u ON c.user_id = u.id
             JOIN roles r ON u.role_id = r.id
             WHERE c.ticket_id = ?
             ORDER BY c.created_at ASC`,
            [ticketId]
        );

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const commentId = req.params.id; // from /comments/:id
        const { comment } = req.body;
        const userId = req.user.id;

        if (!comment) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const [commentData] = await db.pool.query('SELECT * FROM ticket_comments WHERE id = ?', [commentId]);
        if (commentData.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Author or MANAGER can edit
        if (commentData[0].user_id !== userId && req.user.role !== 'MANAGER') {
            return res.status(403).json({ message: 'Forbidden: You can only edit your own comments unless you are a MANAGER' });
        }

        await db.pool.query('UPDATE ticket_comments SET comment = ? WHERE id = ?', [comment, commentId]);
        res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id; // from /comments/:id
        const userId = req.user.id;

        const [commentData] = await db.pool.query('SELECT * FROM ticket_comments WHERE id = ?', [commentId]);
        if (commentData.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Author or MANAGER can delete
        if (commentData[0].user_id !== userId && req.user.role !== 'MANAGER') {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own comments unless you are a MANAGER' });
        }

        await db.pool.query('DELETE FROM ticket_comments WHERE id = ?', [commentId]);
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
