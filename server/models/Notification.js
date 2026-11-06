const sqlConnectionPool = require("../config/db");

function createNotification(data) {
    return new Promise((resolve, reject) => {

        const { user_id, assignment_id, title, message } = data;

        const sql = `
            INSERT INTO notifications
            (user_id, assignment_id, title, message)
            VALUES (?, ?, ?, ?)
        `;

        sqlConnectionPool.query(
            sql,
            [user_id, assignment_id, title, message],
            (err, result) => {

                if (err) return reject(err);

                resolve({
                    notification_id: result.insertId,
                    message: "Notification created successfully"
                });
            }
        );
    });
}


function getUserNotifications(userId) {
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                notification_id,
                user_id,
                assignment_id,
                title,
                message,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;

        sqlConnectionPool.query(sql, [userId], (err, result) => {

            if (err) return reject(err);

            resolve(result);
        });
    });
}


function markAsRead(notificationId, userId) {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = ?
            AND user_id = ?
        `;

        sqlConnectionPool.query(
            sql,
            [notificationId, userId],
            (err, result) => {

                if (err) return reject(err);

                if (result.affectedRows === 0) {
                    return reject(
                        new Error("Notification not found or unauthorized")
                    );
                }

                resolve({
                    message: "Notification marked as read"
                });
            }
        );
    });
}


function deleteNotification(notificationId, userId) {

    return new Promise((resolve, reject) => {

        const sql = `
            DELETE FROM notifications
            WHERE notification_id = ?
            AND user_id = ?
        `;

        sqlConnectionPool.query(
            sql,
            [notificationId, userId],
            (err, result) => {

                if (err) return reject(err);

                if (result.affectedRows === 0) {
                    return reject(
                        new Error("Notification not found or unauthorized")
                    );
                }

                resolve({
                    message: "Notification deleted successfully"
                });
            }
        );
    });
}

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    deleteNotification
};