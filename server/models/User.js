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
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function deleteAllUserTokens(userId) {
  const sql = `
    DELETE FROM user_tokens
    WHERE user_id = ?
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
function updateProfile(userId, name, phone) {
  const sql = `
    UPDATE users
    SET name = ?, phone = ?
    WHERE user_id = ?
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [name, phone, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function findPasswordById(userId) {
  const sql = `
    SELECT password
    FROM users
    WHERE user_id = ?
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result[0] || null);
    });
  });
}

function updatePassword(userId, hashedPassword) {
  const sql = `
    UPDATE users
    SET password = ?
    WHERE user_id = ?
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [hashedPassword, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function createPasswordReset(userId, tokenHash, expiresAt) {
  const sql = `
    INSERT INTO password_resets (user_id, token_hash, expires_at)
    VALUES (?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(
      sql,
      [userId, tokenHash, expiresAt],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
  });
}

function findPasswordReset(tokenHash) {
  const sql = `
    SELECT * FROM password_resets
    WHERE token_hash = ?
    AND expires_at > NOW()
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [tokenHash], (err, result) => {
      if (err) return reject(err);
      resolve(result[0] || null);
    });
  });
}

function deletePasswordReset(userId) {
  const sql = `
    DELETE FROM password_resets
    WHERE user_id = ?
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
module.exports = {
  createPasswordReset,
  findPasswordReset,
  deletePasswordReset,
  createUser,
  findByEmail,
  findById,
  saveToken,
  findToken,
  deleteToken,
  updateProfile,
  findPasswordById,
  updatePassword,
  deleteAllUserTokens,
};
