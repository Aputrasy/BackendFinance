const { verifyToken, USE_STATIC_TOKEN, STATIC_TOKEN } = require('../utils/jwt');

function authMiddleware(req, res, next) {
    try {
        let token = null;

        // 1. Check Authorization header first (preferred method)
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const parts = authHeader.split(' ');
            
            // Handle both "Bearer token" and just "token" formats
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                token = parts[1];
            } else if (parts.length === 1) {
                token = parts[0];
            }
        }

        // 2. Fallback: Check for token in request body (for POST requests)
        if (!token && req.body && req.body.token) {
            token = req.body.token;
        }

        // 3. Fallback: Check for token in query parameters
        if (!token && req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            console.warn(`[Auth] No token provided - ${req.method} ${req.path}`);
            const hint = USE_STATIC_TOKEN 
                ? `Use static token: "${STATIC_TOKEN}"`
                : 'Get token from login endpoint';
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                hint: hint
            });
        }

        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            console.log(`[Auth] Token verified - User: ${decoded.email || 'static'}`);
            next();
        } catch (err) {
            console.warn(`[Auth] Token verification failed - ${err.message}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: err.message
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            error: error.message
        });
    }
}

module.exports = authMiddleware;
