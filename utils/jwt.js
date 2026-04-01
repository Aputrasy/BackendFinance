const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

function generateToken(user) {
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
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    generateToken,
    verifyToken,
    JWT_SECRET
};
