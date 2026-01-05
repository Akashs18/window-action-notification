const { Pool } = require("pg");

const pool = new Pool({
  user: "firstdemo_examle_user",        // your PG username
  host: "dpg-d50evbfgi27c73aje1pg-a.oregon-postgres.render.com",
  database: "firstdemo_examle", // your database
  password: "6LBDu09slQHqq3r0GcwbY1nPera4H5Kk",    // your PG password
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => {
    console.error("❌ PostgreSQL Connection Failed:", err.message);
    process.exit(1);
  });

module.exports = pool;
