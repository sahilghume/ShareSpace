const sqlConnectionPool = require("../config/db");

function createExpenseWithSplits(expenseData, splits) {
  const { group_id, paid_by, title, amount, category, expense_date } =
    expenseData;

  // Check that splits are provided
  if (!Array.isArray(splits) || splits.length === 0) {
    return Promise.reject(new Error("At least one split is required"));
  }

  // Check whether split amounts equal the total expense
  const totalSplit = splits.reduce(
    (total, split) => total + Math.round(Number(split.share_amount) * 100),
    0,
  );

  if (totalSplit !== Math.round(Number(amount) * 100)) {
    return Promise.reject(
      new Error("Split amounts must equal the total expense"),
    );
  }

  return new Promise((resolve, reject) => {
    // Step 1: Get database connection
    sqlConnectionPool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }

      // Step 2: Start transaction
      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        // Step 3: Insert expense
        const expenseSQL = `
                    INSERT INTO expenses
                    (group_id, paid_by, title, amount, category, expense_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

        connection.query(
          expenseSQL,
          [group_id, paid_by, title, amount, category, expense_date],
          (err, expenseResult) => {
            if (err) {
              return rollback(err);
            }

            // Step 4: Get newly generated expense ID
            const expenseId = expenseResult.insertId;

            // Step 5: Prepare split records
            const splitValues = splits.map((split) => [
              expenseId,
              split.user_id,
              split.share_amount,
            ]);

            const splitSQL = `
                            INSERT INTO expense_splits
                            (expense_id, user_id, share_amount)
                            VALUES ?
                        `;

            // Step 6: Insert all splits
            connection.query(splitSQL, [splitValues], (err, splitResult) => {
              if (err) {
                return rollback(err);
              }

              // Step 7: Commit transaction
              connection.commit((err) => {
                if (err) {
                  return rollback(err);
                }

                connection.release();

                resolve({
                  message: "Expense and splits created successfully",
                  expense_id: expenseId,
                  splits_created: splitResult.affectedRows,
                });
              });
            });
          },
        );

        // Rollback helper
        function rollback(error) {
          connection.rollback(() => {
            connection.release();
            reject(error);
          });
        }
      });
    });
  });
}

function getGroupExpenses(groupId) {
  const sql = `
        SELECT
            e.expense_id,
            e.group_id,
            e.paid_by,
            u.name AS paid_by_name,
            e.title,
            e.amount,
            e.category,
            e.expense_date,
            e.created_at
        FROM expenses e
        JOIN users u ON e.paid_by = u.user_id
        WHERE e.group_id = ?
        ORDER BY e.expense_date DESC
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

function findById(expenseId) {
  const sql = `
        SELECT
            e.expense_id,
            e.group_id,
            e.paid_by,
            u.name AS paid_by_name,
            e.title,
            e.amount,
            e.category,
            e.expense_date,
            e.created_at
        FROM expenses e
        JOIN users u ON e.paid_by = u.user_id
        WHERE e.expense_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [expenseId], (err, result) => {
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

function updateExpense(expenseId, data) {
  const { title, amount, category, expense_date } = data;

  const sql = `
        UPDATE expenses
        SET title = ?,
            amount = ?,
            category = ?,
            expense_date = ?
        WHERE expense_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(
      sql,
      [title, amount, category, expense_date, expenseId],
      (err, result) => {
        if (err) return reject(err);

        if (result.affectedRows === 0) {
          return resolve({
            message: "Expense not found",
          });
        }

        resolve({
          message: "Expense updated successfully",
        });
      },
    );
  });
}

function deleteExpense(expenseId) {
  return new Promise((resolve, reject) => {
    sqlConnectionPool.getConnection((err, connection) => {
      if (err) return reject(err);

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return reject(err);
        }

        // First delete expense splits
        const deleteSplits = `
                    DELETE FROM expense_splits
                    WHERE expense_id = ?
                `;

        connection.query(deleteSplits, [expenseId], (err) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              reject(err);
            });
          }

          // Then delete the main expense
          const deleteExpenseSql = `
                        DELETE FROM expenses
                        WHERE expense_id = ?
                    `;

          connection.query(deleteExpenseSql, [expenseId], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                reject(err);
              });
            }

            if (result.affectedRows === 0) {
              return connection.rollback(() => {
                connection.release();
                resolve({
                  message: "Expense not found",
                });
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
                message: "Expense and splits deleted successfully",
              });
            });
          });
        });
      });
    });
  });
}

function getExpenseSplits(expenseId) {
  const sql = `
        SELECT
            es.split_id,
            es.expense_id,
            es.user_id,
            u.name AS user_name,
            es.share_amount,
            es.is_paid
        FROM expense_splits es
        JOIN users u ON es.user_id = u.user_id
        WHERE es.expense_id = ?
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [expenseId], (err, result) => {
      if (err) return reject(err);

      resolve(result);
    });
  });
}

function getUserExpenses(userId) {
  const sql = `
        SELECT DISTINCT
            e.expense_id,
            e.group_id,
            g.group_name,
            e.paid_by,
            payer.name AS paid_by_name,
            e.title,
            e.amount,
            e.category,
            e.expense_date,
            e.created_at,
            es.share_amount,
            es.is_paid
        FROM expenses e

        JOIN groupscreated g
            ON e.group_id = g.group_id

        JOIN users payer
            ON e.paid_by = payer.user_id

        LEFT JOIN expense_splits es
            ON e.expense_id = es.expense_id
            AND es.user_id = ?

        WHERE e.paid_by = ?
           OR es.user_id = ?

        ORDER BY e.expense_date DESC
    `;

  return new Promise((resolve, reject) => {
    sqlConnectionPool.query(sql, [userId, userId, userId], (err, result) => {
      if (err) return reject(err);

      resolve(result);
    });
  });
}

module.exports = {
  // createExpense,
  // createExpenseSplits,
  createExpenseWithSplits,
  getGroupExpenses,
  findById,
  updateExpense,
  deleteExpense,
  getExpenseSplits,
  getUserExpenses,
};
