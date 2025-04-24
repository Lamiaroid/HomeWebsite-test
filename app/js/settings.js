const constants = require("./constants.js");

const readline = require("readline");
const fs = require("fs");

var settings = null;

async function readSettings() {
    const fileStream = fs.createReadStream(
        constants.library.settings.file,
        constants.library.file.encoding
    );

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
            //  if (firstTime) {
            //       firstTime = false;
            //      item = item[0].slice(1, item[0].length - 1);
            //    } else {
            item = item[0].slice(0, item[0].length - 1);
            //    }

            value = line.match(reValue);
            value = value[0].slice(1);

            resources.push({ item, value });
        }
    }

    return resources;
}

async function saveSettings() {
    console.log(settings);
    var settingsText = "";
    for (var i = 0; i < settings.length; i++) {
        settingsText += `${settings[i].item}=${settings[i].value}\r\n`;
    }

    return await new Promise((resolve, reject) => {
        fs.writeFile(
            constants.library.settings.file,
            settingsText,
            constants.library.file.encoding,
            function (err) {
                if (err) {
                    logger.error(err);

                    return resolve(constants.library.status.SMTH_BAD);
                }

                resolve(constants.library.status.FINE);
            }
        );
    });
}

async function initializeSettings() {
    settings = await readSettings();
}

function getSetting(settingName) {
    for (var i = 0; i < settings.length; i++) {
        if (settings[i].item == settingName) {
            return settings[i].value;
        }
    }

    return null;
}

function setSetting(settingName, val) {
    for (var i = 0; i < settings.length; i++) {
        if (settings[i].item == settingName) {
            settings[i].value = val;
            return;
        }
    }

    return null;
}

module.exports = {
    readSettings,
    initializeSettings,
    getSetting,
    setSetting,
    saveSettings,
};
