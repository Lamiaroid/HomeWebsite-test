const fs = require("fs");

const {
    transliterationGenerator,
    getFileFullName,
    getContentTypeFolder,
    getAppFileSavingPathWithoutFileName,
    prepareStringForSqlQuery,
    readFileDescription,
    getFormattedDate,
    getFormattedSize,
    getFormattedDuration,
    parseFolderSequence,
    getApiBasedOnContentType,
    getDateForHtmlForm,
} = require("../helpers/commonHelpers.js");
const { sqlRequest } = require("../sql.js");
const { getSetting } = require("../settings.js");
const { uploadContentCheckerOnce, editContentCheckerOnce, previewContentCheckerOnce, typeContentCheckerOnce } = require("../helpers/checker.js");
const { getContentPathesAndData } = require("../helpers/content/getContentPathesAndData.js");
const { getALLDATA } = require("../helpers/commonDBRequests.js");
const { logger, generateLogMessage } = require("../logger.js");
const constants = require("../constants.js");
const contentProcessor = require("../helpers/content/contentProcessor.js");

// почему вынесена логика? потому что файлов может быть несколько, и чтобы не закидывать сюда всё, вынесли отдельно
//change it to content and files instead of request
exports.addNewContent = async function (contentData, files) {
    console.log("body", contentData);
    console.log("files ", files);

    var allInfo = [];

    // this 2 lines are just for checking incoming data
    // allInfo.push(constants.library.status.AUTHOR_NAME_REQUIRED);
    // return allInfo;

    // нужно проверить старые проверки и добавить новые
    const checkResult = await uploadContentCheckerOnce(contentData, files);
    if (checkResult !== constants.library.status.FINE) {
        allInfo.push(checkResult);
        return allInfo;
    }

    if (files.contentFileMultiple) {
        if (files.contentFileMultiple[0]) {
            contentProcessor.setNumberOfContent(files.contentFileMultiple.length);
            var i = 0;
            while (files.contentFileMultiple[i]) {
                allInfo.push(await contentProcessor.processContent(contentData, files.contentFileMultiple[i], files.contentPreview));
                i++;
            }
        } else {
            contentProcessor.setNumberOfContent(1);
            allInfo.push(await contentProcessor.processContent(contentData, files.contentFileMultiple, files.contentPreview));
        }
    } else {
        contentProcessor.setNumberOfContent(1);
        allInfo.push(await contentProcessor.processContent(contentData, files.contentFileSingle, files.contentPreview));
    }

    return allInfo;
};

//change it to content and files instead of request
exports.editContentInfo = async function (contentData) {
    console.log("body", contentData);

    var allInfo = [];

    const checkResult = await editContentCheckerOnce(contentData);
    if (checkResult !== constants.library.status.FINE) {
        allInfo.push(checkResult);
        return allInfo;
    }

    allInfo.push(await contentProcessor.editContentInfo(contentData));

    return allInfo;
};

exports.editContentPreview = async function (contentData, files) {
    var allInfo = [];

    const checkResult = await previewContentCheckerOnce(contentData);
    if (checkResult !== constants.library.status.FINE) {
        allInfo.push(checkResult);
        return allInfo;
    }

    allInfo.push(await contentProcessor.editContentPreview(contentData, files.contentPreview));

    return allInfo;
};

exports.editContentType = async function (contentData) {
    console.log("body", contentData);

    var allInfo = [];

    const checkResult = await typeContentCheckerOnce(contentData);
    if (checkResult !== constants.library.status.FINE) {
        allInfo.push(checkResult);
        return allInfo;
    }

    allInfo.push(await contentProcessor.editContentType(contentData));

    return allInfo;
};

exports.deleteContent = async function (contentData) {
    console.log("body", contentData);

    var allInfo = [];

    allInfo.push(await contentProcessor.deleteContent(contentData));

    return allInfo;
};

exports.deleteContentPreview = async function (contentData) {
    console.log("body", contentData);

    var allInfo = [];
    allInfo.push(contentData.currentURL);

    allInfo.push(await contentProcessor.deleteContentPreview(contentData));

    return allInfo;
};

exports.setDefaultContentPreview = async function (contentData) {
    console.log("body", contentData);

    var allInfo = [];

    allInfo.push(await contentProcessor.setDefaultContentPreview(contentData));

    return allInfo;
};

exports.getContentInfo = async function (requestBodyId) {
    var allData = await getALLDATA(requestBodyId);

    var content = allData.content;
    var group = allData.group;
    var author = allData.author;
    var tags = allData.tags;
    var descr = allData.descr;

    var obj = {};
    if (content.CreationDate) {
        obj.creationDate = getDateForHtmlForm(content.CreationDate);
    } else {
        obj.creationDate = "";
    }
    if (author) {
        obj.author = author.Name;
    } else {
        obj.author = "";
    }
    if (group) {
        obj.group = group.Name;
    } else {
        obj.group = "";
    }
    if (content.NumberInGroup) {
        obj.numberInGroup = content.NumberInGroup;
    } else {
        obj.numberInGroup = "";
    }
    if (content.LinkToOriginal) {
        obj.linkToOriginal = content.LinkToOriginal;
    } else {
        obj.linkToOriginal = "";
    }
    obj.contentType = content.Type;
    obj.name = content.Name;
    obj.description = descr;

    //     console.log("here is desctrefd", descr);

    return obj;
};

exports.getContentPreviewInfo = async function (id) {
    const contentPathesAndData = await getContentPathesAndData(id);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    // вот тут нам надо вырезать начальный путь до content чтобы ьраузер тоже мог юзать
    var contentPreviewPath = contentPathesAndData.contentPreviewPath;

    var hasPreview = true;
    if (!fs.existsSync(constants.library.dir.public + contentPreviewPath)) {
        contentPreviewPath = `${constants.library.folder.art}/${constants.library.preview.default.image}`;
        hasPreview = false;
    }

    return { contentPreviewPath, hasPreview };
};

exports.getContentTypeInfo = async function (id) {
    const contentPathesAndData = await getContentPathesAndData(id);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    const type = contentPathesAndData.contentInfo.type;
    const numberInGroup = contentPathesAndData.contentInfo.NumberInGroup;
    const groupName = contentPathesAndData.groupInfo ? contentPathesAndData.groupInfo.Name : null;

    return { type, numberInGroup, groupName };
};

exports.applySuggestedExtension = async function (contentID) {
    const contentPathesAndData = await getContentPathesAndData(contentID);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    // вот тут нужно расширение вырезать чтобы дальше юзать
    var filePathWithoutExtension = contentPathesAndData.contentPath;

    var filePath = filePathWithoutExtension + contentPathesAndData.contentInfo.Extension;
    var filePathNew = filePathWithoutExtension + contentPathesAndData.contentInfo.SuggestedExtension;

    console.log("this is new name ", filePathNew, " this is old ", filePath);

    if (fs.existsSync(filePath)) {
        fs.renameSync(filePath, filePathNew);
    }

    return constants.library.status.FINE;
};

exports.addToFavourite = async function (contentID) {
    const data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Content 
            WHERE ID = '${contentID}'`
    );

    if (!data.recordset || !data.recordset.length) {
        return constants.library.status.NOT_FOUND;
    }

    const contentData = data.recordset[0];

    var isFavourite = 0;
    if (!contentData.IsFavourite) {
        isFavourite = 1;
    } else {
        isFavourite = 0;
    }

    await sqlRequest(
        `UPDATE LibrarySchema.Content 
            SET IsFavourite = ${isFavourite}
            WHERE ID = '${contentID}'`
    );

    return constants.library.status.FINE;
};

exports.addToDeleted = async function (contentID) {
    const data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Content 
            WHERE ID = '${contentID}'`
    );

    if (!data.recordset || !data.recordset.length) {
        return constants.library.status.NOT_FOUND;
    }

    const contentData = data.recordset[0];

    var isDeleted = 0;
    if (!contentData.IsDeleted) {
        isDeleted = 1;
    } else {
        isDeleted = 0;
    }

    // обязательно ставим (типа если удалили, значит всё, не может быть любимым)
    await sqlRequest(
        `UPDATE LibrarySchema.Content 
            SET IsDeleted = ${isDeleted},
                IsFavourite = 0
            WHERE ID = '${contentID}'`
    );

    return constants.library.status.FINE;
};

exports.addTagsToContent = async function (tagNames, postID) {
    /* if (!tagNames) {
        return constants.library.status.FINE;
    }*/

    // это используется только в том случае, если тэг 1, он тогда передаётся как строка, поэтому мы кидаем в массив
    if (typeof tagNames === "string") {
        tagNames = [tagNames];
    }

    var contentAndTagsData = await sqlRequest(
        `SELECT TagID 
            FROM LibrarySchema.ContentAndTags 
            WHERE ContentID = '${postID}'`
    );

    console.log("this is default tags2 ", contentAndTagsData.recordset, " ", postID);
    // а нам вообще это нужно в данном случае? и ещё нужно чекнуть другие методы, потому что такая штука явно нужна не везде, может же быть 0 тегов и он всё здесь пропустит, это нормально, разве мы должны возвращать такое?
    // нужна хотя бы проверка что изнаально тэги вообще есть
    //if (!contentAndTagsData.recordset || !contentAndTagsData.recordset.length) {
    //    return constants.library.status.NOT_FOUND;
    //}
    var tagIds = contentAndTagsData.recordset;

    var queryOr = "";
    if (tagIds[0]) {
        queryOr = `ID = '${tagIds[0].TagID}' `;
    }
    for (var x = 1; tagIds[x]; x++) {
        queryOr += `OR ID = '${tagIds[x].TagID}' `;
    }

    var tags = [];
    if (queryOr) {
        var tagsData = await sqlRequest(
            `SELECT * 
                FROM LibrarySchema.Tags 
                WHERE (${queryOr}) 
                ORDER BY Name`
        );

        if (!tagsData.recordset || !tagsData.recordset.length) {
            return constants.library.status.NOT_FOUND;
        }

        tags = tagsData.recordset;
    }

    console.log("this is default tags ", tags);
    console.log("this is new tags ", tagNames);
    //first insert new tags
    if (!tagNames) {
        tagNames = [];
    }

    for (var i = 0; i < tagNames.length; i++) {
        var j = 0;
        while (j < tags.length) {
            if (tags[j].Name == tagNames[i]) {
                j = tags.length + 1;
            }
            j++;
        }

        if (j === tags.length) {
            await sqlRequest(
                `INSERT 
                    INTO LibrarySchema.ContentAndTags 
                        (ContentID, TagID)
                    VALUES 
                        ('${postID}', (
                                        SELECT ID 
                                            FROM LibrarySchema.Tags 
                                            WHERE Name = ${prepareStringForSqlQuery(tagNames[i])}
                                        )
                        )`
            );
        }
    }

    //then delete removed tags
    for (var i = 0; i < tags.length; i++) {
        var j = 0;
        while (j < tagNames.length) {
            if (tags[i].Name == tagNames[j]) {
                j = tagNames.length + 1;
            }
            j++;
        }

        if (j === tagNames.length) {
            await sqlRequest(
                `DELETE 
                    FROM LibrarySchema.ContentAndTags 
                    WHERE ContentID = '${postID}' 
                    AND TagID = (
                                SELECT ID 
                                    FROM LibrarySchema.Tags 
                                    WHERE Name = ${prepareStringForSqlQuery(tags[i].Name)}
                                )`
            );
        }
    }

    return constants.library.status.FINE;
};

exports.copyContent = async function (id) {
    const contentPathesAndData = await getContentPathesAndData(id);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    var originalFilePath = contentPathesAndData.contentPath;
    var statusText = "";
    // also should check if file already exists not to rewrite it
    // progress bar for big files maybe???
    try {
        fs.copyFileSync(
            originalFilePath,
            getSetting("copyPath") +
                `/${transliterationGenerator(contentPathesAndData.contentInfo.Name)}` +
                `.${contentPathesAndData.contentInfo.Extension}`
        );
        statusText = `Файл успешно скопирован в указанный путь: ${getSetting("copyPath")}`;
    } catch (ex) {
        console.log(ex);
        statusText = `Не удалось скопировать файл в указанный путь: ${getSetting("copyPath")}`;
    }

    return statusText;
};
