const { getDateTimeParams, checkIfZeroNeeded } = require("./utils.js");
const constants = require("./constants.js");

const { Console } = require("console");
const fs = require("fs");

const logger = new Console({
    stdout: fs.createWriteStream(generateLogFilename()),
    stderr: fs.createWriteStream(generateLogFilename(constants.library.log.extraInfo.error)),
});

function generateLogMessage(message) {
    const dateTimeParams = getDateTimeParams(false);

    return (
        `[${checkIfZeroNeeded(dateTimeParams[2])}.${checkIfZeroNeeded(dateTimeParams[1])}.` +
        `${dateTimeParams[0]} ${checkIfZeroNeeded(dateTimeParams[3])}:` +
        `${checkIfZeroNeeded(dateTimeParams[4])}:${checkIfZeroNeeded(dateTimeParams[5])}.` +
        `${checkIfZeroNeeded(dateTimeParams[6], 3)}]: ${message}\r\n`
    );
}

function generateLogFilename(extraInfo = "") {
    const dateTimeParams = getDateTimeParams(false);
    const dateNow =
        `${checkIfZeroNeeded(dateTimeParams[2])}-${checkIfZeroNeeded(dateTimeParams[1])}-` +
        `${dateTimeParams[0]}_${checkIfZeroNeeded(dateTimeParams[3])}-` +
        `${checkIfZeroNeeded(dateTimeParams[4])}-${checkIfZeroNeeded(dateTimeParams[5])}`;

    return `${constants.library.dir.log}/${dateNow + extraInfo}.${constants.library.log.extension}`;
}

module.exports = {
    logger,
    generateLogMessage,
};
