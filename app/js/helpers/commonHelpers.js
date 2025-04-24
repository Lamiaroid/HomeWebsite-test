const fs = require("fs");

const { logger, generateLogMessage } = require("../logger.js");
const { checkIfZeroNeeded } = require("../utils.js");
const constants = require("../constants.js");

function getContentTypeFolder(contentType) {
    const type = constants.library.content.type;
    const folder = constants.library.folder.contentType;

    var contentTypeFolder = "";
    switch (contentType) {
        case type.comic:
            contentTypeFolder = folder.comic;
            break;

        case type.comicMini:
            contentTypeFolder = folder.comicMini;
            break;

        case type.group:
            contentTypeFolder = folder.group;
            break;

        case type.image:
            contentTypeFolder = folder.image;
            break;

        case type.music:
            contentTypeFolder = folder.music;
            break;

        case type.other:
            contentTypeFolder = folder.other;
            break;

        case type.sound:
            contentTypeFolder = folder.sound;
            break;

        case type.story:
            contentTypeFolder = folder.story;
            break;

        case type.storyAudio:
            contentTypeFolder = folder.storyAudio;
            break;

        case type.storyInteractive:
            contentTypeFolder = folder.storyInteractive;
            break;

        case type.video:
            contentTypeFolder = folder.video;
            break;

        case type.videoSeries:
            contentTypeFolder = folder.videoSeries;
            break;

        default:
            break;
    }

    return contentTypeFolder;
}

function getApiBasedOnContentType(contentType) {
    const apiLibrary = constants.library.api;
    const type = constants.library.content.type;

    var contentTypeApi = "";
    switch (contentType) {
        case type.comic:
            contentTypeApi = apiLibrary.comics;
            break;

        case type.comicMini:
            contentTypeApi = apiLibrary.comicsMini;
            break;

        case type.image:
            contentTypeApi = apiLibrary.images;
            break;

        case type.music:
            contentTypeApi = apiLibrary.music;
            break;

        case type.other:
            contentTypeApi = apiLibrary.other;
            break;

        case type.sound:
            contentTypeApi = apiLibrary.sounds;
            break;

        case type.story:
            contentTypeApi = apiLibrary.stories;
            break;

        case type.storyAudio:
            contentTypeApi = apiLibrary.storiesAudio;
            break;

        case type.storyInteractive:
            contentTypeApi = apiLibrary.storiesInteractive;
            break;

        case type.video:
            contentTypeApi = apiLibrary.videos;
            break;

        case type.videoSeries:
            contentTypeApi = apiLibrary.videoSeries;
            break;

        default:
            break;
    }

    return contentTypeApi;
}

function getContentTypeBasedOnApi(api) {
    const apiLibrary = constants.library.api;
    const type = constants.library.content.type;

    var contentType = "";
    switch (api) {
        case apiLibrary.images:
            contentType = type.image;
            break;

        case apiLibrary.comics:
            contentType = type.comic;
            break;

        case apiLibrary.comicsMini:
            contentType = type.comicMini;
            break;

        case apiLibrary.music:
            contentType = type.music;
            break;

        case apiLibrary.other:
            contentType = type.other;
            break;

        case apiLibrary.sounds:
            contentType = type.sound;
            break;

        case apiLibrary.stories:
            contentType = type.story;
            break;

        case apiLibrary.storiesAudio:
            contentType = type.storyAudio;
            break;

        case apiLibrary.storiesInteractive:
            contentType = type.storyInteractive;
            break;

        case apiLibrary.videos:
            contentType = type.video;
            break;

        case apiLibrary.videoSeries:
            contentType = type.videoSeries;
            break;

        case apiLibrary.all:
            contentType = type.all;
            break;

        default:
            break;
    }

    return contentType;
}

// have insane problems with files generating id like that cause Fiouasdj1 and FIOUasDJ1 are !THE SAME! in filesystem
function idGenerator(idType) {
    const type = constants.library.id.type;
    const firstSymbol = constants.library.id.firstSymbol;

    var id = "";
    switch (idType) {
        case type.author:
            id += firstSymbol.author;
            break;

        case type.content:
            id += firstSymbol.content;
            break;

        case type.group:
            id += firstSymbol.group;
            break;

        case type.tag:
            id += firstSymbol.tag;
            break;

        default:
            break;
    }

    const idLength = constants.library.id.requiredLength - 1;
    const symbolSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < idLength; i++) {
        id += symbolSet[Math.floor(Math.random() * symbolSet.length)];
    }

    return id;
}

function transliterationGenerator(originalName) {
    const transliterationSet = [
        ["а", "a"],
        ["б", "b"],
        ["в", "v"],
        ["г", "g"],
        ["д", "d"],
        ["е", "e"],
        ["ё", "yo"],
        ["ж", "j"],
        ["з", "z"],
        ["и", "i"],
        ["й", "i"],
        ["к", "k"],
        ["л", "l"],
        ["м", "m"],
        ["н", "n"],
        ["о", "o"],
        ["п", "p"],
        ["р", "r"],
        ["с", "s"],
        ["т", "t"],
        ["у", "u"],
        ["ф", "f"],
        ["х", "h"],
        ["ц", "c"],
        ["ч", "ch"],
        ["ш", "sh"],
        ["щ", "sh"],
        ["ь", "'"],
        ["ы", "i"],
        ["ъ", "'"],
        ["э", "e"],
        ["ю", "yu"],
        ["я", "ya"],
        ["А", "A"],
        ["Б", "B"],
        ["В", "V"],
        ["Г", "G"],
        ["Д", "D"],
        ["Е", "E"],
        ["Ё", "YO"],
        ["Ж", "J"],
        ["З", "Z"],
        ["И", "I"],
        ["Й", "I"],
        ["К", "K"],
        ["Л", "L"],
        ["М", "M"],
        ["Н", "N"],
        ["О", "O"],
        ["П", "P"],
        ["Р", "R"],
        ["С", "S"],
        ["Т", "T"],
        ["У", "U"],
        ["Ф", "F"],
        ["Х", "H"],
        ["Ц", "C"],
        ["Ч", "CH"],
        ["Ш", "SH"],
        ["Щ", "SH"],
        ["Ь", "'"],
        ["Ы", "I"],
        ["Ъ", "'"],
        ["Э", "E"],
        ["Ю", "YU"],
        ["Я", "YA"],
    ];

    var re = constants.library.content.allowedSymbolsToDisplayInFileNameRE;
    var transliteratedName = "";
    for (var i = 0; i < originalName.length; i++) {
        if (!originalName[i].match(re)) {
            var j = 0;
            for (j = 0; j < transliterationSet.length; j++) {
                if (originalName[i] === transliterationSet[j][0]) {
                    transliteratedName += transliterationSet[j][1];
                    j = transliterationSet.length + 1;
                }
            }

            if (j === transliterationSet.length) {
                transliteratedName += "_";
            }
        } else {
            transliteratedName += originalName[i];
        }
    }

    return transliteratedName;
}

function getFileNameWithoutExtension(fileName) {
    var fileNameWithoutExtensionMirrored = "";
    var i = fileName.length - 1;
    while (fileName[i] !== "." && i >= 0) {
        i--;
    }
    i--;

    while (i >= 0) {
        fileNameWithoutExtensionMirrored += fileName[i];
        i--;
    }

    if (!fileNameWithoutExtensionMirrored) {
        return fileName;
    }

    var fileNameWithoutExtension = "";
    for (var j = fileNameWithoutExtensionMirrored.length - 1; j >= 0; j--) {
        fileNameWithoutExtension += fileNameWithoutExtensionMirrored[j];
    }

    return fileNameWithoutExtension;
}

function getFileExtension(fileName) {
    var extensionMirrored = "";
    var i;
    for (i = fileName.length - 1; i >= 0; i--) {
        if (fileName[i] !== ".") {
            extensionMirrored += fileName[i];
        } else {
            i = -2;
        }
    }

    if (i === -1) {
        return "";
    }

    var extension = "";
    for (var j = extensionMirrored.length - 1; j >= 0; j--) {
        extension += extensionMirrored[j];
    }

    return extension;
}

function hasGroupPreview(groupId, parsedGroupFolderSequence) {
    const path =
        `${constants.library.dir.contentPreview + constants.library.folder.contentType.group}` +
        `${parsedGroupFolderSequence}/${groupId}` +
        `${constants.library.content.extraInfo.preview}.${constants.library.preview.extension}`;

    return fs.existsSync(path);
}

function getFileId(fileName) {
    const firstSymbol = constants.library.id.firstSymbol;

    var offset = 0;
    if (
        fileName[0] !== firstSymbol.author &&
        fileName[0] !== firstSymbol.content &&
        fileName[0] !== firstSymbol.tag
    ) {
        while (fileName[offset] !== "_") {
            offset++;
        }
        offset++;
    }

    var id = "";
    for (var i = offset; i < constants.library.id.requiredLength + offset; i++) {
        id += fileName[i];
    }

    return id;
}

// а это вообще правильно работает?
function getFileSavingPath(
    fileID,
    fileExtension,
    fileType,
    parsedFolderSequence,
    fileExtraInfo = "",
    newDirName = "",
    pageNumber = ""
) {
    const folder =
        constants.library.dir.public +
        getAppFileSavingPathWithoutFileName(
            fileType,
            parsedFolderSequence,
            fileExtraInfo,
            newDirName
        );

    const savingPath =
        `${folder}/` + getFileFullName(fileID, fileExtension, fileExtraInfo, pageNumber);

    return savingPath;
}

// etc /content/content/images/0001/0001/0001
// etc /content/content/comics/0001/0001/0001/G123123ASDDASD/0001/0001/0001
function getAppFileSavingPathWithoutFileName(
    fileType,
    parsedFolderSequence,
    fileExtraInfo = "",
    newDirName = ""
) {
    var contentVariant;
    switch (fileExtraInfo) {
        case "":
            contentVariant = constants.library.folder.content;
            break;

        case constants.library.content.extraInfo.preview:
            contentVariant = constants.library.folder.preview;
            break;

        case constants.library.content.extraInfo.description:
            contentVariant = constants.library.folder.description;
            break;

        default:
            break;
    }

    const contentTypeFolder = getContentTypeFolder(fileType);

    const folder = `${contentVariant + contentTypeFolder + newDirName + parsedFolderSequence}`;

    return folder;
}

// etc /content/content/images/0001/0001/0001/FASDKASKDLLKA1231
// etc /content/content/comics/0001/0001/0001/G123123ASDDASD/0001/0001/0001/FSADLASLJDT1123
function getAppFileSavingPathWithFileName(
    fileID,
    fileExtension,
    fileType,
    parsedFolderSequence,
    fileExtraInfo = "",
    newDirName = "",
    pageNumber = ""
) {
    return (
        getAppFileSavingPathWithoutFileName(
            fileType,
            parsedFolderSequence,
            fileExtraInfo,
            newDirName
        ) + getFileFullName(fileID, fileExtension, fileExtraInfo, pageNumber)
    );
}

// а нужны нам эти числа в названиях файлов сейчас вообще для групп? или наверное всё же лучше сохранить? чтобы потом можно было лучше с комиксами работать, да лучше сохранить
// для чего всё это делалось, это же будет типа проводник  + сайт а не просто сайт , поэтому и нужна такая логиика, чтобы всегда можно было зайти не через сайт и там более менее всё отсортировано
// все операции лучше всего проводить через temp папку( типа чтобы не трогать оригинал, скопировать ориг туда и с копией работать? но это будет занимать больше времени так что не знаю)
function getFileFullName(fileID, fileExtension, fileExtraInfo = "", pageNumber = "") {
    // this checks should be everywehere because null will be "null" as string not "" that we need
    if (pageNumber) {
        pageNumber += "_";
    } else {
        pageNumber = "";
    }

    if (fileExtension) {
        fileExtension = "." + fileExtension;
    } else {
        fileExtension = "";
    }

    return `${pageNumber + fileID + fileExtraInfo + fileExtension}`;
}

// need to be carefull read that file can be corrupted, need health check
async function loadFileToServer(file, fileSavingPath) {
    return await new Promise((resolve, reject) => {
        file.mv(fileSavingPath, function (err) {
            if (err) {
                logger.error(generateLogMessage(err));

                return resolve(constants.library.status.SMTH_BAD);
            }

            resolve(constants.library.status.FINE);
        });
    });
}

async function loadDescriptionFileToServer(fileSavingPath, text) {
    return await new Promise((resolve, reject) => {
        fs.writeFile(fileSavingPath, text, constants.library.file.encoding, function (err) {
            if (err) {
                logger.error(generateLogMessage(err));

                return resolve(constants.library.status.SMTH_BAD);
            }

            resolve(constants.library.status.FINE);
        });
    });
}

async function readFileDescription(fileSavingPath) {
    return await new Promise((resolve, reject) => {
        fs.readFile(fileSavingPath, constants.library.file.encoding, function (err, data) {
            if (err) {
                logger.error(generateLogMessage(err));

                return resolve(constants.library.status.SMTH_BAD);
            }

            resolve(data);
        });
    });
}

async function getAllFileNamesFromDir(contentPath) {
    return await new Promise((resolve, reject) => {
        fs.readdir(contentPath, (err, fileNames) => {
            if (err) {
                logger.error(generateLogMessage(err));

                return resolve(constants.library.status.SMTH_BAD);
            }

            resolve(fileNames);
        });
    });
}

function adjustDimensions(width, height) {
    var mainDimension = width;
    if (height > width) {
        mainDimension = height;
    }

    const correction = mainDimension / constants.library.preview.maxDimensionSize;

    width = Math.round(width / correction);
    height = Math.round(height / correction);

    return { width, height };
}

// for unicode characters we use N (for NVARCHAR)
function prepareStringForSqlQuery(str) {
    if (str) {
        str = str.replaceAll(`'`, `''`);
        return `N'${str}'`;
    }

    return null;
}

function generateDir(dirname) {
    if (!fs.existsSync(dirname)) {
        // shouldn't this be try catch variant???
        fs.mkdirSync(dirname, { recursive: true });
        logger.log(generateLogMessage(`Директория ${dirname} успешно создана.`));
    }
}

function parseFolderSequence(folderSequence) {
    if (folderSequence) {
        return (
            `/${folderSequence.substring(0, 4)}` +
            `/${folderSequence.substring(4, 8)}` +
            `/${folderSequence.substring(8, 12)}`
        );
    }

    return "";
}

function getDateForHtmlForm(date) {
    var formattedDate =
        `${date.getFullYear()}-${checkIfZeroNeeded(date.getMonth() + 1)}-` +
        `${checkIfZeroNeeded(date.getDate())}`;

    return formattedDate;
}

function getFormattedDate(date, needTime, dateFormatType) {
    var formattedDate = "";
    switch (dateFormatType) {
        case "number":
            formattedDate =
                `${checkIfZeroNeeded(date.getDate())}.${checkIfZeroNeeded(date.getMonth() + 1)}.` +
                `${date.getFullYear()}`;

            if (needTime) {
                formattedDate +=
                    ` (${checkIfZeroNeeded(date.getHours())}:` +
                    `${checkIfZeroNeeded(date.getMinutes())})`;
            }
            break;

        case "combined":
            var month = "";
            switch (date.getMonth()) {
                case 0:
                    month = "Января";
                    break;

                case 1:
                    month = "Февраля";
                    break;

                case 2:
                    month = "Марта";
                    break;

                case 3:
                    month = "Апреля";
                    break;

                case 4:
                    month = "Мая";
                    break;

                case 5:
                    month = "Июня";
                    break;

                case 6:
                    month = "Июля";
                    break;

                case 7:
                    month = "Августа";
                    break;

                case 8:
                    month = "Сентября";
                    break;

                case 9:
                    month = "Октября";
                    break;

                case 10:
                    month = "Ноября";
                    break;

                case 11:
                    month = "Декабря";
                    break;

                default:
                    break;
            }

            formattedDate = `${checkIfZeroNeeded(date.getDate())} ${month} ${date.getFullYear()} `;

            if (needTime) {
                formattedDate +=
                    ` (${checkIfZeroNeeded(date.getHours())}:` +
                    `${checkIfZeroNeeded(date.getMinutes())})`;
            }
            break;

        default:
            break;
    }

    return formattedDate;
}

function getFormattedSize(contSize, sizeFormatType) {
    switch (sizeFormatType) {
        case "byte":
            return `${contSize} байт`;

        case "kilobyte":
            return `${Math.round((contSize / 1024) * 100) / 100} килобайт`;

        case "megabyte":
            return `${Math.round((contSize / 1024 / 1024) * 100) / 100} мегабайт`;

        case "gigabyte":
            return `${Math.round((contSize / 1024 / 1024 / 1024) * 100) / 100} гигабайт`;

        default:
            return "";
    }
}

function getFormattedContentTotalCountStr(totalCount) {
    var newTotalCount = totalCount;
    if (totalCount >= 1000) {
        newTotalCount = `${(Math.floor(totalCount / 100) / 10).toFixed(1)}k`;
    }

    if (totalCount >= 10000) {
        newTotalCount = `${Math.floor(totalCount / 1000)}k`;
    }

    if (totalCount >= 1000000) {
        newTotalCount = `${(Math.floor(totalCount / 100000) / 10).toFixed(1)}M`;
    }

    if (totalCount >= 10000000) {
        newTotalCount = `${Math.floor(totalCount / 1000000)}M`;
    }

    return newTotalCount;
}

function getFormattedDuration(contDuration, durationFormatType) {
    switch (durationFormatType) {
        case "seconds":
            return `${Math.round(contDuration * 100) / 100} сек`;

        case "standard":
            var hours = Math.floor(contDuration / (60 * 60));
            contDuration -= 60 * 60 * hours;

            var minutes = Math.floor(contDuration / 60);
            contDuration -= 60 * minutes;

            var seconds = Math.floor(contDuration);
            contDuration -= seconds;

            nanoseconds = contDuration;

            var formattedDuration =
                `${checkIfZeroNeeded(hours)}:` +
                `${checkIfZeroNeeded(minutes)}:${checkIfZeroNeeded(seconds)}`;

            if (Math.round(nanoseconds * 100) > 0) {
                formattedDuration += `.${Math.round(nanoseconds * 100)}`;
            }

            return formattedDuration;

        default:
            return "";
    }
}

async function modifyHtmlFile(filename, whatToModify = "", modifier = "") {
    return await new Promise((resolve, reject) => {
        if (fs.existsSync(filename)) {
            fs.readFile(filename, constants.library.file.encoding, function (err, html) {
                if (err) {
                    logger.error(generateLogMessage(err));

                    return resolve(constants.library.status.SMTH_BAD);
                }

                resolve(html.replace(new RegExp(whatToModify), modifier));
            });
        } else {
            resolve(filename);
        }
    });
}

module.exports = {
    idGenerator,
    getFileId,
    transliterationGenerator,
    getFileExtension,
    loadFileToServer,
    getFileSavingPath,
    getAppFileSavingPathWithoutFileName,
    getAppFileSavingPathWithFileName,
    getFileFullName,
    getContentTypeFolder,
    getFileNameWithoutExtension,
    adjustDimensions,
    hasGroupPreview,
    getAllFileNamesFromDir,
    prepareStringForSqlQuery,
    loadDescriptionFileToServer,
    readFileDescription,
    generateDir,
    getFormattedDate,
    getDateForHtmlForm,
    checkIfZeroNeeded,
    getFormattedSize,
    getFormattedDuration,
    getFormattedContentTotalCountStr,
    parseFolderSequence,
    getApiBasedOnContentType,
    getContentTypeBasedOnApi,
    modifyHtmlFile,
};
