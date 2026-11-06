const sqlConnectionPool = require("../config/db");

function createNotice(data) {
  const { group_id, posted_by, title, message } = data;

  const sql = `
        INSERT INTO group_notices
        (group_id, posted_by, title, message)
        VALUES (?, ?, ?, ?)
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(
      sql,
      [group_id, posted_by, title, message],
      (err, result) => {
        if (err) return reject(err);

        resolve({
          notice_id: result.insertId,
          message: "Notice created successfully",
        });
      },
    );
  });
}

function getGroupNotices(groupId) {
  const sql = `
        SELECT
            n.notice_id,
            n.group_id,
            n.posted_by,
            u.name AS posted_by_name,
            n.title,
            n.message,
            n.created_at
        FROM group_notices n
        JOIN users u ON n.posted_by = u.user_id
        WHERE n.group_id = ?
        ORDER BY n.created_at DESC
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId], (err, result) => {
      if (err) return reject(err);

      resolve(result);
    });
  });
}

function findById(noticeId) {
  const sql = `
        SELECT
            n.notice_id,
            n.group_id,
            n.posted_by,
            u.name AS posted_by_name,
            n.title,
            n.message,
            n.created_at
        FROM group_notices n
        JOIN users u ON n.posted_by = u.user_id
        WHERE n.notice_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [noticeId], (err, result) => {
      if (err) return reject(err);

      if (result.length === 0) {
        return resolve(null);
      }

      resolve(result[0]);
    });
  });
}

function updateNotice(noticeId, data) {
  const fields = [];
  const values = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }

  if (data.message !== undefined) {
    fields.push("message = ?");
    values.push(data.message);
  }

  if (fields.length === 0) {
    return Promise.resolve({
      message: "No fields to update",
    });
  }

  const sql = `
        UPDATE group_notices
        SET ${fields.join(", ")}
        WHERE notice_id = ?
    `;

  values.push(noticeId);

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, values, (err) => {
      if (err) return reject(err);

      resolve({
        message: "Notice updated successfully",
      });
    });
  });
}

function deleteNotice(noticeId) {
  const sql = `
        DELETE FROM group_notices
        WHERE notice_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [noticeId], (err, result) => {
      if (err) return reject(err);

      if (result.affectedRows === 0) {
        return resolve({
          message: "Notice not found",
        });
      }

      resolve({
        message: "Notice deleted successfully",
      });
    });
  });
}

module.exports = {
  createNotice,
  getGroupNotices,
  findById,
  updateNotice,
  deleteNotice,
};
