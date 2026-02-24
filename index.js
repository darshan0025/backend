const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');
const commentRoutes = require('./routes/comments');


// Use Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
app.use('/comments', commentRoutes);


// Routes (to be implemented)
app.get('/health', (req, res) => {
    res.json({ status: 'UP', message: 'Helpdesk API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
