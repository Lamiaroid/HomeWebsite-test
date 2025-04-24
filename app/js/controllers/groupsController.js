const _ = require("underscore");

const { getCurrentLocalization, getLocalizedResource } = require("../localizer.js");
const { assemblePage } = require("../helpers/assemblePage.js");
const { getSetting } = require("../settings.js");
const asyncWrap = require("../asyncWrap.js");
const constants = require("../constants.js");
const groupsService = require("../services/groupsService.js");
const extensionWorker = require("../helpers/extensionWorker.js");

exports.getChangeGroupInfoPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.changeGroupInfo;

    const groupNames = await groupsService.getAllGroupNames();

    var groupNamesList = "";
    for (var i = 0; i < groupNames.length; i++) {
        console.log("this is group type ", groupNames[i].Type);
        if (groupNames[i].Name) {
            groupNamesList += `<option class="${groupNames[i].Type}" value="${groupNames[i].Name}">${groupNames[i].Name}</option>`;
        }
    }

    const html = await assemblePage(
        constants.library.page.changeGroupNameHead,
        constants.library.page.changeGroupNameBody
    );

    const templ = _.template(html);

    return response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: constants.library.api.main,
            cssTheme: getSetting("theme"),

            groupNamesList: groupNamesList,
            localization: getCurrentLocalization(),
            groupName: getLocalizedResource(`${locPart}.GroupName`),
            preview: getLocalizedResource(`${locPart}.Preview`),
            readyToChange: getLocalizedResource(`${locPart}.ReadyToChange`),
            deletePreview: getLocalizedResource(`${locPart}.DeletePreview`),
            contentType: getLocalizedResource(`${locPart}.ContentType`),
            newPreview: getLocalizedResource(`${locPart}.NewPreview`),
            noPreview: getLocalizedResource(`${locPart}.NoPreview`),
            updateGroupInfoAction: `${constants.library.api.main}${constants.library.api.updateGroupInfo}`,
        })
    );
});

exports.changeGroupInfo = asyncWrap(async function (request, response) {
    // shouldn't be named like that but uses same naming as add content so okay???
    const locPart = constants.library.localization.addNewContentUploadProcess;
    const status = constants.library.status;

    const info = await groupsService.changeGroupInfo(request.body, request.files);

    var locReason;
    var extraInfo = "";
    if (info !== status.FINE) {
        switch (info) {
            case status.MAX_CONTENT_PATH_LENGTH_EXCEEDED:
                locReason = "MaxContentPathLengthExceeded";
                extraInfo = constants.library.content.maxPathLength;
                break;

            case status.MAX_CONTENT_GROUP_NAME_LENGTH_EXCEEDED:
                locReason = "MaxContentGroupNameLengthExceeded";
                extraInfo = constants.library.content.maxGroupNameLength;
                break;

            case status.CONTENT_GROUP_NAME_REQUIRED:
                locReason = "ContentGroupNameRequired";
                break;

            case status.CONTENT_GROUP_ALREADY_EXISTS:
                locReason = "ContentGroupAlreadyExists";
                break;

            case status.INVALID_CONTENT_PREVIEW_FILE:
                locReason = "InvalidContentPreviewFile";
                extraInfo = extensionWorker.generateString(extensionWorker.preview);
                break;

            default:
                locReason = "SomethingWentWrong";
                break;
        }

        return response
            .status(400)
            .send(getLocalizedResource(`${locPart}.${locReason}`) + `${extraInfo}.<br>`);
    }

    return response.redirect(
        `${constants.library.api.main}${constants.library.api.changeGroupInfo}`
    );
});

exports.deleteGroupPreview = asyncWrap(async function (request, response) {
    await groupsService.deleteGroupPreview(request.body.groupName, request.body.contentType);

    return response.redirect(
        `${constants.library.api.main}${constants.library.api.changeGroupInfo}`
    );
});

exports.getGroupInfo = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.changeGroupInfo;
    const type = constants.library.content.type;

    const info = await groupsService.getGroupInfo(
        request.body.contentType,
        request.body.groupOriginalName
    );

    var locTitle = "";
    switch (request.body.contentType) {
        case type.comic:
            locTitle = "Comic";
            break;

        case type.comicMini:
            locTitle = "ComicMini";
            break;

        case type.story:
            locTitle = "Story";
            break;

        case type.storyAudio:
            locTitle = "StoryAudio";
            break;

        case type.storyInteractive:
            locTitle = "StoryInteractive";
            break;

        case type.videoSeries:
            locTitle = "VideoSeries";
            break;

        case type.other:
            locTitle = "Other";
            break;

        default:
            break;
    }

    info.localizedContentType = getLocalizedResource(`${locPart}.${locTitle}`);

    return response.status(200).send(info);
});
