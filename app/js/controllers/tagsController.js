const _ = require("underscore");

const { getCurrentLocalization, getLocalizedResource } = require("../localizer.js");
const { assemblePage } = require("../helpers/assemblePage.js");
const { getSetting } = require("../settings.js");
const asyncWrap = require("../asyncWrap.js");
const tagsService = require("../services/tagsService.js");
const constants = require("../constants.js");

exports.getAddNewTagPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.addNewTag;

    const html = await assemblePage(
        constants.library.page.addNewTagHead,
        constants.library.page.addNewTagBody
    );

    const templ = _.template(html);

    return response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: constants.library.api.main,
            cssTheme: getSetting("theme"),

            localization: getCurrentLocalization(),
            tagName: getLocalizedResource(`${locPart}.TagName`),
            readyToAdd: getLocalizedResource(`${locPart}.ReadyToAdd`),
            uploadTagAction: `${constants.library.api.main}${constants.library.api.uploadTag}`,
        })
    );
});

exports.addNewTag = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.addNewTagUploadProcess;
    const status = constants.library.status;

    const info = await tagsService.addNewTag(request.body.tagName);

    var locReason;
    var extraInfo = "";
    if (info !== status.FINE) {
        switch (info) {
            case status.MAX_TAG_NAME_LENGTH_EXCEEDED:
                locReason = "MaxTagNameLengthExceeded";
                extraInfo = constants.library.tag.maxNameLength;
                break;

            case status.TAG_NAME_REQUIRED:
                locReason = "TagNameRequired";
                break;

            case status.TAG_ALREADY_EXISTS:
                locReason = "TagAlreadyExists";
                break;

            default:
                locReason = "SomethingWentWrong";
                break;
        }

        return response
            .status(400)
            .send(getLocalizedResource(`${locPart}.${locReason}`) + `${extraInfo}.<br>`);
    }

    return response.status(200).redirect(constants.library.api.main);
});

exports.getChangeTagInfoPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.changeTag;

    const info = await tagsService.getTagInfo();

    var tagsList = "";
    for (var i = 0; i < info.length; i++) {
        tagsList += `<option class="tag-container">${info[i].Name}</option>`;
    }

    const html = await assemblePage(
        constants.library.page.changeTagHead,
        constants.library.page.changeTagBody
    );

    const templ = _.template(html);

    return response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: constants.library.api.main,
            cssTheme: getSetting("theme"),

            localization: getCurrentLocalization(),
            tagsList: tagsList,
            tagName: getLocalizedResource(`${locPart}.TagName`),
            readyToChange: getLocalizedResource(`${locPart}.ReadyToChange`),
            deleteTag: getLocalizedResource(`${locPart}.DeleteTag`),
            updateTagAction: `${constants.library.api.main}${constants.library.api.updateTag}`,
            deleteTagAction: `${constants.library.api.main}${constants.library.api.deleteTag}`,
        })
    );
});

exports.changeTagInfo = asyncWrap(async function (request, response) {
    // should be same as for add tag, but is this right, shouldn't it be renamed???
    const locPart = constants.library.localization.addNewTagUploadProcess;
    const status = constants.library.status;

    const info = await tagsService.changeTagInfo(
        request.body.tagName,
        request.body.tagOriginalName
    );

    var locReason;
    var extraInfo = "";
    if (info !== status.FINE) {
        switch (info) {
            case status.MAX_TAG_NAME_LENGTH_EXCEEDED:
                locReason = "MaxTagNameLengthExceeded";
                extraInfo = constants.library.tag.maxNameLength;
                break;

            case status.TAG_NAME_REQUIRED:
                locReason = "TagNameRequired";
                break;

            case status.TAG_ALREADY_EXISTS:
                locReason = "TagAlreadyExists";
                break;

            default:
                locReason = "SomethingWentWrong";
                break;
        }

        return response
            .status(400)
            .send(getLocalizedResource(`${locPart}.${locReason}`) + `${extraInfo}.<br>`);
    }

    return response
        .status(200)
        .redirect(`${constants.library.api.main}${constants.library.api.changeTag}`);
});

exports.deleteTag = asyncWrap(async function (request, response) {
    await tagsService.deleteTag(request.body.tagOriginalName);

    return response
        .status(200)
        .redirect(`${constants.library.api.main}${constants.library.api.changeTag}`);
});

exports.getTagInfo = asyncWrap(async function (request, response) {
    const info = await tagsService.getTagInfo(request.body.tagOriginalName);

    return response.status(200).send(info);
});

exports.getAllTagsInfo = asyncWrap(async function (request, response) {
    const info = await tagsService.getTagInfo();

    return response.status(200).send(info);
});
