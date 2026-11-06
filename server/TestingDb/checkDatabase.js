const sqlConnectionPool = require("../config/db");

const sql = `
    SELECT *
    FROM group_members
    WHERE group_id = ? AND user_id = ?
`;

sqlConnectionPool.query(sql, [1, 1], (err, result) => {
    if (err) {
        console.log("SQL Error:", err.message);
    } else {
        console.log("Query result:", result);
    }
});