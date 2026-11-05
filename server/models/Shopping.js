const sqlConnectionPool = require("../config/db");

function createItem(data) {
    const {
        group_id,
        item_name,
        quantity,
        added_by
    } = data;

    const sql = `
        INSERT INTO shopping_items
        (group_id, item_name, quantity, added_by)
        VALUES (?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
        sqlConnectionPool.query(
            sql,
            [group_id, item_name, quantity || 1, added_by],
            (err, result) => {
                if (err) return reject(err);

                resolve({
                    item_id: result.insertId,
                    message: "Shopping item added successfully"
                });
            }
        );
    });
}


function getGroupItems(groupId) {

    const sql = `
        SELECT
            s.item_id,
            s.group_id,
            s.item_name,
            s.quantity,
            s.added_by,
            u.name AS added_by_name,
            s.status,
            s.created_at
        FROM shopping_items s
        JOIN users u ON s.added_by = u.user_id
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
        SELECT
            s.item_id,
            s.group_id,
            s.item_name,
            s.quantity,
            s.added_by,
            u.name AS added_by_name,
            s.status,
            s.created_at
        FROM shopping_items s
        JOIN users u ON s.added_by = u.user_id
        WHERE s.item_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(sql, [itemId], (err, result) => {

            if (err) return reject(err);

            if (result.length === 0) {
                return resolve(null);
            }

            resolve(result[0]);
        });
    });
}


function updateItem(itemId, data) {

    const {
        item_name,
        quantity
    } = data;

    const sql = `
        UPDATE shopping_items
        SET item_name = ?, quantity = ?
        WHERE item_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(
            sql,
            [item_name, quantity, itemId],
            (err, result) => {

                if (err) return reject(err);

                if (result.affectedRows === 0) {
                    return resolve({
                        message: "Shopping item not found"
                    });
                }

                resolve({
                    message: "Shopping item updated successfully"
                });
            }
        );
    });
}


function updateStatus(itemId, status) {

    if (status !== "Needed" && status !== "Purchased") {
        return Promise.reject(
            new Error("Invalid status. Use Needed or Purchased")
        );
    }

    const sql = `
        UPDATE shopping_items
        SET status = ?
        WHERE item_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(
            sql,
            [status, itemId],
            (err, result) => {

                if (err) return reject(err);

                if (result.affectedRows === 0) {
                    return resolve({
                        message: "Shopping item not found"
                    });
                }

                resolve({
                    message: "Shopping item status updated successfully"
                });
            }
        );
    });
}

function deleteItem(itemId) {

    const sql = `
        DELETE FROM shopping_items
        WHERE item_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(sql, [itemId], (err, result) => {

            if (err) return reject(err);

            if (result.affectedRows === 0) {
                return resolve({
                    message: "Shopping item not found"
                });
            }

            resolve({
                message: "Shopping item deleted successfully"
            });
        });
    });
}



module.exports = {
    createItem,
    getGroupItems,
    findById,
    updateItem,
    updateStatus,
    deleteItem
};