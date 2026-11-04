
const sqlConnectionPool = require("../config/db");
const bcrypt = require("bcryptjs");

async function createUser(name, email, password, phone) {
console.log("Pool:", sqlConnectionPool);
console.log("Query:", typeof sqlConnectionPool.query);
  
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO users (name, email, password, phone)
        VALUES (?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {

        sqlConnectionPool.query(
            sql,
            [name, email, hashedPassword, phone],
            (err, result) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }

            }
        );

    });
}

module.exports = { createUser };
