const gifFrames = require("gif-frames");
const fileType = require("file-type");
const sizeOf = require("image-size");
const sharp = require("sharp");
const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg");
const fs = require("fs");

const {
    getFileExtension,
    loadFileToServer,
    getFileFullName,
    getContentTypeFolder,
    getFileNameWithoutExtension,
    getFileSavingPath,
    adjustDimensions,
    prepareStringForSqlQuery,
    loadDescriptionFileToServer,
    parseFolderSequence,
    generateDir,
    readFileDescription,
    getAppFileSavingPathWithoutFileName,
} = require("../commonHelpers.js");
const {
    uploadContentChecker,
    editContentChecker,
    generateCheckedId,
    typeContentChecker,
} = require("../checker.js");
// избавиться
const { getContentPathesAndData } = require("./getContentPathesAndData.js");
const { sqlRequest } = require("../../sql.js");
const { getDateTimeParams } = require("../../utils.js");
const { logger, generateLogMessage } = require("../../logger.js");
const constants = require("../../constants.js");

ffmpeg.setFfprobePath(ffprobeStatic.path);
ffmpeg.setFfmpegPath(ffmpegPath.path);

var allContentNumber = 0;
var currentContentNumber = 0;

exports.setNumberOfContent = function (contentNumber) {
    allContentNumber = contentNumber;
    currentContentNumber = 0;
};

exports.getContentProccesingInfo = function () {
    return { processed: currentContentNumber, total: allContentNumber };
};

exports.processContent = async function (contentData, contentFile, previewFile) {
    // нужно проверить старые проверки и добавить новые
    const checkResult = await uploadContentChecker(contentData, contentFile);
    if (checkResult !== constants.library.status.FINE) {
        return checkResult;
    }

    //по-большому счёту теперь нужно всё пересмотерь, так как логичка немного везде сменилась, начиная с бд
    // а это неправильно выходит, так как он несколько раз генерирует groupid хотя должен только 1 раз вызываться
    const groupData = await processGroup(contentData);
    var groupId = groupData.groupId;
    var groupFolder = groupData.groupFolder;

    var id = await generateCheckedId(constants.library.id.type.content, "Content");

    var contentMainInfo = getContentMainInfo(
        contentData.contentName,
        contentData.contentCreationDate,
        contentFile
    );
    var contentName = contentMainInfo.contentName;
    var creationDate = contentMainInfo.creationDate;
    var additionDate = contentMainInfo.additionDate;

    var extension = getFileExtension(contentFile.name);
    var suggestedExtension = await fileType.fromBuffer(contentFile.data);
    if (suggestedExtension) {
        suggestedExtension = suggestedExtension.ext;
    }

    var contentType = contentData.contentType;

    var contentNumberInGroup = await getContentNumberInGroup(
        contentData.contentNumberInGroup,
        contentType,
        groupId
    );

    var numberInGroup = contentNumberInGroup.numberInGroup;
    var numberInGroupForAddition = contentNumberInGroup.numberInGroupForAddition;

    var folderSequence = await getFolderSequence("Content", contentType, groupId);

    // вот этого не должно быть здесь по идее, это должно быть в самой штуке для загрузки файла, как и для описаний, превью и прочего
    generateDir(
        constants.library.dir.public +
            getAppFileSavingPathWithoutFileName(
                contentType,
                parseFolderSequence(folderSequence),
                "",
                groupFolder
            )
    );

    var fileSavingPath = getFileSavingPath(
        id,
        extension,
        contentType,
        parseFolderSequence(folderSequence),
        "",
        groupFolder,
        numberInGroupForAddition
    );

    await loadFileToServer(contentFile, fileSavingPath);

    generateDir(
        constants.library.dir.public +
            getAppFileSavingPathWithoutFileName(
                contentType,
                parseFolderSequence(folderSequence),
                constants.library.content.extraInfo.description,
                groupFolder
            )
    );

    await loadDescriptionFileToServer(
        getFileSavingPath(
            id,
            constants.library.description.extension,
            contentType,
            parseFolderSequence(folderSequence),
            constants.library.content.extraInfo.description,
            groupFolder,
            numberInGroupForAddition
        ),
        contentData.contentDescription
    );

    var contentAdditionalInfo = await getContentAdditionalInfo(
        fileSavingPath,
        contentType,
        previewFile
    );

    var height = contentAdditionalInfo.height;
    var width = contentAdditionalInfo.width;
    var duration = contentAdditionalInfo.duration;
    var hasPreview = contentAdditionalInfo.hasPreview;

    var size = contentFile.size;

    generateDir(
        constants.library.dir.public +
            getAppFileSavingPathWithoutFileName(
                contentType,
                parseFolderSequence(folderSequence),
                constants.library.content.extraInfo.preview,
                groupFolder
            )
    );

    if (hasPreview === 1) {
        const success = await createContentPreview(
            getFileFullName(
                id,
                constants.library.preview.extension,
                constants.library.content.extraInfo.preview,
                numberInGroupForAddition
            ),
            constants.library.dir.contentPreview +
                getContentTypeFolder(contentType) +
                groupFolder +
                parseFolderSequence(folderSequence),
            previewFile,
            fileSavingPath,
            width,
            height,
            contentType
        );

        if (!success) {
            hasPreview = 0;
        }
    }

    var isDeleted = 0;
    var isFavourite = 0;

    // think about better way to save original file path
    var originalName = contentFile.name;
    var linkToOriginal = contentData.contentLinkToOriginal;

    await sqlRequest(
        `INSERT 
            INTO LibrarySchema.Content 
                (ID, Name, Extension, SuggestedExtension,
                CreationDate, AdditionDate, Type, GroupID, 
                NumberInGroup, Height, Width, Duration, 
                Size, HasPreview, IsDeleted, IsFavourite,
                FolderSequence, OriginalName, LinkToOriginal) 
            VALUES 
                ('${id}', ${prepareStringForSqlQuery(contentName)}, 
                ${prepareStringForSqlQuery(extension)}, 
                ${prepareStringForSqlQuery(suggestedExtension)},
                ${prepareStringForSqlQuery(creationDate)}, 
                '${additionDate}', '${contentType}', 
                ${prepareStringForSqlQuery(groupId)}, ${numberInGroup}, ${height}, ${width}, 
                ${duration}, ${size}, ${hasPreview}, ${isDeleted}, 
                ${isFavourite}, '${folderSequence}', ${prepareStringForSqlQuery(originalName)},
                ${prepareStringForSqlQuery(linkToOriginal)})`
    );

    if (contentData.contentAuthor) {
        if (contentData.contentAuthor !== constants.library.content.noContentAuthor) {
            const authorsData = await sqlRequest(
                `SELECT ID 
                    FROM LibrarySchema.Authors
                    WHERE Name = ${prepareStringForSqlQuery(contentData.contentAuthor)}`
            );

            if (!authorsData.recordset || !authorsData.recordset.length) {
                return constants.library.status.FINE;
            }

            await sqlRequest(
                `INSERT 
                    INTO LibrarySchema.ContentAndAuthors 
                        (ContentID, AuthorID) 
                    VALUES 
                        ('${id}', '${authorsData.recordset[0].ID}')`
            );
        }
    }

    currentContentNumber++;

    return constants.library.status.FINE;
};

exports.editContentInfo = async function (contentData) {
    const id = contentData.ID;
    const contentName = contentData.contentName;
    const creationDate = contentData.contentCreationDate;
    const linkToOriginal = contentData.contentLinkToOriginal;

    const contentPathesAndData = await getContentPathesAndData(id);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    contentData.contentGroupName = contentPathesAndData.groupInfo
        ? contentPathesAndData.groupInfo.Name
        : "";

    const checkResult = await editContentChecker(contentData);
    if (checkResult !== constants.library.status.FINE) {
        return checkResult;
    }

    //пересмотерть всё с логикой создания пути, уже видятся не состыковки в проверках по крайней мере
    await loadDescriptionFileToServer(
        contentPathesAndData.contentDescriptionPath,
        contentData.contentDescription
    );

    await sqlRequest(
        `UPDATE LibrarySchema.Content 
            SET Name = ${prepareStringForSqlQuery(contentName)}, 
                CreationDate = ${prepareStringForSqlQuery(creationDate)},
                LinkToOriginal = ${prepareStringForSqlQuery(linkToOriginal)}
            WHERE ID = '${id}'`
    );

    // but if we plan to have case where one content can have many authors this solution will lead to bug
    await sqlRequest(
        `DELETE 
            FROM LibrarySchema.ContentAndAuthors
            WHERE ContentID = '${id}'`
    );

    if (contentData.contentAuthor !== constants.library.content.noContentAuthor) {
        const authorsData = await sqlRequest(
            `SELECT ID 
                FROM LibrarySchema.Authors
                WHERE Name = ${prepareStringForSqlQuery(contentData.contentAuthor)}`
        );

        if (!authorsData.recordset || !authorsData.recordset.length) {
            return constants.library.status.FINE;
        }

        await sqlRequest(
            `INSERT 
                INTO LibrarySchema.ContentAndAuthors 
                    (ContentID, AuthorID) 
                VALUES 
                    ('${id}', '${authorsData.recordset[0].ID}')`
        );
    }

    return constants.library.status.FINE;
};

exports.editContentType = async function (contentData) {
    const id = contentData.ID;

    var contentPathesAndData = await getContentPathesAndData(id);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    const checkResult = await typeContentChecker(
        contentData,
        contentPathesAndData.contentPath,
        contentPathesAndData.contentInfo
    );
    if (checkResult !== constants.library.status.FINE) {
        return checkResult;
    }

    const groupData = await processGroup(contentData);

    const groupId = groupData.groupId;
    const groupFolder = groupData.groupFolder;

    const contentType = contentData.contentType;
    const contentNumberInGroup = await getContentNumberInGroup(
        contentData.contentNumberInGroup,
        contentType,
        groupId
    );

    const numberInGroup = contentNumberInGroup.numberInGroup;
    const numberInGroupForAddition = contentNumberInGroup.numberInGroupForAddition;

    const folderSequence = await getFolderSequence("Content", contentType, groupId);

    contentPathesAndData = await getContentPathesAndData(id, {
        type: contentType,
        folderSequence: folderSequence,
        groupFolder: groupFolder,
        numberInGroup: numberInGroupForAddition,
    });

    // content
    generateDir(
        constants.library.dir.public +
            getAppFileSavingPathWithoutFileName(
                contentType,
                parseFolderSequence(folderSequence),
                "",
                groupFolder
            )
    );

    // будут проблемы с таким ренеймом если нужно будет перенести из диска e: в диск c: допустим
    // там где -го говорилось про mv (не такой как у меня сейчас) который сначала пробует fs.rename а потом уже переносит загрузкой и удаляет старый файл
    // https://reactgo.com/node-move-files/#:~:text=js%20has%20a%20built%2Din,)%3B%20const%20currentPath%20%3D%20path.
    const filePath = contentPathesAndData.contentPath;
    const filePathNew = contentPathesAndData.contentPathNew;
    if (fs.existsSync(filePath)) {
        fs.renameSync(filePath, filePathNew);
    }

    //preview
    generateDir(
        constants.library.dir.public +
            getAppFileSavingPathWithoutFileName(
                contentType,
                parseFolderSequence(folderSequence),
                constants.library.content.extraInfo.preview,
                groupFolder
            )
    );

    const previewPath = contentPathesAndData.contentPreviewPath;
    const previewPathNew = contentPathesAndData.contentPreviewPathNew;
    if (fs.existsSync(previewPath)) {
        fs.renameSync(previewPath, previewPathNew);
    }

    //description
    generateDir(
        constants.library.dir.public +
            getAppFileSavingPathWithoutFileName(
                contentType,
                parseFolderSequence(folderSequence),
                constants.library.content.extraInfo.description,
                groupFolder
            )
    );

    const descriptionPath = contentPathesAndData.contentDescriptionPath;
    const descriptionPathNew = contentPathesAndData.contentDescriptionPathNew;
    if (fs.existsSync(descriptionPath)) {
        fs.renameSync(descriptionPath, descriptionPathNew);
    }

    //fake (там пока ничего поэтому закомментим)
    /*
    generateDir(
        constants.library.dir.public +
            getAppFileSavingPathWithoutFileName(
                contentType,
                parseFolderSequence(folderSequence),
                constants.library.content.extraInfo.description,
                groupFolder
            )
    );

    var oldpreviewNameOriginalFile = contentPathesAndData.contentFakePath;
    var newpreviewNameOriginalFile = contentPathesAndData.contentFakePathNew;
    if (fs.existsSync(oldpreviewNameOriginalFile)) {
        fs.renameSync(oldpreviewNameOriginalFile, newpreviewNameOriginalFile);
    }*/

    await sqlRequest(
        `UPDATE LibrarySchema.Content 
            SET GroupID = ${prepareStringForSqlQuery(groupId)}, 
                Type = ${prepareStringForSqlQuery(contentType)},
                NumberInGroup = ${numberInGroup},
                FolderSequence = ${prepareStringForSqlQuery(folderSequence)}
            WHERE ID = '${id}'`
    );

    return constants.library.status.FINE;
};

// в тех же местах что и перенос делается
exports.deleteContent = async function (contentData) {
    const id = contentData.ID;

    const contentPathesAndData = await getContentPathesAndData(id);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    // content
    const filePath = contentPathesAndData.contentPath;
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    //preview
    const previewPath = contentPathesAndData.contentPreviewPath;
    if (fs.existsSync(previewPath)) {
        fs.unlinkSync(previewPath);
    }

    //description
    const descriptionPath = contentPathesAndData.contentDescriptionPath;
    if (fs.existsSync(descriptionPath)) {
        fs.unlinkSync(descriptionPath);
    }

    //temp (там пока ничего поэтому закомментим)
    /*var oldpreviewNameOriginalFile = contentPathesAndData.contentFakePath;
    if (fs.existsSync(oldpreviewNameOriginalFile)) {
        fs.unlinkSync(oldpreviewNameOriginalFile);
    }*/

    // и удалять связанные с ними группы ещё, если там файлов не осталось а то на сайте они не всегда отображаюися, но на деле они же ещё есть + из файловой системы тоже зачистить
    // + ещё как-то нужно разобратьс с тем моентом, ччто место foldersequence освободилось, как его применить????
    await sqlRequest(
        `DELETE 
            FROM LibrarySchema.Content 
            WHERE ID = '${id}'`
    );

    return constants.library.status.FINE;
};

exports.editContentPreview = async function (contentData, files) {
    if (files) {
        const id = contentData.ID;

        const contentPathesAndData = await getContentPathesAndData(id);
        if (contentPathesAndData === constants.library.status.NOT_FOUND) {
            return contentPathesAndData;
        }

        const previewPath = contentPathesAndData.contentPreviewPath;

        const previewDimensions = sizeOf(files.data);
        const modifiedDimensions = adjustDimensions(
            previewDimensions.width,
            previewDimensions.height
        );

        if (fs.existsSync(previewPath)) {
            fs.unlinkSync(previewPath);
        }

        await sharp(files.data)
            .resize(modifiedDimensions.width, modifiedDimensions.height)
            .toFile(previewPath)
            .then((data) => {
                console.log("fine");
            })
            .catch((err) => {
                console.log("nope");
                logger.error(generateLogMessage(err));
            });

        return constants.library.status.FINE;
    }

    // must be no content preview status
    return constants.library.status.INVALID_CONTENT_PREVIEW_FILE;
};

exports.deleteContentPreview = async function (contentData) {
    const id = contentData.ID;

    const contentPathesAndData = await getContentPathesAndData(id);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    const previewPath = contentPathesAndData.contentPreviewPath;
    if (fs.existsSync(previewPath)) {
        fs.unlinkSync(previewPath);
    }

    return constants.library.status.FINE;
};

exports.setDefaultContentPreview = async function (contentData) {
    const type = constants.library.content.type;
    const id = contentData.ID;

    const customTimestamp = contentData.customTimestamp
        ? contentData.customTimestamp
        : constants.library.preview.timestamp;
    //check custom timestamp with regexp to avoid issues

    var contentPathesAndData = await getContentPathesAndData(id);
    if (contentPathesAndData === constants.library.status.NOT_FOUND) {
        return contentPathesAndData;
    }

    var groupImagePreviewPath = contentPathesAndData.contentPreviewPath;

    var contentPath = contentPathesAndData.contentPath;

    // maybe operation first then try to delete???
    if (fs.existsSync(groupImagePreviewPath)) {
        fs.unlinkSync(groupImagePreviewPath);
    }
    // works only with pics need audio also + comics type path
    //

    var isImage = false;
    switch (contentPathesAndData.contentInfo.Type) {
        case type.image:
        case type.comic:
        case type.comicMini:
            isImage = true;
            break;

        default:
            isImage = false;
            break;
    }

    if (isImage) {
        // try catch block???
        const previewDimensions = sizeOf(contentPath);
        const modifiedDimensions = adjustDimensions(
            previewDimensions.width,
            previewDimensions.height
        );

        // supports only jpg, png, webp, tiff, gif, svg,
        // need bmp, ico, and other files added
        // can file given by path be corrupted with this?? need to check it out

        //shouldn't add try catch every where, operation time increases, check it different way

        await sharp(contentPath)
            .resize(modifiedDimensions.width, modifiedDimensions.height)
            .toFile(groupImagePreviewPath)
            .then((data) => {})
            .catch((err) => {
                logger.error(generateLogMessage(err));
            });
    } else {
        // how weshould deal with it??? if something faiils, how do we know? try catch???
        // also have something like this but for gifs
        // ability for user to choose time stamp for preview?
        // use this for creating  images from videos?

        var width;
        var height;
        await ffprobe(contentPath, { path: ffprobeStatic.path })
            .then(function (info) {
                height = info.streams[0].height;
                width = info.streams[0].width;
            })
            .catch(function (err) {
                logger.error(generateLogMessage(err));
            });

        const modifiedDimensions = adjustDimensions(width, height);

        //  should we allow to load files like wmv that cannot be obrabotani to videos ili разрешать загружать только в другое??? какой от них вообще смысл, если их нельзя вопроизвести???
        var groupImagePreviewPath2 =
            constants.library.dir.public +
            getAppFileSavingPathWithoutFileName(
                contentInfo.recordset[0].Type,
                parseFolderSequence(contentInfo.recordset[0].FolderSequence),
                constants.library.content.extraInfo.preview,
                newDir
            ) +
            "/";

        var contentPath2 = getFileFullName(
            contentInfo.recordset[0].ID,
            constants.library.preview.extension,
            constants.library.content.extraInfo.preview,
            contentNumberInGroup
        );

        try {
            console.log("KEKW? ", contentPath2, groupImagePreviewPath2, customTimestamp);

            // а вот с этими путями ffpmep у меня вообще правильно работает при групповых и не групповых файлах??? при методе добавления
            ffmpeg(contentPath).screenshots({
                timestamps: [customTimestamp],
                filename: contentPath2,
                folder: groupImagePreviewPath2,
                size: `${modifiedDimensions.width}x${modifiedDimensions.height}`,
            });
        } catch (err) {
            logger.error(generateLogMessage(err));
        }
    }

    return constants.library.status.FINE;
};

async function processGroup(contentData) {
    const groupFolderSequence = await getFolderSequence("Groups", contentData.contentType);

    const contentGroupInfo = await getContentGroupInfo(
        contentData.contentGroupNameNew,
        contentData.contentGroupNameExisting,
        contentData.contentType,
        groupFolderSequence
    );

    const groupName = contentGroupInfo.groupName;
    const groupFolder = contentGroupInfo.groupFolder;
    const groupId = contentGroupInfo.groupId;
    const isNewGroup = contentGroupInfo.isNewGroup;

    if (groupName) {
        if (isNewGroup) {
            var additionDateParams = getDateTimeParams(true);
            var additionDate =
                `${additionDateParams[0]}-${additionDateParams[1]}-${additionDateParams[2]} ` +
                `${additionDateParams[3]}:${additionDateParams[4]}:` +
                `${additionDateParams[5]}.${additionDateParams[6]}`;

            var hasGroupPreview = 0;
            await sqlRequest(
                `INSERT 
                    INTO LibrarySchema.Groups 
                        (ID, Name, AdditionDate, Type, HasPreview, FolderSequence) 
                    VALUES 
                        ('${groupId}', ${prepareStringForSqlQuery(groupName)}, 
                        '${additionDate}', '${contentData.contentType}', ${hasGroupPreview}, 
                        '${groupFolderSequence}')`
            );

            // надо как-то от этого огромного куска тоже избавляться
            generateDir(
                constants.library.dir.public +
                    getAppFileSavingPathWithoutFileName(
                        constants.library.content.type.group,
                        parseFolderSequence(groupFolderSequence),
                        constants.library.content.extraInfo.preview
                    ) +
                    `/${groupId}`
            );

            generateDir(
                constants.library.dir.public +
                    getAppFileSavingPathWithoutFileName(
                        constants.library.content.type.group,
                        parseFolderSequence(groupFolderSequence),
                        constants.library.content.extraInfo.description
                    ) +
                    `/${groupId}`
            );

            await loadDescriptionFileToServer(
                getFileSavingPath(
                    groupId,
                    constants.library.description.extension,
                    constants.library.content.type.group,
                    parseFolderSequence(groupFolderSequence),
                    constants.library.content.extraInfo.description
                ),
                ""
            );
        }
    }

    return { groupId, groupFolder };
}

async function getFolderSequence(table, type, groupId = null) {
    var groupQueryPart = "";
    if (groupId) {
        groupQueryPart = `AND GroupID = '${groupId}'`;
    }

    const data = await sqlRequest(
        `SELECT FolderSequence 
            FROM LibrarySchema.${table} 
            WHERE FolderSequence = (
                                    SELECT TOP 1 FolderSequence 
                                        FROM LibrarySchema.${table} 
                                        WHERE Type = '${type}' 
                                        ${groupQueryPart} 
                                        ORDER BY FolderSequence DESC
                                    )
            AND Type = '${type}' 
            ${groupQueryPart}`
    );

    if (!data.recordset || !data.recordset.length) {
        return constants.library.folderSequence.initial;
    }

    var folderSequence = data.recordset[0].FolderSequence;
    var firstLevel = folderSequence.substring(0, 4);
    var secondLevel = folderSequence.substring(4, 8);
    var thirdLevel = folderSequence.substring(8, 12);

    if (data.recordset.length + 1 > constants.library.folderSequence.max) {
        if (parseInt(thirdLevel) + 1 > constants.library.folderSequence.max) {
            if (parseInt(secondLevel) + 1 > constants.library.folderSequence.max) {
                if (parseInt(firstLevel) + 1 > constants.library.folderSequence.max) {
                    logger.error(
                        generateLogMessage(
                            `Невозможно добавить больше файлов. Хранилище ` +
                                `${getContentTypeFolder(type)} переполнено.`
                        )
                    );
                    return constants.library.status.SMTH_BAD;
                } else {
                    firstLevel = parseInt(firstLevel) + 1;
                    secondLevel = 1;
                    thirdLevel = 1;
                }
            } else {
                secondLevel = parseInt(secondLevel) + 1;
                thirdLevel = 1;
            }
        } else {
            thirdLevel = parseInt(thirdLevel) + 1;
        }
    }

    return (
        checkIfFolderSequenceNeedsExtraZeros(firstLevel.toString()) +
        checkIfFolderSequenceNeedsExtraZeros(secondLevel.toString()) +
        checkIfFolderSequenceNeedsExtraZeros(thirdLevel.toString())
    );
}

function checkIfFolderSequenceNeedsExtraZeros(folderSequence) {
    while (folderSequence.length < constants.library.folderSequence.levelLength) {
        folderSequence = "0" + folderSequence;
    }
    return folderSequence;
}

function getContentMainInfo(customContentName, customCreationDate, file) {
    var contentName = customContentName
        ? customContentName
        : getFileNameWithoutExtension(file.name);

    var creationDate = null;
    if (customCreationDate) {
        var creationDateParams = getDateTimeParams(true, customCreationDate);
        creationDate = `${creationDateParams[0]}-${creationDateParams[1]}-${creationDateParams[2]}`;
    }

    var additionDateParams = getDateTimeParams(true);
    var additionDate =
        `${additionDateParams[0]}-${additionDateParams[1]}-${additionDateParams[2]} ` +
        `${additionDateParams[3]}:${additionDateParams[4]}:` +
        `${additionDateParams[5]}.${additionDateParams[6]}`;

    return { contentName, creationDate, additionDate };
}

async function createContentPreview(
    previewFileName,
    imagePreviewFolder,
    contentPreviewFile,
    fileSavingPath,
    width,
    height,
    contentType
) {
    // a lot of problems creating preview of different type of files
    // use try catch in other places like write file and so ons
    if (contentPreviewFile) {
        var previewDimensions;
        try {
            previewDimensions = sizeOf(contentPreviewFile.data);
        } catch (err) {
            // такие несущественные ошибки и ожидаемые может просто логировать нужно?
            logger.error(generateLogMessage(err));
            return false;
        }
        const modifiedDimensions = adjustDimensions(
            previewDimensions.width,
            previewDimensions.height
        );

        return await tryToCreatePreviewFile(
            true,
            modifiedDimensions.width,
            modifiedDimensions.height,
            contentPreviewFile.data,
            imagePreviewFolder,
            previewFileName
        );
    } else {
        const type = constants.library.content.type;
        const modifiedDimensions = adjustDimensions(width, height);
        switch (contentType) {
            case type.comic:
            case type.comicMini:
            case type.image:
                // maybe just add empty preview and use file itself as preview just resized?
                // same as for video, this should be only tried, but it can fail, so we need to create empty preview

                return await tryToCreatePreviewFile(
                    true,
                    modifiedDimensions.width,
                    modifiedDimensions.height,
                    fileSavingPath,
                    imagePreviewFolder,
                    previewFileName
                );

            case type.videoSeries:
            case type.video:
                return await tryToCreatePreviewFile(
                    false,
                    modifiedDimensions.width,
                    modifiedDimensions.height,
                    fileSavingPath,
                    imagePreviewFolder,
                    previewFileName
                );

            default:
                return false;
        }
    }
}

async function getContentAdditionalInfo(fileSavingPath, contentType, contentPreviewFile) {
    const type = constants.library.content.type;
    // a lot of problems taking info from different type of files
    var height = null;
    var width = null;
    var duration = null;

    var hasPreview;
    switch (contentType) {
        case type.image:
        case type.comic:
        case type.comicMini:
            hasPreview = 1;
            try {
                const dimensions = sizeOf(fileSavingPath);
                height = dimensions.height;
                width = dimensions.width;
            } catch (err) {
                logger.error(generateLogMessage(err));
            }
            break;

        case type.video:
        case type.videoSeries:
            hasPreview = 1;
            await ffprobe(fileSavingPath, { path: ffprobeStatic.path })
                .then(function (info) {
                    height = info.streams[0].height;
                    width = info.streams[0].width;
                    duration = info.streams[0].duration;
                })
                .catch(function (err) {
                    logger.error(generateLogMessage(err));
                });
            break;

        case type.sound:
        case type.music:
        case type.storyAudio:
            await ffprobe(fileSavingPath, { path: ffprobeStatic.path })
                .then(function (info) {
                    duration = info.streams[0].duration;
                })
                .catch(function (err) {
                    logger.error(generateLogMessage(err));
                });

            if (contentPreviewFile) {
                hasPreview = 1;
            } else {
                hasPreview = 0;
            }
            break;

        default:
            if (contentPreviewFile) {
                hasPreview = 1;
            } else {
                hasPreview = 0;
            }
            break;
    }

    if (!height) {
        height = null;
    }

    if (!width) {
        width = null;
    }

    if (!duration) {
        duration = null;
    }

    return { width, height, duration, hasPreview };
}

async function getContentNumberInGroup(contentNumberInGroup, contentType, groupId) {
    const type = constants.library.content.type;

    var numberInGroup = null;
    var numberInGroupForAddition = "";

    if (contentNumberInGroup) {
        numberInGroup = parseInt(contentNumberInGroup);
    } else {
        switch (contentType) {
            case type.comic:
            case type.comicMini:
            case type.videoSeries:
            case type.story:
            case type.storyAudio:
            case type.storyInteractive:
            case type.other:
                if (groupId) {
                    const data = await sqlRequest(
                        `SELECT NumberInGroup 
                            FROM LibrarySchema.Content 
                            WHERE GroupID = ${prepareStringForSqlQuery(groupId)} 
                            ORDER BY NumberInGroup ASC`
                    );

                    if (data.recordset && data.recordset.length) {
                        var currentPage = constants.library.content.startNumberInGroup;
                        var i = 0;
                        while (i < data.recordset.length) {
                            if (currentPage !== data.recordset[i].NumberInGroup) {
                                numberInGroup = currentPage;

                                i = data.recordset.length + 1;
                            }
                            currentPage++;
                            i++;
                        }

                        if (i === data.recordset.length) {
                            numberInGroup =
                                data.recordset.length +
                                constants.library.content.startNumberInGroup;
                        }
                    } else {
                        numberInGroup = constants.library.content.startNumberInGroup;
                    }
                }

                break;

            default:
                break;
        }
    }

    if (numberInGroup) {
        numberInGroupForAddition = numberInGroup.toString();
    }

    return { numberInGroup, numberInGroupForAddition };
}

async function getContentGroupInfo(groupNameNew, groupNameExisting, contentType, folderSequence) {
    var groupName = "";
    var groupFolder = "";
    var groupId = null;
    var isNewGroup = false;

    // возможно стоит чтобы был хотя бы 1 символ у группы названия контента или пофиг?
    console.log("wtd2", groupNameNew, groupNameExisting);
    if (groupNameNew || groupNameExisting) {
        if (groupNameNew) {
            groupName = groupNameNew;

            // нормальна ли такая логика вообще???
            // типа группа новая, но мы чекаем есть ли она уже, похоже на костыль, но ладно
            const data = await sqlRequest(
                `SELECT ID 
                    FROM LibrarySchema.Groups 
                    WHERE Name = ${prepareStringForSqlQuery(groupName)} 
                    AND Type = '${contentType}'`
            );

            if (data.recordset && data.recordset.length) {
                groupId = data.recordset[0].ID;
            } else {
                isNewGroup = true;
                groupId = await generateCheckedId(constants.library.id.type.group, "Groups");
            }
        } else {
            groupName = groupNameExisting;

            const data = await sqlRequest(
                `SELECT ID 
                    FROM LibrarySchema.Groups 
                    WHERE Name = ${prepareStringForSqlQuery(groupName)} 
                    AND Type = '${contentType}'`
            );

            groupId = data.recordset[0].ID;
        }

        groupFolder = `${parseFolderSequence(folderSequence)}/${groupId}`;
    }

    return { groupName, groupFolder, groupId, isNewGroup };
}

async function tryToCreatePreviewFile(isImage, width, height, fileToReworkPath, folder, filename) {
    if (isImage) {
        // supports only jpg, png, webp, tiff, gif, svg,
        // need bmp, ico, and other files added
        // can file given by path be corrupted with this?? need to check it out

        //shouldn't add try catch every where, operation time increases, check it different way

        if (!width || !height || width <= 0 || height <= 0) {
            return false;
        }

        return await sharp(fileToReworkPath)
            .resize(width, height)
            .toFile(`${folder}/${filename}`)
            .then((data) => {
                return true;
            })
            .catch((err) => {
                logger.error(generateLogMessage(err));

                return false;
            });
    } else {
        // how weshould deal with it??? if something faiils, how do we know? try catch???
        // also have something like this but for gifs
        // ability for user to choose time stamp for preview?
        // use this for creating images from videos?

        // should we allow to load files like wmv that cannot be obrabotani to videos ili разрешать загружать только в другое??? какой от них вообще смысл, если их нельзя вопроизвести???
        try {
            ffmpeg(fileToReworkPath).screenshots({
                timestamps: [constants.library.preview.timestamp],
                filename: filename,
                folder: folder,
                size: `${width}x${height}`,
            });

            return true;
        } catch (err) {
            logger.error(generateLogMessage(err));

            return false;
        }
    }
}
