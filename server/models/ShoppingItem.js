const sqlConnectionPool = require("../config/db");

function createItem(data) {
  const { group_id, item_name, quantity, added_by, assigned_to, verifier_id } =
    data;

  const sql = `
    INSERT INTO shopping_items
    (group_id, item_name, quantity, added_by, assigned_to, verifier_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(
      sql,
      [
        group_id,
        item_name,
        quantity ?? 1,
        added_by,
        assigned_to,
        verifier_id || null,
      ],
      (err, result) => {
        if (err) return reject(err);

        resolve({
          item_id: result.insertId,
          message: "Shopping item added successfully",
        });
      },
    );
  });
}

function getGroupItems(groupId) {
  const sql = `
    SELECT
      s.*,
      creator.name AS created_by_name,
      assigned.name AS assigned_to_name,
      verifier.name AS verifier_name,
      approver.name AS approved_by_name
    FROM shopping_items s
    JOIN users creator ON s.added_by = creator.user_id
    LEFT JOIN users assigned ON s.assigned_to = assigned.user_id
    LEFT JOIN users verifier ON s.verifier_id = verifier.user_id
    LEFT JOIN users approver ON s.approved_by = approver.user_id
    WHERE s.group_id = ?
    ORDER BY s.item_id DESC
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function findById(itemId) {
  const sql = `
    SELECT *
    FROM shopping_items
    WHERE item_id = ?
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [itemId], (err, result) => {
      if (err) return reject(err);
      resolve(result.length ? result[0] : null);
    });
  });
}

function updateItem(itemId, data) {
  const fields = [];
  const values = [];

  if (data.item_name !== undefined) {
    fields.push("item_name = ?");
    values.push(data.item_name);
  }

  if (data.quantity !== undefined) {
    fields.push("quantity = ?");
    values.push(data.quantity);
  }

  if (fields.length === 0) {
    return Promise.resolve({
      message: "No fields to update",
    });
  }

  const sql = `
    UPDATE shopping_items
    SET ${fields.join(", ")}
    WHERE item_id = ?
  `;

  values.push(itemId);

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, values, (err, result) => {
      if (err) return reject(err);

      if (result.affectedRows === 0) {
        return resolve({ message: "Shopping item not found" });
      }

      resolve({
        message: "Shopping item updated successfully",
      });
    });
  });
}

function submitForVerification(itemId, userId) {
  const sql = `
    UPDATE shopping_items
    SET status = 'Awaiting Verification',
        submitted_at = NOW()
    WHERE item_id = ?
      AND assigned_to = ?
      AND status = 'Pending'
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [itemId, userId], (err, result) => {
      if (err) return reject(err);

      if (result.affectedRows === 0) {
        return reject(new Error("Invalid item or unauthorized submission"));
      }

      resolve({
        message: "Item submitted for verification successfully",
      });
    });
  });
}

function approveItem(itemId, userId) {
  const sql = `
    UPDATE shopping_items
    SET status = 'Completed',
        approved_by = ?,
        approved_at = NOW()
    WHERE item_id = ?
      AND status = 'Awaiting Verification'
      AND (added_by = ? OR verifier_id = ?)
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(
      sql,
      [userId, itemId, userId, userId],
      (err, result) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) {
          return reject(new Error("Invalid item or unauthorized verification"));
        }

        resolve({
          message: "Shopping item approved successfully",
        });
      },
    );
  });
}

function deleteItem(itemId, userId) {
  const sql = `
    DELETE FROM shopping_items
    WHERE item_id = ?
      AND added_by = ?
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [itemId, userId], (err, result) => {
      if (err) return reject(err);

      if (result.affectedRows === 0) {
        return reject(new Error("Item not found or unauthorized deletion"));
      }

      resolve({
        message: "Shopping item deleted successfully",
      });
    });
  });
}

module.exports = {
  createItem,
  getGroupItems,
  findById,
  updateItem,
  submitForVerification,
  approveItem,
  deleteItem,
};
