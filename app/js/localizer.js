const constants = require("./constants.js");

const readline = require("readline");
const fs = require("fs");

var localizedResources = null;
var currentLocalization = constants.library.localization.ru;
var currentLocalizationFile = constants.library.localization.file.ru;

async function initializeLocalization() {
    localizedResources = await localize(currentLocalizationFile);
}

function getCurrentLocalization() {
    return currentLocalization;
}

async function changeLocalization(localization) {
    switch (localization) {
        case constants.library.localization.ru:
            currentLocalization = constants.library.localization.ru;
            currentLocalizationFile = constants.library.localization.file.ru;
            localizedResources = await localize(currentLocalizationFile);
            break;

        case constants.library.localization.en:
            currentLocalization = constants.library.localization.en;
            currentLocalizationFile = constants.library.localization.file.en;
            localizedResources = await localize(currentLocalizationFile);
            break;

        default:
            break;
    }
}

function getLocalizedResource(resource) {
    for (var i = 0; i < localizedResources.length; i++) {
        if (localizedResources[i].item == resource) {
            return localizedResources[i].value;
        }
    }

    return null;
}

async function localize(localizationFile) {
    const fileStream = fs.createReadStream(localizationFile, constants.library.file.encoding);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    var resources = [];
    var item;
    var reItem = /^.*=/i;
    var value;
    var reValue = /=.*$/i;
    var firstTime = true;
    for await (const line of rl) {
        if (line) {
            item = line.match(reItem);

            // currently there is bug when first line has extra space at the beginning
            // _Library.MainPage...
            // where _ is space
            if (firstTime) {
                firstTime = false;
                item = item[0].slice(1, item[0].length - 1);
            } else {
                item = item[0].slice(0, item[0].length - 1);
            }

            value = line.match(reValue);
            value = value[0].slice(1);

            resources.push({ item, value });
        }
    }

    return resources;
}

module.exports = {
    initializeLocalization,
    getCurrentLocalization,
    changeLocalization,
    getLocalizedResource,
};
