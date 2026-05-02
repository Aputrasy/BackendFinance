const { getPool } = require('../config/database');

class DetailController {
    // Get all details for a master (query param style)
    async getByMasterQuery(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const masterId = parseInt(req.query.masterId);

            if (!masterId) {
                return res.status(400).json({
                    success: false,
                    message: 'masterId query parameter is required'
                });
            }


            // Verify master belongs to user
            const masterCheck = await pool.request()
                .input('masterId', masterId)
                .input('userId', userId)
                .query('SELECT Id FROM Masters WHERE Id = @masterId AND UserId = @userId');

            if (masterCheck.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found or access denied'
                });
            }

            const result = await pool.request()
                .input('masterId', masterId)
                .query(`
                    SELECT 
                        Id AS id,
                        MasterId AS masterId,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(Amount AS DECIMAL(18,0)) AS amount,
                        Type AS type
                    FROM Details
                    WHERE MasterId = @masterId
                    ORDER BY Date ASC, Id ASC
                `);

            res.json({
                success: true,
                data: result.recordset
            });

        } catch (error) {
            console.error('Get details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get details',
                error: error.message
            });
        }
    }

    // Get single detail by ID
    async getById(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const detailId = parseInt(req.params.id);

            if (!detailId) {
                return res.status(400).json({
                    success: false,
                    message: 'Detail ID is required'
                });
            }

            const result = await pool.request()
                .input('detailId', detailId)
                .query(`
                    SELECT 
                        d.Id AS id,
                        d.MasterId AS masterId,
                        d.Description AS description,
                        CONVERT(VARCHAR(10), d.Date, 120) AS date,
                        CAST(d.Amount AS DECIMAL(18,0)) AS amount,
                        d.Type AS type
                    FROM Details d
                    INNER JOIN Masters m ON d.MasterId = m.Id
                    WHERE d.Id = @detailId AND m.UserId = @userId
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Detail not found or access denied'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0]
            });

        } catch (error) {
            console.error('Get detail error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get detail',
                error: error.message
            });
        }
    }

    // Get all details for a master (path param style - legacy)
    async getByMaster(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const masterId = parseInt(req.params.masterId);

            // Verify master belongs to user
            const masterCheck = await pool.request()
                .input('masterId', masterId)
                .input('userId', userId)
                .query('SELECT Id FROM Masters WHERE Id = @masterId AND UserId = @userId');

            if (masterCheck.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found or access denied'
                });
            }

            const result = await pool.request()
                .input('masterId', masterId)
                .query(`
                    SELECT 
                        Id AS id,
                        MasterId AS masterId,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(Amount AS DECIMAL(18,0)) AS amount,
                        Type AS type
                    FROM Details
                    WHERE MasterId = @masterId
                    ORDER BY Date ASC, Id ASC
                `);

            res.json({
                success: true,
                data: result.recordset
            });

        } catch (error) {
            console.error('Get details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get details',
                error: error.message
            });
        }
    }

    // Create new detail (body style - for frontend)
    async create(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const { masterId, description, date, amount, type } = req.body;

            if (!masterId || !description || !date || !amount || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'masterId, description, date, amount, and type are required'
                });
            }

            const masterIdInt = parseInt(masterId);

            if (type !== 'income' && type !== 'expense') {
                return res.status(400).json({
                    success: false,
                    message: 'Type must be income or expense'
                });
            }

            // Verify master belongs to user
            const masterCheck = await pool.request()
                .input('masterId', masterIdInt)
                .input('userId', userId)
                .query('SELECT Id FROM Masters WHERE Id = @masterId AND UserId = @userId');

            if (masterCheck.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found or access denied'
                });
            }

            const result = await pool.request()
                .input('masterId', masterIdInt)
                .input('description', description)
                .input('date', date)
                .input('amount', amount)
                .input('type', type)
                .query(`
                    INSERT INTO Details (MasterId, Description, Date, Amount, Type)
                    VALUES (@masterId, @description, @date, @amount, @type);
                    SELECT SCOPE_IDENTITY() AS DetailId;
                `);

            const detailId = result.recordset[0].DetailId;

            // Get the created detail
            const detailResult = await pool.request()
                .input('detailId', detailId)
                .query(`
                    SELECT 
                        Id AS id,
                        MasterId AS masterId,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(Amount AS DECIMAL(18,0)) AS amount,
                        Type AS type
                    FROM Details
                    WHERE Id = @detailId
                `);

            res.status(201).json({
                success: true,
                message: 'Detail created successfully',
                data: detailResult.recordset[0]
            });

        } catch (error) {
            console.error('Create detail error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create detail',
                error: error.message
            });
        }
    }

    // Create new detail (path param style - legacy)
    async createWithMaster(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const masterId = parseInt(req.params.masterId);
            const { description, date, amount, type } = req.body;

            if (!description || !date || !amount || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'Description, date, amount, and type are required'
                });
            }

            if (type !== 'income' && type !== 'expense') {
                return res.status(400).json({
                    success: false,
                    message: 'Type must be income or expense'
                });
            }

            // Verify master belongs to user
            const masterCheck = await pool.request()
                .input('masterId', masterId)
                .input('userId', userId)
                .query('SELECT Id FROM Masters WHERE Id = @masterId AND UserId = @userId');

            if (masterCheck.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found or access denied'
                });
            }

            const result = await pool.request()
                .input('masterId', masterId)
                .input('description', description)
                .input('date', date)
                .input('amount', amount)
                .input('type', type)
                .query(`
                    INSERT INTO Details (MasterId, Description, Date, Amount, Type)
                    VALUES (@masterId, @description, @date, @amount, @type);
                    SELECT SCOPE_IDENTITY() AS DetailId;
                `);

            const detailId = result.recordset[0].DetailId;

            // Get the created detail
            const detailResult = await pool.request()
                .input('detailId', detailId)
                .query(`
                    SELECT 
                        Id AS id,
                        MasterId AS masterId,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(Amount AS DECIMAL(18,0)) AS amount,
                        Type AS type
                    FROM Details
                    WHERE Id = @detailId
                `);

            res.status(201).json({
                success: true,
                message: 'Detail created successfully',
                data: detailResult.recordset[0]
            });

        } catch (error) {
            console.error('Create detail error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create detail',
                error: error.message
            });
        }
    }

    // Update detail
    async update(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const detailId = parseInt(req.params.id);
            const { masterId, description, date, amount, type } = req.body;

            if (!masterId || !description || !date || !amount || !type) {
                return res.status(400).json({
                    success: false,
                    message: 'masterId, description, date, amount, and type are required'
                });
            }

            const masterIdInt = parseInt(masterId);

            // Verify master belongs to user
            const masterCheck = await pool.request()
                .input('masterId', masterIdInt)
                .input('userId', userId)
                .query('SELECT Id FROM Masters WHERE Id = @masterId AND UserId = @userId');

            if (masterCheck.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found or access denied'
                });
            }

            const result = await pool.request()
                .input('detailId', detailId)
                .input('masterId', masterIdInt)
                .input('description', description)
                .input('date', date)
                .input('amount', amount)
                .input('type', type)
                .query(`
                    UPDATE Details
                    SET 
                        Description = @description,
                        Date = @date,
                        Amount = @amount,
                        Type = @type,
                        UpdatedAt = GETDATE()
                    WHERE Id = @detailId AND MasterId = @masterId;
                    SELECT @@ROWCOUNT AS AffectedRows;
                `);

            if (result.recordset[0].AffectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Detail not found or access denied'
                });
            }

            // Get updated detail
            const detailResult = await pool.request()
                .input('detailId', detailId)
                .query(`
                    SELECT 
                        Id AS id,
                        MasterId AS masterId,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(Amount AS DECIMAL(18,0)) AS amount,
                        Type AS type
                    FROM Details
                    WHERE Id = @detailId
                `);

            res.json({
                success: true,
                message: 'Detail updated successfully',
                data: detailResult.recordset[0]
            });

        } catch (error) {
            console.error('Update detail error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update detail',
                error: error.message
            });
        }
    }

    // Delete detail
    async delete(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const detailId = parseInt(req.params.id);
            const masterId = parseInt(req.query.masterId);

            if (!masterId) {
                return res.status(400).json({
                    success: false,
                    message: 'masterId query parameter is required'
                });
            }

            // Verify master belongs to user
            const masterCheck = await pool.request()
                .input('masterId', masterId)
                .input('userId', userId)
                .query('SELECT Id FROM Masters WHERE Id = @masterId AND UserId = @userId');

            if (masterCheck.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found or access denied'
                });
            }

            const result = await pool.request()
                .input('detailId', detailId)
                .input('masterId', masterId)
                .query(`
                    DELETE FROM Details
                    WHERE Id = @detailId AND MasterId = @masterId;
                    SELECT @@ROWCOUNT AS AffectedRows;
                `);

            if (result.recordset[0].AffectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Detail not found or access denied'
                });
            }

            res.json({
                success: true,
                message: 'Detail deleted successfully'
            });

        } catch (error) {
            console.error('Delete detail error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete detail',
                error: error.message
            });
        }
    }

    // Update detail (path param style - legacy)
    async updateWithMaster(req, res) {
        return this.update(req, res);
    }

    // Delete detail (path param style - legacy)
    async deleteWithMaster(req, res) {
        return this.delete(req, res);
    }
}

module.exports = new DetailController();
