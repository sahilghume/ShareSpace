const sqlConnectionPool = require("../config/db");

function createChore(data) {
  const {
    group_id,
    chore_name,
    description,
    created_by,
    verifier_id,
    chore_type = "manual",
  } = data;

  const sql = `
    INSERT INTO chores
    (group_id, chore_name, description, created_by, verifier_id, chore_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(
      sql,
      [group_id, chore_name, description, created_by, verifier_id, chore_type],
      (err, result) => {
        if (err) return reject(err);
        resolve({ chore_id: result.insertId, ...data });
      },
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
  const fields = [];
  const values = [];

  if (data.chore_name !== undefined) {
    fields.push("chore_name = ?");
    values.push(data.chore_name);
  }

  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }

  if (data.is_active !== undefined) {
    fields.push("is_active = ?");
    values.push(data.is_active);
  }

  if (fields.length === 0) {
    return Promise.resolve({
      message: "No fields to update",
    });
  }

  const sql = `
        UPDATE chores
        SET ${fields.join(", ")}
        WHERE chore_id = ?
    `;

  values.push(choreId);

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, values, (err, result) => {
      if (err) return reject(err);

      if (result.affectedRows === 0) {
        return resolve({
          message: "Chore not found",
        });
      }

      resolve({
        message: "Chore updated successfully",
      });
    });
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
          message: "Chore not found",
        });
      }

      resolve({
        message: "Chore deactivated successfully",
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
      priority,
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
      priority,
    ];

    console.log("SQL values:", values);

    sqlConnectionPool.query(sql, values, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve({
        assignment_id: result.insertId,
        message: "Chore assigned successfully",
      });
    });
  });
}

function getDailyAssignments(groupId, date) {
  let sql = `
    SELECT
      dca.*,
      c.chore_name AS title,
      c.description,
      c.created_by,
      creator.name AS created_by_name,
      c.verifier_id,
      verifier.name AS verifier_name,
      assigned.name AS assigned_to_name,
      approved.name AS approved_by_name
    FROM daily_chore_assignments dca
    JOIN chores c ON dca.chore_id = c.chore_id
    JOIN users assigned ON dca.assigned_to = assigned.user_id
    JOIN users creator ON c.created_by = creator.user_id
    LEFT JOIN users verifier ON c.verifier_id = verifier.user_id
    LEFT JOIN users approved ON dca.verified_by = approved.user_id
    WHERE dca.group_id = ?
      AND c.is_active = 1
  `;

  const values = [groupId];

  if (date) {
    sql += " AND dca.assigned_date = ?";
    values.push(date);
  }

  sql += " ORDER BY dca.assignment_id DESC";

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function findAssignment(assignmentId) {
  const sql = `
    SELECT
      dca.*,
      c.chore_name,
      c.created_by,
      c.verifier_id,
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
      new Error("Invalid status. Use Pending or Completed"),
    );
  }

  const sql = `
        UPDATE daily_chore_assignments
        SET status = ?
        WHERE assignment_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [status, assignmentId], (err, result) => {
      if (err) return reject(err);

      if (result.affectedRows === 0) {
        return resolve({
          message: "Assignment not found",
        });
      }

      resolve({
        message: "Assignment status updated successfully",
      });
    });
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

    sqlConnectionPool.query(sql, [assignmentId, userId], (err, result) => {
      if (err) {
        return reject(err);
      }

      if (result.affectedRows === 0) {
        return reject(
          new Error("Invalid assignment or unauthorized submission"),
        );
      }

      resolve({
        message: "Chore submitted for verification successfully",
      });
    });
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

    sqlConnectionPool.query(sql, [userId, userId], (err, result) => {
      if (err) return reject(err);

      resolve(result);
    });
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
            new Error("Invalid assignment or unauthorized verification"),
          );
        }

        resolve({
          message: "Chore approved successfully",
        });
      },
    );
  });
}
function resetRotationForGroup(groupId) {
  const sql = `
    INSERT INTO chore_rotation_state (chore_id, next_user_id)
    SELECT
      c.chore_id,
      (
        SELECT gm.user_id
        FROM group_members gm
        WHERE gm.group_id = c.group_id
        ORDER BY gm.id ASC
        LIMIT 1
      )
    FROM chores c
    WHERE c.group_id = ?
      AND c.chore_type = 'rotation'
      AND c.is_active = 1
    ON DUPLICATE KEY UPDATE
      next_user_id = VALUES(next_user_id)
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function generateDailyRotationAssignments(assignedDate) {
  return new Promise((resolve, reject) => {
    sqlConnectionPool.getConnection((err, connection) => {
      if (err) return reject(err);

      connection.beginTransaction(async (err) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        const query = (sql, params = []) =>
          new Promise((res, rej) => {
            connection.query(sql, params, (error, result) => {
              if (error) return rej(error);
              res(result);
            });
          });

        try {
          const groups = await query(`
            SELECT DISTINCT group_id
            FROM chores
            WHERE chore_type = 'rotation'
              AND is_active = 1
          `);

          let createdCount = 0;

          for (const group of groups) {
            const groupId = group.group_id;

            const members = await query(
              `SELECT user_id
               FROM group_members
               WHERE group_id = ?
               ORDER BY id ASC`,
              [groupId],
            );

            if (members.length === 0) continue;

            await query(
              `INSERT IGNORE INTO group_chore_rotation_state
               (group_id, next_member_offset)
               VALUES (?, 0)`,
              [groupId],
            );

            const [state] = await query(
              `SELECT next_member_offset
               FROM group_chore_rotation_state
               WHERE group_id = ?
               FOR UPDATE`,
              [groupId],
            );

            const chores = await query(
              `SELECT chore_id
               FROM chores
               WHERE group_id = ?
                 AND chore_type = 'rotation'
                 AND is_active = 1
               ORDER BY chore_id ASC`,
              [groupId],
            );

            const existingRuns = await query(
              `SELECT r.chore_id
               FROM chore_rotation_runs r
               JOIN chores c ON c.chore_id = r.chore_id
               WHERE c.group_id = ?
                 AND r.assigned_date = ?`,
              [groupId, assignedDate],
            );

            const completedChores = new Set(
              existingRuns.map((run) => run.chore_id),
            );

            if (completedChores.size >= chores.length) continue;

            const offset = state.next_member_offset % members.length;

            for (let i = 0; i < chores.length; i++) {
              const chore = chores[i];

              if (completedChores.has(chore.chore_id)) continue;

              const memberIndex = (i + offset) % members.length;
              const assignedUser = members[memberIndex].user_id;

              const assignment = await query(
                `INSERT INTO daily_chore_assignments
                 (chore_id, group_id, assigned_to, assigned_date,
                  due_date, priority)
                 VALUES (?, ?, ?, ?, ?, 'Medium')`,
                [
                  chore.chore_id,
                  groupId,
                  assignedUser,
                  assignedDate,
                  assignedDate,
                ],
              );

              await query(
                `INSERT INTO chore_rotation_runs
                 (chore_id, assigned_date, assignment_id)
                 VALUES (?, ?, ?)`,
                [chore.chore_id, assignedDate, assignment.insertId],
              );

              createdCount++;
            }

            await query(
              `UPDATE group_chore_rotation_state
               SET next_member_offset = ?,
                   last_assigned_date = ?
               WHERE group_id = ?`,
              [(offset + 1) % members.length, assignedDate, groupId],
            );
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                reject(err);
              });
            }

            connection.release();
            resolve(createdCount);
          });
        } catch (error) {
          connection.rollback(() => {
            connection.release();
            reject(error);
          });
        }
      });
    });
  });
}

function resetGroupChoreRotation(groupId) {
  const sql = `
    INSERT INTO group_chore_rotation_state
      (group_id, next_member_offset, last_assigned_date)
    VALUES (?, 0, NULL)
    ON DUPLICATE KEY UPDATE
      next_member_offset = 0,
      last_assigned_date = NULL
  `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
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
  approveChore,
  resetRotationForGroup,
  generateDailyRotationAssignments,
  resetGroupChoreRotation,
};
