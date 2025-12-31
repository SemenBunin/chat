const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chat.db');

db.run(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  text TEXT,
  file TEXT,
  time DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

module.exports = db;
