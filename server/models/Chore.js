const sqlConnectionPool = require("../config/db");

function createChore(data) {
    return new Promise((resolve, reject) => {

        const {
            group_id,
            chore_name,
            description,
            created_by,
            verifier_id
        } = data;

        const sql = `
            INSERT INTO chores
            (group_id, chore_name, description, created_by, verifier_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        sqlConnectionPool.query(
            sql,
            [group_id, chore_name, description, created_by, verifier_id || null],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                resolve({
                    chore_id: result.insertId,
                    message: "Chore created successfully"
                });
            }
        );
    });
}

function findById(choreId) {

    const sql = `
        SELECT *
        FROM chores
        WHERE chore_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(sql, [choreId], (err, result) => {

            if (err) return reject(err);

            if (result.length === 0) {
                return resolve(null);
            }

            resolve(result[0]);
        });
    });
}

function getGroupChores(groupId) {

    const sql = `
        SELECT *
        FROM chores
        WHERE group_id = ?
        ORDER BY chore_id DESC
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(sql, [groupId], (err, result) => {

            if (err) return reject(err);

            resolve(result);
        });
    });
}

function updateChore(choreId, data) {

    const { chore_name, description, is_active } = data;

    const sql = `
        UPDATE chores
        SET chore_name = ?,
            description = ?,
            is_active = ?
        WHERE chore_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(
            sql,
            [chore_name, description, is_active, choreId],
            (err, result) => {

                if (err) return reject(err);

                if (result.affectedRows === 0) {
                    return resolve({
                        message: "Chore not found"
                    });
                }

                resolve({
                    message: "Chore updated successfully"
                });
            }
        );
    });
}

function deleteChore(choreId) {

    const sql = `
        UPDATE chores
        SET is_active = 0
        WHERE chore_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(sql, [choreId], (err, result) => {

            if (err) return reject(err);

            if (result.affectedRows === 0) {
                return resolve({
                    message: "Chore not found"
                });
            }

            resolve({
                message: "Chore deactivated successfully"
            });
        });
    });
}


function createAssignment(data) {

    console.log("createAssignment called");
    console.log("Received data:", data);

    return new Promise((resolve, reject) => {

        const {
            chore_id,
            group_id,
            assigned_to,
            assigned_date,
            due_date,
            priority
        } = data;

        console.log("Due date:", due_date);
        console.log("Priority:", priority);

        const sql = `
            INSERT INTO daily_chore_assignments
            (chore_id, group_id, assigned_to, assigned_date, due_date, priority)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [
            chore_id,
            group_id,
            assigned_to,
            assigned_date,
            due_date,
            priority
        ];

        console.log("SQL values:", values);

        sqlConnectionPool.query(sql, values, (err, result) => {

            if (err) {
                return reject(err);
            }

            resolve({
                assignment_id: result.insertId,
                message: "Chore assigned successfully"
            });
        });
    });
}

function getDailyAssignments(groupId, date) {

    const sql = `
        SELECT
            dca.assignment_id,
            dca.chore_id,
            c.chore_name,
            dca.group_id,
            dca.assigned_to,
            u.name AS assigned_to_name,
            dca.assigned_date,
            dca.status
        FROM daily_chore_assignments dca
        JOIN chores c ON dca.chore_id = c.chore_id
        JOIN users u ON dca.assigned_to = u.user_id
        WHERE dca.group_id = ?
        AND dca.assigned_date = ?
        ORDER BY dca.assignment_id
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(
            sql,
            [groupId, date],
            (err, result) => {

                if (err) return reject(err);

                resolve(result);
            }
        );
    });
}



function getDailyAssignments(groupId, date) {

    const sql = `
        SELECT
            dca.assignment_id,
            dca.chore_id,
            c.chore_name,
            dca.group_id,
            dca.assigned_to,
            u.name AS assigned_to_name,
            dca.assigned_date,
            dca.status
        FROM daily_chore_assignments dca
        JOIN chores c ON dca.chore_id = c.chore_id
        JOIN users u ON dca.assigned_to = u.user_id
        WHERE dca.group_id = ?
        AND dca.assigned_date = ?
        ORDER BY dca.assignment_id
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(
            sql,
            [groupId, date],
            (err, result) => {

                if (err) return reject(err);

                resolve(result);
            }
        );
    });
}


function findAssignment(assignmentId) {

    const sql = `
        SELECT
            dca.*,
            c.chore_name,
            u.name AS assigned_to_name
        FROM daily_chore_assignments dca
        JOIN chores c ON dca.chore_id = c.chore_id
        JOIN users u ON dca.assigned_to = u.user_id
        WHERE dca.assignment_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(sql, [assignmentId], (err, result) => {

            if (err) return reject(err);

            if (result.length === 0) {
                return resolve(null);
            }

            resolve(result[0]);
        });
    });
}





function updateAssignmentStatus(assignmentId, status) {

    if (!["Pending", "Completed"].includes(status)) {
        return Promise.reject(
            new Error("Invalid status. Use Pending or Completed")
        );
    }

    const sql = `
        UPDATE daily_chore_assignments
        SET status = ?
        WHERE assignment_id = ?
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(
            sql,
            [status, assignmentId],
            (err, result) => {

                if (err) return reject(err);

                if (result.affectedRows === 0) {
                    return resolve({
                        message: "Assignment not found"
                    });
                }

                resolve({
                    message: "Assignment status updated successfully"
                });
            }
        );
    });
}

function submitForVerification(assignmentId, userId) {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE daily_chore_assignments
            SET status = 'Awaiting Verification',
                submitted_at = NOW()
            WHERE assignment_id = ?
            AND assigned_to = ?
            AND status = 'Pending'
        `;

        sqlConnectionPool.query(
            sql,
            [assignmentId, userId],
            (err, result) => {

                if (err) {
                    return reject(err);
                }

                if (result.affectedRows === 0) {
                    return reject(
                        new Error("Invalid assignment or unauthorized submission")
                    );
                }

                resolve({
                    message: "Chore submitted for verification successfully"
                });
            }
        );
    });
}


function getPendingVerifications(userId) {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                da.assignment_id,
                da.chore_id,
                da.group_id,
                da.assigned_to,
                da.assigned_date,
                da.due_date,
                da.priority,
                da.status,
                da.submitted_at,
                c.chore_name,
                c.created_by,
                c.verifier_id,
                u.name AS assigned_to_name

            FROM daily_chore_assignments da

            JOIN chores c
                ON da.chore_id = c.chore_id

            JOIN users u
                ON da.assigned_to = u.user_id

            WHERE da.status = 'Awaiting Verification'
            AND (
                c.created_by = ?
                OR c.verifier_id = ?
            )

            ORDER BY da.submitted_at DESC
        `;

        sqlConnectionPool.query(
            sql,
            [userId, userId],
            (err, result) => {

                if (err) return reject(err);

                resolve(result);
            }
        );
    });
}


function approveChore(assignmentId, verifierId) {

    return new Promise((resolve, reject) => {

        const sql = `
            UPDATE daily_chore_assignments da

            JOIN chores c
                ON da.chore_id = c.chore_id

            SET
                da.status = 'Completed',
                da.verified_by = ?,
                da.verified_at = NOW()

            WHERE da.assignment_id = ?
            AND da.status = 'Awaiting Verification'
            AND (
                c.created_by = ?
                OR c.verifier_id = ?
            )
        `;

        sqlConnectionPool.query(
            sql,
            [verifierId, assignmentId, verifierId, verifierId],
            (err, result) => {

                if (err) return reject(err);

                if (result.affectedRows === 0) {
                    return reject(
                        new Error(
                            "Invalid assignment or unauthorized verification"
                        )
                    );
                }

                resolve({
                    message: "Chore approved successfully"
                });
            }
        );
    });
}

module.exports = {
    createChore,
    findById,
    getGroupChores,
    updateChore,
    deleteChore,
    createAssignment,
    getDailyAssignments,
    findAssignment,
    updateAssignmentStatus,
    submitForVerification,
    getPendingVerifications,
    approveChore
}