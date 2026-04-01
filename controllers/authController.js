const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

class AuthController {
    // Register new user
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
            }

            const pool = await getPool();

            // Check if email already exists
            const checkResult = await pool.request()
                .input('email', email)
                .query('SELECT Id FROM Users WHERE Email = @email');

            if (checkResult.recordset.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Insert new user
            const result = await pool.request()
                .input('name', name)
                .input('email', email)
                .input('passwordHash', passwordHash)
                .query(`
                    INSERT INTO Users (Name, Email, PasswordHash)
                    VALUES (@name, @email, @passwordHash);
                    SELECT SCOPE_IDENTITY() AS UserId;
                `);

            const userId = result.recordset[0].UserId;

            // Generate token
            const token = generateToken({
                Id: userId,
                Name: name,
                Email: email
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    userId,
                    name,
                    email,
                    token
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: error.message
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const pool = await getPool();

            // Get user by email
            const result = await pool.request()
                .input('email', email)
                .query('SELECT Id, Name, Email, PasswordHash FROM Users WHERE Email = @email');

            if (result.recordset.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const user = result.recordset[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.PasswordHash);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate token
            const token = generateToken(user);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    userId: user.Id,
                    name: user.Name,
                    email: user.Email,
                    token
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    }

    // Get current user
    async getCurrentUser(req, res) {
        try {
            const pool = await getPool();

            const result = await pool.request()
                .input('userId', req.user.userId)
                .query('SELECT Id, Name, Email, CreatedAt FROM Users WHERE Id = @userId');

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0]
            });

        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user info',
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();
