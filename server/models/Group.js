const sqlConnectionPool = require("../config/db");

function createGroupWithAdmin(data) {
  const { group_name, group_code, created_by } = data;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        const groupSql = `
                    INSERT INTO groupscreated
                    (group_name, group_code, created_by)
                    VALUES (?, ?, ?)
                `;

        connection.query(
          groupSql,
          [group_name, group_code, created_by],
          (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                reject(err);
              });
            }

            const groupId = result.insertId;

            const memberSql = `
                            INSERT INTO group_members
                            (group_id, user_id, role)
                            VALUES (?, ?, 'admin')
                        `;

            connection.query(memberSql, [groupId, created_by], (err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  reject(err);
                });
              }

              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    reject(err);
                  });
                }

                connection.release();

                resolve({
                  group_id: groupId,
                  message: "Group created successfully",
                });
              });
            });
          },
        );
      });
    });
  });
}

function findByCode(groupCode) {
  const sql = `
        SELECT *
        FROM groupscreated
        WHERE group_code = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupCode], (err, result) => {
      if (err) {
        return reject(err);
      }

      if (result.length === 0) {
        return resolve(null);
      }

      resolve(result[0]);
    });
  });
}

function findById(groupId) {
  const sql = `
        SELECT *
        FROM groupscreated
        WHERE group_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId], (err, result) => {
      if (err) {
        return reject(err);
      }

      if (result.length === 0) {
        return resolve(null);
      }

      resolve(result[0]);
    });
  });
}

function findMember(groupId, userId) {
  const sql = `
        SELECT *
        FROM group_members
        WHERE group_id = ? AND user_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId, userId], (err, result) => {
      if (err) {
        return reject(err);
      }

      if (result.length === 0) {
        return resolve(null);
      }

      resolve(result[0]);
    });
  });
}

function addMember(data) {
  const { group_id, user_id, role } = data;

  const sql = `
        INSERT INTO group_members
        (group_id, user_id, role)
        VALUES (?, ?, ?)
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [group_id, user_id, role], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

function getUserGroups(userId) {
  const sql = `
        SELECT 
            g.group_id,
            g.group_name,
            g.group_code,
            gm.role,
            gm.joined_at
        FROM groupscreated g
        JOIN group_members gm
        ON g.group_id = gm.group_id
        WHERE gm.user_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [userId], (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function getMembers(groupId) {
  const sql = `
        SELECT u.user_id, u.name, u.email, u.phone,
               gm.role, gm.joined_at
        FROM group_members gm
        JOIN users u ON gm.user_id = u.user_id
        WHERE gm.group_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId], (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

function removeMember(groupId, userId) {
  const sql = `
        DELETE FROM group_members
        WHERE group_id = ? AND user_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId, userId], (err, result) => {
      if (err) {
        return reject(err);
      }

      if (result.affectedRows === 0) {
        return resolve({
          message: "Member not found in this group",
        });
      }

      resolve({
        message: "Member removed successfully",
      });
    });
  });
}

function leaveGroup(groupId, userId) {
  const sql = `
        DELETE FROM group_members
        WHERE group_id = ? AND user_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [groupId, userId], (err, result) => {
      if (err) {
        return reject(err);
      }

      if (result.affectedRows === 0) {
        return resolve({
          message: "You are not a member of this group",
        });
      }

      resolve({
        message: "You have left the group successfully",
      });
    });
  });
}

function transferAdminAndLeave(groupId, currentAdminId, newAdminId) {
  return new Promise((resolve, reject) => {
    sqlConnectionPool.getConnection((err, connection) => {
      if (err) return reject(err);

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        const rollback = (error) => {
          connection.rollback(() => {
            connection.release();
            reject(error);
          });
        };

        const sql = `
          SELECT user_id, role
          FROM group_members
          WHERE group_id = ?
          FOR UPDATE
        `;

        connection.query(sql, [groupId], (err, members) => {
          if (err) return rollback(err);

          const currentAdmin = members.find(
            (member) => Number(member.user_id) === Number(currentAdminId),
          );

          const newAdmin = members.find(
            (member) => Number(member.user_id) === Number(newAdminId),
          );

          if (!currentAdmin || currentAdmin.role !== "admin") {
            return rollback(new Error("You are not the group admin"));
          }

          if (!newAdmin || Number(newAdminId) === Number(currentAdminId)) {
            return rollback(new Error("Invalid member selected"));
          }

          connection.query(
            `UPDATE group_members
             SET role = 'admin'
             WHERE group_id = ? AND user_id = ?`,
            [groupId, newAdminId],
            (err) => {
              if (err) return rollback(err);

              connection.query(
                `DELETE FROM group_members
                 WHERE group_id = ? AND user_id = ?`,
                [groupId, currentAdminId],
                (err, result) => {
                  if (err) return rollback(err);

                  if (result.affectedRows === 0) {
                    return rollback(new Error("Unable to leave group"));
                  }

                  connection.commit((err) => {
                    if (err) return rollback(err);

                    connection.release();
                    resolve({
                      message:
                        "Admin rights transferred and you left the group",
                    });
                  });
                },
              );
            },
          );
        });
      });
    });
  });
}

function deleteGroup(groupId, adminId) {
  return new Promise((resolve, reject) => {
    sqlConnectionPool.getConnection((err, connection) => {
      if (err) return reject(err);

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        const rollback = (error) => {
          connection.rollback(() => {
            connection.release();
            reject(error);
          });
        };

        const checkAdminSql = `
          SELECT role
          FROM group_members
          WHERE group_id = ? AND user_id = ?
          FOR UPDATE
        `;

        connection.query(checkAdminSql, [groupId, adminId], (err, result) => {
          if (err) return rollback(err);

          if (result.length === 0 || result[0].role !== "admin") {
            return rollback(
              new Error("Only the group admin can delete this group"),
            );
          }

          const deleteQueries = [
            {
              sql: `
                  DELETE n FROM notifications n
                  JOIN daily_chore_assignments d
                  ON n.assignment_id = d.assignment_id
                  WHERE d.group_id = ?
                `,
            },
            {
              sql: `
                  DELETE FROM daily_chore_assignments
                  WHERE group_id = ?
                `,
            },
            {
              sql: `
                  DELETE es FROM expense_splits es
                  JOIN expenses e ON es.expense_id = e.expense_id
                  WHERE e.group_id = ?
                `,
            },
            {
              sql: `DELETE FROM expenses WHERE group_id = ?`,
            },
            {
              sql: `DELETE FROM chores WHERE group_id = ?`,
            },
            {
              sql: `DELETE FROM group_notices WHERE group_id = ?`,
            },
            {
              sql: `DELETE FROM shopping_items WHERE group_id = ?`,
            },
            {
              sql: `DELETE FROM group_members WHERE group_id = ?`,
            },
            {
              sql: `DELETE FROM groupscreated WHERE group_id = ?`,
            },
          ];

          const executeDelete = (index) => {
            if (index === deleteQueries.length) {
              return connection.commit((err) => {
                if (err) return rollback(err);

                connection.release();
                resolve({
                  message: "Group and all associated data deleted successfully",
                });
              });
            }

            connection.query(deleteQueries[index].sql, [groupId], (err) => {
              if (err) return rollback(err);
              executeDelete(index + 1);
            });
          };

          executeDelete(0);
        });
      });
    });
  });
}
module.exports = {
  createGroupWithAdmin,
  findByCode,
  findById,
  findMember,
  getUserGroups,
  getMembers,
  removeMember,
  leaveGroup,
  addMember,
  transferAdminAndLeave,
  deleteGroup,
};
