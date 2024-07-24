const mysql = require('mysql2/promise');

class Database {
    constructor() {
        this.connect();
    }

    async connect() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: 3307,
            connectionLimit: 100,
        });
        console.log("Create pool connection is successful!");
    }

    async query(sql, values) {
        const [rows, fields] = await this.pool.query(sql, values);
        return rows;
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = new Database();