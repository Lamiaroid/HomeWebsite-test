const fs = require("fs");
const sizeOf = require("image-size");
const sharp = require("sharp");

const {
    getContentTypeFolder,
    adjustDimensions,
    prepareStringForSqlQuery,
    parseFolderSequence,
} = require("../helpers/commonHelpers.js");
const { sqlRequest } = require("../sql.js");
const { updateGroupInfoChecker } = require("../helpers/checker.js");
const constants = require("../constants.js");

exports.getAllGroupNames = async function () {
    const info = await sqlRequest(
        `SELECT Type, Name 
            FROM LibrarySchema.Groups`
    );

    return info.recordset;
};

exports.getGroupInfo = async function (contentType, groupName) {
    // should change this to id
    const data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Groups 
            WHERE Type = '${contentType}' 
            AND Name = ${prepareStringForSqlQuery(groupName)}`
    );

    var hasPreview = true;
    var groupPreviewPath =
        `${constants.library.folder.preview}` +
        `${getContentTypeFolder(constants.library.content.type.group)}` +
        `${parseFolderSequence(data.recordset[0].FolderSequence)}/${data.recordset[0].ID}` +
        `${constants.library.content.extraInfo.preview}.${constants.library.preview.extension}`;

    if (!fs.existsSync(constants.library.dir.public + groupPreviewPath)) {
        groupPreviewPath = `${constants.library.folder.art}/${constants.library.preview.default.image}`;
        hasPreview = false;
    }

    return { groupPreviewPath, hasPreview };
};

exports.changeGroupInfo = async function (groupData, files) {
    const contentType = groupData.contentType;
    const groupName = groupData.groupName;
    const groupNameOriginal = groupData.groupNameOriginal;

    const checkResult = await updateGroupInfoChecker(
        contentType,
        groupName,
        groupNameOriginal,
        files
    );

    if (checkResult !== constants.library.status.FINE) {
        return checkResult;
    }

    await sqlRequest(
        `UPDATE LibrarySchema.Groups 
            SET Name = ${prepareStringForSqlQuery(groupName)} 
            WHERE Name = ${prepareStringForSqlQuery(groupNameOriginal)} 
            AND Type = ${prepareStringForSqlQuery(contentType)}`
    );

    const groupInfo = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Groups 
            WHERE Name = ${prepareStringForSqlQuery(groupName)} 
            AND Type = ${prepareStringForSqlQuery(contentType)}`
    );

    // later; write new group name in file

    const oldpreviewName =
        `${constants.library.dir.contentPreview + constants.library.folder.contentType.group}` +
        `${parseFolderSequence(groupInfo.recordset[0].FolderSequence)}` +
        `/${groupInfo.recordset[0].ID}` +
        `${constants.library.content.extraInfo.preview}.${constants.library.preview.extension}`;

    if (files) {
        if (fs.existsSync(oldpreviewName)) {
            fs.unlinkSync(oldpreviewName);
        }

        const previewDimensions = sizeOf(files.groupPreview.data);
        const modifiedDimensions = adjustDimensions(
            previewDimensions.width,
            previewDimensions.height
        );

        await sharp(files.groupPreview.data)
            .resize(modifiedDimensions.width, modifiedDimensions.height)
            .toFile(oldpreviewName)
            .then((data) => {})
            .catch((err) => {});
    }

    return constants.library.status.FINE;
};

exports.deleteGroupPreview = async function (groupName, contentType) {
    const data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Groups 
            WHERE Type = '${contentType}' 
            AND Name = ${prepareStringForSqlQuery(groupName)}`
    );

    const groupImagePreviewPath =
        `${constants.library.dir.contentPreview + constants.library.folder.contentType.group}` +
        `${parseFolderSequence(data.recordset[0].FolderSequence)}` +
        `/${data.recordset[0].ID}` +
        `${constants.library.content.extraInfo.preview}.${constants.library.preview.extension}`;

    if (fs.existsSync(groupImagePreviewPath)) {
        fs.unlinkSync(groupImagePreviewPath);
    }

    return constants.library.status.FINE;
};
