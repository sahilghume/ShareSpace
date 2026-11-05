const sqlConnectionPool = require("../config/db");
const bcrypt = require("bcryptjs");

async function createUser(userData) {
  const { name, email, password, phone } = userData;

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
        INSERT INTO users (name, email, password, phone)
        VALUES (?, ?, ?, ?)
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(
      sql,
      [name, email, hashedPassword, phone],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
}
function findByEmail(email) {
  const sql = `
        SELECT * FROM users
        WHERE email = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [email], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0] || null);
      }
    });
  });
}

function findById(userId) {
  const sql = `
        SELECT user_id, name, email, phone, created_at
        FROM users
        WHERE user_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [userId], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0] || null);
      }
    });
  });
}

function saveToken(userId, jti, expiresAt) {
  const sql = `
        INSERT INTO user_tokens (user_id, jti, expires_at)
        VALUES (?, ?, ?)
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [userId, jti, expiresAt], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function findToken(jti) {
  const sql = `
        SELECT * FROM user_tokens
        WHERE jti = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [jti], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]);
      }
    });
  });
}

function deleteToken(jti) {
  const sql = `
        DELETE FROM user_tokens
        WHERE jti = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [jti], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
module.exports = {
  createUser,
  findByEmail,
  findById,
  saveToken,
  findToken,
  deleteToken,
};
