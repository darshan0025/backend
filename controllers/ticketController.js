const db = require('../config/db');

exports.createTicket = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const userId = req.user.id;

        if (!title || title.length < 5) {
            return res.status(400).json({ message: 'Title is required and must be at least 5 characters' });
        }
        if (!description || description.length < 10) {
            return res.status(400).json({ message: 'Description is required and must be at least 10 characters' });
        }

        const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
        const ticketPriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

        const [result] = await db.pool.query(
            'INSERT INTO tickets (title, description, priority, created_by) VALUES (?, ?, ?, ?)',
            [title, description, ticketPriority, userId]
        );

        res.status(201).json({
            message: 'Ticket created successfully',
            ticket: {
                id: result.insertId,
                title,
                description,
                status: 'OPEN',
                priority: ticketPriority,
                created_by: userId
            }
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getTickets = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        let query = `
            SELECT t.id, t.title, t.description, t.status, t.priority, t.created_at,
                   creator.name as creator_name, assign.name as assignee_name
            FROM tickets t
            JOIN users creator ON t.created_by = creator.id
            LEFT JOIN users assign ON t.assigned_to = assign.id
        `;
        let queryParams = [];

        if (userRole === 'MANAGER') {
        } else if (userRole === 'SUPPORT') {
            query += ' WHERE t.assigned_to = ?';
            queryParams.push(userId);
        } else if (userRole === 'USER') {
            query += ' WHERE t.created_by = ?';
            queryParams.push(userId);
        }

        query += ' ORDER BY t.created_at DESC';

        const [tickets] = await db.pool.query(query, queryParams);
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.assignTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { assigneeId } = req.body;
        const userId = req.user.id;

        if (!assigneeId) {
            return res.status(400).json({ message: 'Assignee ID is required' });
        }

        const [ticketData] = await db.pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (ticketData.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const [assigneeData] = await db.pool.query(
            'SELECT u.*, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
            [assigneeId]
        );
        if (assigneeData.length === 0) {
            return res.status(400).json({ message: 'Assignee not found' });
        }
        if (assigneeData[0].role === 'USER') {
            return res.status(400).json({ message: 'Cannot assign ticket to a USER role' });
        }

        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            const currentStatus = ticketData[0].status;

            await connection.query('UPDATE tickets SET assigned_to = ?, status = ? WHERE id = ?', [assigneeId, 'IN_PROGRESS', ticketId]);

            if (currentStatus !== 'IN_PROGRESS') {
                await connection.query(
                    'INSERT INTO ticket_status_logs (ticket_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
                    [ticketId, currentStatus, 'IN_PROGRESS', userId]
                );
            }

            await connection.commit();
            res.json({ message: 'Ticket assigned successfully and status updated to IN_PROGRESS' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error assigning ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const validTransitions = {
    'OPEN': ['IN_PROGRESS', 'CLOSED'],
    'IN_PROGRESS': ['RESOLVED', 'CLOSED'],
    'RESOLVED': ['CLOSED'],
    'CLOSED': []
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { status } = req.body;
        const userId = req.user.id;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }


        const connection = await db.pool.getConnection();
        try {
            await connection.beginTransaction();

            const [ticketData] = await connection.query('SELECT * FROM tickets WHERE id = ? FOR UPDATE', [ticketId]);
            if (ticketData.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Ticket not found' });
            }

            const currentStatus = ticketData[0].status;


            if (req.user.role === 'SUPPORT') {
                if (ticketData[0].assigned_to !== userId) {
                    await connection.rollback();
                    return res.status(403).json({ message: 'Forbidden: You can only update tickets assigned to you' });
                }
                if (status !== 'IN_PROGRESS' && status !== 'RESOLVED') {
                    await connection.rollback();
                    return res.status(403).json({ message: 'Forbidden: Support can only set status to IN_PROGRESS or RESOLVED' });
                }
            } else if (req.user.role === 'MANAGER') {
                if (status !== 'CLOSED') {
                    await connection.rollback();
                    return res.status(403).json({ message: 'Forbidden: Manager can only close tickets from this endpoint' });
                }
            }

            if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(status)) {
                await connection.rollback();
                return res.status(400).json({
                    message: `Invalid status transition from ${currentStatus} to ${status}`
                });
            }


            await connection.query('UPDATE tickets SET status = ? WHERE id = ?', [status, ticketId]);


            await connection.query(
                'INSERT INTO ticket_status_logs (ticket_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)',
                [ticketId, currentStatus, status, userId]
            );

            await connection.commit();
            res.json({ message: 'Ticket status updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.deleteTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;

        const [result] = await db.pool.query('DELETE FROM tickets WHERE id = ?', [ticketId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
