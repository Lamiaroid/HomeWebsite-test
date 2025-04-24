const fs = require("fs");

const constants = require("./constants.js");

const storages = fs
    .readFileSync(constants.library.storages.file, constants.library.file.encoding)
    .split("\n")
    .filter(Boolean);

module.exports = {
    storages,
};
