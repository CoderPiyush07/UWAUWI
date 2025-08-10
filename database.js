const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor(dbPath = './database.db') {
    this.dbPath = dbPath;
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  initTables() {
    const userTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        github_id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        email TEXT,
        avatar_url TEXT,
        access_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(userTableSQL, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready');
      }
    });
  }

  // Create or update user
  upsertUser(userData) {
    return new Promise((resolve, reject) => {
      const { githubId, username, email, avatarUrl, accessToken } = userData;
      
      const sql = `
        INSERT INTO users (github_id, username, email, avatar_url, access_token, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(github_id) DO UPDATE SET
          username = excluded.username,
          email = excluded.email,
          avatar_url = excluded.avatar_url,
          access_token = excluded.access_token,
          updated_at = CURRENT_TIMESTAMP
      `;

      this.db.run(sql, [githubId, username, email, avatarUrl, accessToken], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, githubId });
        }
      });
    });
  }

  // Find user by GitHub ID
  findUserByGithubId(githubId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE github_id = ?';
      
      this.db.get(sql, [githubId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find user by ID
  findUserById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;