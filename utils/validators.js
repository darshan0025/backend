const { body, validationResult } = require('express-validator');

const validateReq = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const userValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['MANAGER', 'SUPPORT', 'USER']).withMessage('Invalid role')
];

const ticketValidation = [
    body('title').isLength({ min: 5 }).withMessage('Title minimum length is 5 characters'),
    body('description').isLength({ min: 10 }).withMessage('Description minimum length is 10 characters'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority')
];

const statusValidation = [
    body('status').isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).withMessage('Invalid status')
];

const commentValidation = [
    body('comment').notEmpty().withMessage('Comment is required')
];

module.exports = {
    validateReq,
    userValidation,
    ticketValidation,
    statusValidation,
    commentValidation
};
