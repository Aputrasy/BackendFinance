const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format. Use Bearer token.'
            });
        }

        const token = parts[1];

        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
}

module.exports = authMiddleware;
