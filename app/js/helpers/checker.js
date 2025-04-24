const {
    transliterationGenerator,
    getFileExtension,
    getFileNameWithoutExtension,
    prepareStringForSqlQuery,
    idGenerator,
} = require("./commonHelpers.js");
//избавиться
const { sqlRequest } = require("../sql.js");
const constants = require("../constants.js");
const extensionWorker = require("./extensionWorker.js");

async function updateGroupInfoChecker(contentType, groupName, groupOriginalName, filePreview) {
    if (!groupName) {
        return constants.library.status.CONTENT_GROUP_NAME_REQUIRED;
    }

    if (groupName.length > constants.library.content.maxGroupNameLength) {
        return constants.library.status.MAX_CONTENT_GROUP_NAME_LENGTH_EXCEEDED;
    }

    const data = await sqlRequest(
        `SELECT Name 
            FROM LibrarySchema.Groups 
            WHERE Type = '${contentType}' 
            AND Name = ${prepareStringForSqlQuery(groupName)}`
    );

    if (data != constants.library.status.SMTH_BAD) {
        if (data.recordset && data.recordset.length) {
            if (groupOriginalName != groupName) {
                return constants.library.status.CONTENT_GROUP_ALREADY_EXISTS;
            }
        }
    } else {
        return data;
    }

    if (filePreview) {
        const pass = await extensionWorker.checkIfExtensionPasses(
            getFileExtension(filePreview.groupPreview.name),
            filePreview.groupPreview.data,
            extensionWorker.preview
        );

        if (!pass) {
            return constants.library.status.INVALID_CONTENT_PREVIEW_FILE;
        }
    }

    var testId = "";
    for (var i = 0; i < constants.library.id.requiredLength; i++) {
        testId += "X";
    }

    var maxAppCreatedPath =
        constants.library.dir.public +
        `${constants.library.folder.deletedDescription}/${contentType}/` +
        `${constants.library.content.maxNumberInGroup}_${testId}` +
        `${constants.library.content.extraInfo.description}.${constants.library.description.extension}`;

    console.log(maxAppCreatedPath);
    if (maxAppCreatedPath.length > constants.library.content.maxPathLength) {
        return constants.library.status.MAX_CONTENT_PATH_LENGTH_EXCEEDED;
    }

    return constants.library.status.FINE;
}

async function uploadAuthorChecker(authorName, links, authorOriginalName = "") {
    if (!authorName) {
        return constants.library.status.AUTHOR_NAME_REQUIRED;
    }

    if (authorName.length > constants.library.author.maxNameLength) {
        return constants.library.status.MAX_AUTHOR_NAME_LENGTH_EXCEEDED;
    }

    var data = await sqlRequest(
        `SELECT Name 
            FROM LibrarySchema.Authors 
            WHERE Name = ${prepareStringForSqlQuery(authorName)}`
    );

    // for insert and update different logic
    if (data != constants.library.status.SMTH_BAD) {
        if (data.recordset.length) {
            if (!authorOriginalName) {
                return constants.library.status.AUTHOR_ALREADY_EXISTS;
            } else {
                if (authorOriginalName != authorName) {
                    return constants.library.status.AUTHOR_ALREADY_EXISTS;
                }
            }
        }
    } else {
        return data;
    }

    for (var i = 0; i < links.length; i++) {
        if (links[i].length > constants.library.author.maxLinkLegnth) {
            return constants.library.status.MAX_AUTHOR_LINK_LENGTH_EXCEEDED;
        }
    }

    return constants.library.status.FINE;
}

async function uploadTagChecker(tagName, tagOriginalName = "") {
    if (!tagName) {
        return constants.library.status.TAG_NAME_REQUIRED;
    }

    if (tagName.length > constants.library.tag.maxNameLength) {
        return constants.library.status.MAX_TAG_NAME_LENGTH_EXCEEDED;
    }

    var data = await sqlRequest(
        `SELECT Name 
            FROM LibrarySchema.Tags 
            WHERE Name = ${prepareStringForSqlQuery(tagName)}`
    );

    // for insert and update different logic
    if (data != constants.library.status.SMTH_BAD) {
        if (data.recordset.length) {
            if (!tagOriginalName) {
                return constants.library.status.TAG_ALREADY_EXISTS;
            } else {
                if (tagOriginalName != tagName) {
                    return constants.library.status.TAG_ALREADY_EXISTS;
                }
            }
        }
    } else {
        return data;
    }

    return constants.library.status.FINE;
}

async function uploadContentCheckerOnce(contentData, files) {
    const contentType = contentData.contentType;
    const type = constants.library.content.type;

    if (!files || (!files.contentFileSingle && !files.contentFileMultiple)) {
        return constants.library.status.NO_CONTENT_FILE_PROVIDED;
    }

    if (contentData.contentGroupNameNew) {
        var contentGroupNameNew = contentData.contentGroupNameNew;

        if (contentGroupNameNew.length > constants.library.content.maxGroupNameLength) {
            return constants.library.status.MAX_CONTENT_GROUP_NAME_LENGTH_EXCEEDED;
        }

        var data = await sqlRequest(
            `SELECT Name 
                FROM LibrarySchema.Groups 
                WHERE Type = '${contentType}' 
                AND Name = ${prepareStringForSqlQuery(contentGroupNameNew)}`
        );

        if (data != constants.library.status.SMTH_BAD) {
            if (data.recordset && data.recordset.length) {
                return constants.library.status.CONTENT_GROUP_ALREADY_EXISTS;
            }
        } else {
            return data;
        }
    }

    var groupName;
    if (
        contentType == type.comic ||
        contentType == type.comicMini ||
        contentType == type.videoSeries ||
        contentType == type.story ||
        contentType == type.storyAudio ||
        contentType == type.storyInteractive ||
        contentType == type.other
    ) {
        groupName = contentData.contentGroupNameNew;

        if (!groupName) {
            groupName = contentData.contentGroupNameExisting;

            if (!groupName) {
                return constants.library.status.CONTENT_GROUP_NAME_REQUIRED;
            }
        }
    }

    if (contentData.contentNumberInGroup) {
        var contentNumberInGroup = contentData.contentNumberInGroup;

        if (parseInt(contentNumberInGroup) > constants.library.content.maxNumberInGroup) {
            return constants.library.status.CONTENT_NUMBER_IN_GROUP_IS_BIGGER_THAN_MAXIMUM_ALLOWED;
        }

        if (parseInt(contentNumberInGroup) < constants.library.content.startNumberInGroup) {
            return constants.library.status.CONTENT_NUMBER_IN_GROUP_IS_SMALLER_THAN_MINIMUM_ALLOWED;
        }

        var data = await sqlRequest(
            `SELECT NumberInGroup 
                FROM LibrarySchema.Content 
                WHERE GroupID = (
                                SELECT ID  
                                    FROM LibrarySchema.Groups 
                                    WHERE Name = ${prepareStringForSqlQuery(groupName)} 
                                    AND Type = '${contentType}'
                                )
                AND NumberInGroup = ${contentNumberInGroup}`
        );

        console.log(
            "this is what we have ",
            contentType,
            " ",
            prepareStringForSqlQuery(groupName),
            " ",
            data
        );

        if (data != constants.library.status.SMTH_BAD) {
            if (data.recordset && data.recordset.length) {
                return constants.library.status.CONTENT_NUMBER_IN_GROUP_ALREADY_EXISTS;
            }
        } else {
            return data;
        }
    }

    if (files.contentPreview) {
        console.log("this is elected preview ", files.contentPreview);

        const pass = await extensionWorker.checkIfExtensionPasses(
            getFileExtension(files.contentPreview.name),
            files.contentPreview.data,
            extensionWorker.preview
        );

        if (!pass) {
            return constants.library.status.INVALID_CONTENT_PREVIEW_FILE;
        }
    }

    return constants.library.status.FINE;
}

async function previewContentCheckerOnce(files) {
    if (!files) {
        return constants.library.status.NO_CONTENT_FILE_PROVIDED;
    }

    if (files.contentPreview) {
        console.log("this is elected preview ", files.contentPreview);

        const pass = await extensionWorker.checkIfExtensionPasses(
            getFileExtension(files.contentPreview.name),
            files.contentPreview.data,
            extensionWorker.preview
        );

        if (!pass) {
            return constants.library.status.INVALID_CONTENT_PREVIEW_FILE;
        }
    }

    return constants.library.status.FINE;
}

async function typeContentCheckerOnce(contentData) {
    const contentType = contentData.contentType;
    const type = constants.library.content.type;

    if (contentData.contentGroupNameNew) {
        var contentGroupNameNew = contentData.contentGroupNameNew;

        if (contentGroupNameNew.length > constants.library.content.maxGroupNameLength) {
            return constants.library.status.MAX_CONTENT_GROUP_NAME_LENGTH_EXCEEDED;
        }

        var data = await sqlRequest(
            `SELECT Name 
                FROM LibrarySchema.Groups 
                WHERE Type = '${contentType}' 
                AND Name = ${prepareStringForSqlQuery(contentGroupNameNew)}`
        );

        if (data != constants.library.status.SMTH_BAD) {
            if (data.recordset && data.recordset.length) {
                return constants.library.status.CONTENT_GROUP_ALREADY_EXISTS;
            }
        } else {
            return data;
        }
    }

    var groupName;
    if (
        contentType == type.comic ||
        contentType == type.comicMini ||
        contentType == type.videoSeries ||
        contentType == type.story ||
        contentType == type.storyAudio ||
        contentType == type.storyInteractive ||
        contentType == type.other
    ) {
        groupName = contentData.contentGroupNameNew;

        if (!groupName) {
            groupName = contentData.contentGroupNameExisting;

            if (!groupName) {
                return constants.library.status.CONTENT_GROUP_NAME_REQUIRED;
            }
        }
    }

    if (contentData.contentNumberInGroup) {
        var contentNumberInGroup = contentData.contentNumberInGroup;

        if (parseInt(contentNumberInGroup) > constants.library.content.maxNumberInGroup) {
            return constants.library.status.CONTENT_NUMBER_IN_GROUP_IS_BIGGER_THAN_MAXIMUM_ALLOWED;
        }

        if (parseInt(contentNumberInGroup) < constants.library.content.startNumberInGroup) {
            return constants.library.status.CONTENT_NUMBER_IN_GROUP_IS_SMALLER_THAN_MINIMUM_ALLOWED;
        }

        var data = await sqlRequest(
            `SELECT NumberInGroup 
                FROM LibrarySchema.Content 
                WHERE GroupID = (
                                SELECT ID  
                                    FROM LibrarySchema.Groups 
                                    WHERE Name = ${prepareStringForSqlQuery(groupName)} 
                                    AND Type = '${contentType}'
                                )
                AND NumberInGroup = ${contentNumberInGroup}`
        );

        console.log(
            "this is what we have ",
            contentType,
            " ",
            prepareStringForSqlQuery(groupName),
            " ",
            data
        );

        if (data != constants.library.status.SMTH_BAD) {
            if (data.recordset && data.recordset.length) {
                return constants.library.status.CONTENT_NUMBER_IN_GROUP_ALREADY_EXISTS;
            }
        } else {
            return data;
        }
    }

    return constants.library.status.FINE;
}

async function typeContentChecker(contentData, filePath, allData) {
    const contentType = contentData.contentType;
    const type = constants.library.content.type;

    // это важная часть так как мы будем перемещать файл, следовательно нужно знать его расширение, юудем брать файл уже с сервера?
    var passDictionary = -1;
    switch (contentType) {
        case type.image:
            passDictionary = extensionWorker.image;
            break;

        case type.comic:
        case type.comicMini:
            passDictionary = extensionWorker.comic;
            break;

        case type.music:
        case type.sound:
        case type.storyAudio:
            passDictionary = extensionWorker.audio;
            break;

        case type.video:
        case type.videoSeries:
            passDictionary = extensionWorker.video;
            break;

        case type.story:
            passDictionary = extensionWorker.text;
            break;

        case type.storyInteractive:
            passDictionary = extensionWorker.storyInteractive;
            break;

        default:
            break;
    }

    const pass = await extensionWorker.checkIfExtensionPasses(
        allData.Extension,
        null,
        passDictionary,
        filePath
    );

    if (!pass) {
        return constants.library.status.INVALID_CONTENT_FILE_FOR_THIS_CONTENT_TYPE;
    }

    var contentName;
    if (contentData.contentName) {
        contentName = contentData.contentName;
    } else {
        contentName = allData.Name;
    }
    console.log(contentName);

    if (contentName.length > constants.library.content.maxNameLength) {
        return constants.library.status.MAX_CONTENT_NAME_LENGTH_EXCEEDED;
    }

    var contentExtension = allData.Extension;
    if (contentExtension.length > constants.library.content.maxExtensionLength) {
        return constants.library.status.MAX_CONTENT_EXTENSION_LENGTH_EXCEEDED;
    }
    console.log(contentExtension);

    // this was checked earlier, no need to check more just needgroupName now
    var groupName = contentData.contentGroupNameNew;
    if (!groupName) {
        groupName = contentData.contentGroupNameExisting;
    }

    var testId = "";
    for (var i = 0; i < constants.library.id.requiredLength; i++) {
        testId += "X";
    }

    var maxAppCreatedPath =
        constants.library.dir.public +
        `${constants.library.folder.deletedDescription}/${contentType}/`;
    if (
        contentType != type.image &&
        contentType != type.video &&
        contentType != type.music &&
        contentType != type.sound
    ) {
        maxAppCreatedPath +=
            `${transliterationGenerator(groupName)}/` +
            `${constants.library.content.maxNumberInGroup}_`;
    }
    maxAppCreatedPath +=
        `${testId}_${transliterationGenerator(contentName)}` +
        `${constants.library.content.extraInfo.description}.${constants.library.description.extension}`;

    console.log(maxAppCreatedPath);
    if (maxAppCreatedPath.length > constants.library.content.maxPathLength) {
        return constants.library.status.MAX_CONTENT_PATH_LENGTH_EXCEEDED;
    }

    return constants.library.status.FINE;
}

async function uploadContentChecker(contentData, fileToCheck) {
    const contentType = contentData.contentType;
    const type = constants.library.content.type;

    var passDictionary = -1;
    switch (contentType) {
        case type.image:
            passDictionary = extensionWorker.image;
            break;

        case type.comic:
        case type.comicMini:
            passDictionary = extensionWorker.comic;
            break;

        case type.music:
        case type.sound:
        case type.storyAudio:
            passDictionary = extensionWorker.audio;
            break;

        case type.video:
        case type.videoSeries:
            passDictionary = extensionWorker.video;
            break;

        case type.story:
            passDictionary = extensionWorker.text;
            break;

        case type.storyInteractive:
            passDictionary = extensionWorker.storyInteractive;
            break;

        default:
            break;
    }

    const pass = await extensionWorker.checkIfExtensionPasses(
        getFileExtension(fileToCheck.name),
        fileToCheck.data,
        passDictionary
    );

    if (!pass) {
        return constants.library.status.INVALID_CONTENT_FILE_FOR_THIS_CONTENT_TYPE;
    }

    var contentName;
    if (contentData.contentName) {
        contentName = contentData.contentName;
    } else {
        contentName = getFileNameWithoutExtension(fileToCheck.name);
    }
    console.log(contentName);

    if (contentName.length > constants.library.content.maxNameLength) {
        return constants.library.status.MAX_CONTENT_NAME_LENGTH_EXCEEDED;
    }

    var contentExtension = getFileExtension(fileToCheck.name);
    if (contentExtension.length > constants.library.content.maxExtensionLength) {
        return constants.library.status.MAX_CONTENT_EXTENSION_LENGTH_EXCEEDED;
    }
    console.log(contentExtension);

    // this was checked earlier, no need to check more just needgroupName now
    var groupName = contentData.contentGroupNameNew;
    if (!groupName) {
        groupName = contentData.contentGroupNameExisting;
    }

    var testId = "";
    for (var i = 0; i < constants.library.id.requiredLength; i++) {
        testId += "X";
    }

    // это уже некорректная проверка, со всеми этими foldersequence новыми, нужно их тоже учесть
    var maxAppCreatedPath =
        constants.library.dir.public +
        `${constants.library.folder.deletedDescription}/${contentType}/`;
    if (
        contentType != type.image &&
        contentType != type.video &&
        contentType != type.music &&
        contentType != type.sound
    ) {
        maxAppCreatedPath +=
            `${transliterationGenerator(groupName)}/` +
            `${constants.library.content.maxNumberInGroup}_`;
    }
    maxAppCreatedPath +=
        `${testId}_${transliterationGenerator(contentName)}` +
        `${constants.library.content.extraInfo.description}.${constants.library.description.extension}`;

    console.log(maxAppCreatedPath);
    if (maxAppCreatedPath.length > constants.library.content.maxPathLength) {
        return constants.library.status.MAX_CONTENT_PATH_LENGTH_EXCEEDED;
    }

    return constants.library.status.FINE;
}

async function editContentCheckerOnce(contentData) {
    const contentType = contentData.contentType;
    const type = constants.library.content.type;

    if (contentData.contentGroupNameNew) {
        var contentGroupNameNew = contentData.contentGroupNameNew;

        if (contentGroupNameNew.length > constants.library.content.maxGroupNameLength) {
            return constants.library.status.MAX_CONTENT_GROUP_NAME_LENGTH_EXCEEDED;
        }

        var data = await sqlRequest(
            `SELECT Name 
                FROM LibrarySchema.Groups 
                WHERE Type = '${contentType}' 
                AND Name = ${prepareStringForSqlQuery(contentGroupNameNew)}`
        );

        if (data != constants.library.status.SMTH_BAD) {
            if (data.recordset && data.recordset.length) {
                return constants.library.status.CONTENT_GROUP_ALREADY_EXISTS;
            }
        } else {
            return data;
        }
    }

    var groupName;
    if (
        contentType == type.comic ||
        contentType == type.comicMini ||
        contentType == type.videoSeries ||
        contentType == type.story ||
        contentType == type.storyAudio ||
        contentType == type.storyInteractive ||
        contentType == type.other
    ) {
        groupName = contentData.contentGroupNameNew;

        if (!groupName) {
            groupName = contentData.contentGroupNameExisting;

            if (!groupName) {
                return constants.library.status.CONTENT_GROUP_NAME_REQUIRED;
            }
        }
    }

    if (contentData.contentNumberInGroup) {
        var contentNumberInGroup = contentData.contentNumberInGroup;

        if (parseInt(contentNumberInGroup) > constants.library.content.maxNumberInGroup) {
            return constants.library.status.CONTENT_NUMBER_IN_GROUP_IS_BIGGER_THAN_MAXIMUM_ALLOWED;
        }

        if (parseInt(contentNumberInGroup) < constants.library.content.startNumberInGroup) {
            return constants.library.status.CONTENT_NUMBER_IN_GROUP_IS_SMALLER_THAN_MINIMUM_ALLOWED;
        }

        var data = await sqlRequest(
            `SELECT NumberInGroup 
                FROM LibrarySchema.Content 
                WHERE GroupID = (
                                SELECT ID  
                                    FROM LibrarySchema.Groups 
                                    WHERE Name = ${prepareStringForSqlQuery(groupName)} 
                                    AND Type = '${contentType}'
                                )
                AND NumberInGroup = ${contentNumberInGroup}`
        );

        console.log(
            "this is what we have ",
            contentType,
            " ",
            prepareStringForSqlQuery(groupName),
            " ",
            data
        );

        if (data != constants.library.status.SMTH_BAD) {
            if (data.recordset && data.recordset.length) {
                return constants.library.status.CONTENT_NUMBER_IN_GROUP_ALREADY_EXISTS;
            }
        } else {
            return data;
        }
    }

    return constants.library.status.FINE;
}

async function editContentChecker(contentData) {
    const contentType = contentData.contentType;
    const type = constants.library.content.type;

    var passDictionary = -1;
    switch (contentType) {
        case type.image:
            passDictionary = extensionWorker.image;
            break;

        case type.comic:
        case type.comicMini:
            passDictionary = extensionWorker.comic;
            break;

        case type.music:
        case type.sound:
        case type.storyAudio:
            passDictionary = extensionWorker.audio;
            break;

        case type.video:
        case type.videoSeries:
            passDictionary = extensionWorker.video;
            break;

        case type.story:
            passDictionary = extensionWorker.text;
            break;

        case type.storyInteractive:
            passDictionary = extensionWorker.storyInteractive;
            break;

        default:
            break;
    }

    var contentName;
    if (contentData.contentName) {
        contentName = contentData.contentName;
    } else {
        //change it for content name required later
        return "NOPE";
    }
    console.log(contentName);

    if (contentName.length > constants.library.content.maxNameLength) {
        return constants.library.status.MAX_CONTENT_NAME_LENGTH_EXCEEDED;
    }

    // this was checked earlier, no need to check more just needgroupName now
    var groupName = contentData.contentGroupName;

    var testId = "";
    for (var i = 0; i < constants.library.id.requiredLength; i++) {
        testId += "X";
    }

    //разве это правильно на данный момент со всеми этими folder sequence????
    var maxAppCreatedPath =
        constants.library.dir.public +
        `${constants.library.folder.deletedDescription}/${contentType}/`;
    if (
        contentType != type.image &&
        contentType != type.video &&
        contentType != type.music &&
        contentType != type.sound
    ) {
        maxAppCreatedPath +=
            `${transliterationGenerator(groupName)}/` +
            `${constants.library.content.maxNumberInGroup}_`;
    }
    maxAppCreatedPath +=
        `${testId}_${transliterationGenerator(contentName)}` +
        `${constants.library.content.extraInfo.description}.${constants.library.description.extension}`;

    console.log(maxAppCreatedPath);
    if (maxAppCreatedPath.length > constants.library.content.maxPathLength) {
        return constants.library.status.MAX_CONTENT_PATH_LENGTH_EXCEEDED;
    }

    return constants.library.status.FINE;
}

async function generateCheckedId(idType, table) {
    var id = null;
    do {
        id = idGenerator(idType);
        var data = await sqlRequest(
            `SELECT ID 
                FROM LibrarySchema.${table} 
                WHERE ID = '${id}'`
        );

        if (data == constants.library.status.SMTH_BAD) {
            return constants.library.status.SMTH_BAD;
        }
    } while (data.recordset.length);

    return id;
}

module.exports = {
    uploadContentCheckerOnce,
    uploadContentChecker,
    editContentCheckerOnce,
    editContentChecker,
    uploadAuthorChecker,
    updateGroupInfoChecker,
    uploadTagChecker,
    generateCheckedId,
    previewContentCheckerOnce,
    typeContentCheckerOnce,
    typeContentChecker,
};
