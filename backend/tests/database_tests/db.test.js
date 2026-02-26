const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

describe("Database tests", () => {
  let connection;

  beforeAll(async () => {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

  });

  afterAll(async () => {
    await connection.end();
  });

  test("TC1 - Verify database struct", async () => {
    const sqlPath = path.join(__dirname, "../../../scripts/db_view_structure.sql");
    const query = fs.readFileSync(sqlPath, "utf-8");
    const [result] = await connection.query(query);

    expect(result).toMatchSnapshot();
  });
});