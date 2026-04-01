const sql = require('mssql');
require('dotenv').config();

// Helper function to properly handle password with special characters
function getPassword() {
    const password = process.env.DB_PASSWORD || '#Syukur12345';
    return password;
}

const config = {
    server: process.env.DB_SERVER || 'sql.bsite.net\\MSSQL2016',
    database: process.env.DB_NAME || 'projectsra_',
    user: process.env.DB_USER || 'projectsra_',
    password: getPassword(),
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 30000, // 30 seconds connection timeout
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000
    },
    // Add authentication mode for SQL Server
    authentication: {
        type: 'default'
    }
};

let pool = null;

async function connectDB() {
    try {
        if (!pool) {
            pool = await new sql.ConnectionPool(config).connect();
            console.log('Connected to SQL Server successfully!');
            
            pool.on('error', err => {
                console.error('SQL Pool Error:', err);
                pool = null;
            });
        }
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

async function getPool() {
    if (!pool) {
        await connectDB();
    }
    return pool;
}

async function closeDB() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            console.log('Database connection closed.');
        }
    } catch (err) {
        console.error('Error closing database:', err);
    }
}

module.exports = {
    sql,
    connectDB,
    getPool,
    closeDB
};
