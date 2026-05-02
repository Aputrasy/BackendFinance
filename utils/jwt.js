const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'b8fc25e2c1d926bab915a33d07cbb4078d61d315566f685d906fe54ab8dd93a786ffe661ee3cf8ac05f7f8ff232076113f04618eb5366d90247db24757796e84';
const USE_STATIC_TOKEN = process.env.USE_STATIC_TOKEN === 'true';
const STATIC_TOKEN = process.env.STATIC_TOKEN || 'your-static-token-key-123456';

function generateToken(user) {
    // Jika menggunakan static token, return static token
    if (USE_STATIC_TOKEN) {
        return STATIC_TOKEN;
    }
    
    // Jika menggunakan JWT (default)
    return jwt.sign(
        { 
            userId: user.Id, 
            email: user.Email,
            name: user.Name 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

function verifyToken(token) {
    // Jika menggunakan static token, validate static token
    if (USE_STATIC_TOKEN) {
        if (token === STATIC_TOKEN) {
            // Return dummy user object untuk static token
            return {
                userId: 1,
                email: 'static@app.com',
                name: 'Static User'
            };
        } else {
            throw new Error('Invalid static token');
        }
    }
    
    // Jika menggunakan JWT (default)
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    generateToken,
    verifyToken,
    JWT_SECRET,
    STATIC_TOKEN,
    USE_STATIC_TOKEN
};
