const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DB_URI,
  ssl: { rejectUnauthorized: false },
});
module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  }
};
