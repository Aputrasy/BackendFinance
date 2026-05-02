require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, closeDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const masterRoutes = require('./routes/masters');
const detailRoutes = require('./routes/details');
const viewRoutes = require('./routes/view');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = corsOrigin === '*' 
    ? { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }
    : { 
        origin: corsOrigin.split(','), // Support multiple origins
        methods: ['GET', 'POST', 'PUT', 'DELETE'], 
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      };

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    const authHeader = req.headers.authorization ? '✓ Authorization header present' : '✗ No Authorization header';
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} [${authHeader}]`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Finance Tracker API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/details', detailRoutes);
app.use('/api/view', viewRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
async function startServer() {
    try {
        // Connect to database
        await connectDB();
        console.log('Database connected successfully');

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}/api`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await closeDB();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await closeDB();
    process.exit(0);
});

startServer();
