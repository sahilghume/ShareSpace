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
};
