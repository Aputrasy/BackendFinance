const { getPool } = require('../config/database');

class ViewController {
    // Get master by ID (public - no auth required)
    async getMasterById(req, res) {
        try {
            const pool = await getPool();
            const masterId = parseInt(req.params.id);

            if (!masterId) {
                return res.status(400).json({
                    success: false,
                    message: 'Master ID is required'
                });
            }

            const result = await pool.request()
                .input('masterId', masterId)
                .query(`
                    SELECT 
                        Id AS id,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(TotalIncome AS DECIMAL(18,0)) AS totalIncome,
                        CAST(TotalExpense AS DECIMAL(18,0)) AS totalExpense
                    FROM Masters
                    WHERE Id = @masterId
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0]
            });

        } catch (error) {
            console.error('View get master error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get master',
                error: error.message
            });
        }
    }

    // Get details by masterId (public - no auth required)
    async getDetailsByMaster(req, res) {
        try {
            const pool = await getPool();
            const masterId = parseInt(req.query.masterId);

            if (!masterId) {
                return res.status(400).json({
                    success: false,
                    message: 'masterId query parameter is required'
                });
            }

            // Verify master exists (without user check)
            const masterCheck = await pool.request()
                .input('masterId', masterId)
                .query('SELECT Id FROM Masters WHERE Id = @masterId');

            if (masterCheck.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found'
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
            console.error('View get details error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get details',
                error: error.message
            });
        }
    }
}

module.exports = new ViewController();
