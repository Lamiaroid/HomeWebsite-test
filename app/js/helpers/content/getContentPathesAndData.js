const { getFileSavingPath, parseFolderSequence } = require("../commonHelpers.js");
const { sqlRequest } = require("../../sql.js");
const constants = require("../../constants.js");

async function getContentPathesAndData(id, extraData = null) {
    const dataContent = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Content 
            WHERE ID = '${id}'`
    );

    if (dataContent.recordset && dataContent.recordset.length) {
        return constants.library.status.NOT_FOUND;
    }

    var contentInfo = dataContent.recordset[0];

    const dataGroup = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Groups 
            WHERE ID = '${contentInfo.GroupID}'`
    );

    var groupInfo = null;
    var groupFolder = "";
    if (dataGroup.recordset && dataGroup.recordset.length) {
        groupInfo = dataGroup.recordset[0];
        groupFolder = `${parseFolderSequence(groupInfo.FolderSequence)}/${groupInfo.ID}`;
    }

    var contentNumberInGroup = "";
    if (contentInfo.NumberInGroup) {
        contentNumberInGroup = contentInfo.NumberInGroup;
    }

    const contentPath = getFileSavingPath(
        contentInfo.ID,
        contentInfo.Extension,
        contentInfo.Type,
        parseFolderSequence(contentInfo.FolderSequence),
        "",
        groupFolder,
        contentNumberInGroup
    );

    const contentPreviewPath = getFileSavingPath(
        contentInfo.ID,
        constants.library.preview.extension,
        contentInfo.Type,
        parseFolderSequence(contentInfo.FolderSequence),
        constants.library.content.extraInfo.preview,
        groupFolder,
        contentNumberInGroup
    );

    const contentDescriptionPath = getFileSavingPath(
        contentInfo.ID,
        constants.library.description.extension,
        contentInfo.Type,
        parseFolderSequence(contentInfo.FolderSequence),
        constants.library.content.extraInfo.description,
        groupFolder,
        contentNumberInGroup
    );
    /*
    var contentPathFake = getFileSavingPath(
        contentInfo.ID,
        contentInfo.Extension,
        contentInfo.Type,
        parseFolderSequence(contentInfo.FolderSequence),
        "",
        groupFolder,
        contentNumberInGroup
    );*/

    var contentPathNew = null;
    var contentPreviewPathNew = null;
    var contentDescriptionPathNew = null;
    if (extraData) {
        contentInfo.Type = extraData.type ? extraData.type : contentInfo.Type;
        contentInfo.FolderSequence = extraData.folderSequence
            ? extraData.folderSequence
            : contentInfo.FolderSequence;
        contentNumberInGroup = extraData.numberInGroup
            ? extraData.numberInGroup
            : contentNumberInGroup;
        groupFolder = extraData.groupFolder ? extraData.groupFolder : groupFolder;

        contentPathNew = getFileSavingPath(
            contentInfo.ID,
            contentInfo.Extension,
            contentInfo.Type,
            parseFolderSequence(contentInfo.FolderSequence),
            "",
            groupFolder,
            contentNumberInGroup
        );

        contentPreviewPathNew = getFileSavingPath(
            contentInfo.ID,
            constants.library.preview.extension,
            contentInfo.Type,
            parseFolderSequence(contentInfo.FolderSequence),
            constants.library.content.extraInfo.preview,
            groupFolder,
            contentNumberInGroup
        );

        contentDescriptionPathNew = getFileSavingPath(
            contentInfo.ID,
            constants.library.description.extension,
            contentInfo.Type,
            parseFolderSequence(contentInfo.FolderSequence),
            constants.library.content.extraInfo.description,
            groupFolder,
            contentNumberInGroup
        );
        /*
        var contentPathFakeNew = getFileSavingPath(
            contentInfo.ID,
            contentInfo.Extension,
            contentInfo.Type,
            parseFolderSequence(contentInfo.FolderSequence),
            "",
            groupFolder,
            contentNumberInGroup
        );*/
    }

    return {
        contentInfo,
        groupInfo,
        contentPath,
        contentPreviewPath,
        contentDescriptionPath,
        //  contentFakePath,
        contentPathNew,
        contentPreviewPathNew,
        contentDescriptionPathNew,
        //   contentFakePathNew,
    };
}

module.exports = { getContentPathesAndData };
