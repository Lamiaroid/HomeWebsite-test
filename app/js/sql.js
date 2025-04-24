const { logger, generateLogMessage } = require("./logger.js");
const constants = require("./constants.js");

const sql = require("mssql/msnodesqlv8");

async function sqlRequest(sqlQuery) {
    const pool = new sql.ConnectionPool({
        database: constants.library.sql.database.library,
        server: constants.library.sql.server,
        driver: "msnodesqlv8",
        options: {
            trustedConnection: true,
        },
    });

    // console.log(sqlQuery);
    // add return status if something wrong ?
    var sqlData;
    try {
        var connect = await pool.connect();
        sqlData = await connect.request().query(sqlQuery);
        var close = await connect.close();
    } catch (err) {
        logger.error(generateLogMessage(err));
        throw new Error("DB Problem");
    }

    return sqlData;
}

module.exports = {
    sqlRequest,
};
