const _ = require("underscore");

const { assemblePage } = require("../helpers/assemblePage.js");
const { createContentTypesHtmlBlock, createContentTypesHtmlBlockWithPreselectedType } = require("../helpers/htmlBlocks.js");
const { getCurrentLocalization, getLocalizedResource } = require("../localizer.js");
const { modifyHtmlFile } = require("../helpers/commonHelpers.js");
const { getSetting } = require("../settings.js");
const asyncWrap = require("../asyncWrap.js");
const constants = require("../constants.js");
const contentService = require("../services/contentService.js");
const authorsService = require("../services/authorsService.js");
const groupsService = require("../services/groupsService.js");
const extensionWorker = require("../helpers/extensionWorker.js");
const contentProcessor = require("../helpers/content/contentProcessor.js");

exports.addTagsToContent = asyncWrap(async function (request, response) {
    const info = await contentService.addTagsToContent(request.body.tagName, request.body.postID);
    // может во всех таких и похожих случаях должно быть не нотт фаунд, а какая нибудь другая ошибка? всвё таки пользователь здесь ничего не вводи вроде как, я сам формировал
    if (info === constants.library.status.NOT_FOUND) {
        // что делаем?
    }

    return response.redirect(request.body.currentURL);
});

exports.applySuggestedExtension = asyncWrap(async function (request, response) {
    const info = await contentService.applySuggestedExtension(request.body.contentID);
    if (info === constants.library.status.NOT_FOUND) {
        // что делаем?
    }

    return response.redirect(request.body.currentURL);
});

exports.addToFavourite = asyncWrap(async function (request, response) {
    const info = await contentService.addToFavourite(request.body.contentID);
    if (info === constants.library.status.NOT_FOUND) {
        // что делаем?
    }

    return response.redirect(request.body.currentURL);
});

exports.addToDeleted = asyncWrap(async function (request, response) {
    const info = await contentService.addToDeleted(request.body.contentID);
    if (info === constants.library.status.NOT_FOUND) {
        // что делаем?
    }

    return response.redirect(request.body.currentURL);
});

exports.copyContent = asyncWrap(async function (request, response) {
    const statusText = await contentService.copyContent(request.body.contentID);
    if (statusText === constants.library.status.NOT_FOUND) {
        // что делаем?
    }

    response.status(200).send({ status: statusText });
});

exports.getEditContentInfoPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.addNewContent;

    const info = await contentService.getContentInfo(request.body.contentID);

    const authors = await authorsService.getAuthorInfo(false);

    var selected = false;
    var selectedVal = "";
    var authorsList = "";
    for (var i = 0; i < authors.length; i++) {
        if (info.author === authors[i].Name && !selected) {
            selected = true;
            selectedVal = " selected";
        }
        authorsList += `<option value="${authors[i].Name}"${selectedVal}>` + `${authors[i].Name}` + `</option>`;
        selectedVal = "";
    }

    if (!selected) {
        selectedVal = " selected";
    }

    authorsList =
        `<option value="${constants.library.content.noContentAuthor}"${selectedVal}>` +
        `--(${getLocalizedResource(`${locPart}.NoContentAuthorOption`)})--` +
        `</option>` +
        authorsList;

    const htmlBody = await modifyHtmlFile(constants.library.page.editContentBody);
    const htmlHead = await modifyHtmlFile(constants.library.page.editContentHead);

    const templ = _.template(htmlBody);

    info.body = templ({
        authorsList: authorsList,
        contentName: getLocalizedResource(`${locPart}.ContentName`),
        contentNameValue: info.name,
        author: getLocalizedResource(`${locPart}.Author`),
        creationDate: getLocalizedResource(`${locPart}.CreationDate`),
        creationDateValue: info.creationDate,
        description: getLocalizedResource(`${locPart}.Description`),
        descriptionValue: info.description,
        linkToOriginal: getLocalizedResource(`${locPart}.LinkToOriginal`),
        linkToOriginalValue: info.linkToOriginal,
        required: getLocalizedResource(`${locPart}.Required`),
        readyToAdd: getLocalizedResource(`${locPart}.ReadyToAdd`),
        contentTypeEdit: info.contentType,
        contentEditingFormAction: `${constants.library.api.main}${constants.library.api.editContent}`,
    });

    info.head = htmlHead;

    return response.status(200).send(info);
});

exports.getEditContentTypePage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.addNewContent;
    const type = constants.library.content.type;

    const info = await contentService.getContentTypeInfo(request.body.contentID, true);
    if (info === constants.library.status.NOT_FOUND) {
        // что делаем?
    }

    const contentTypesList = createContentTypesHtmlBlockWithPreselectedType(
        info.type,
        {
            id: "image-type",
            optionValue: type.image,
            optionTitle: getLocalizedResource(`${locPart}.Image`),
        },
        {
            id: "video-type",
            optionValue: type.video,
            optionTitle: getLocalizedResource(`${locPart}.Video`),
        },
        {
            id: "comic-type",
            optionValue: type.comic,
            optionTitle: getLocalizedResource(`${locPart}.Comic`),
        },
        {
            id: "comicMini-type",
            optionValue: type.comicMini,
            optionTitle: getLocalizedResource(`${locPart}.ComicMini`),
        },
        {
            id: "videoSeries-type",
            optionValue: type.videoSeries,
            optionTitle: getLocalizedResource(`${locPart}.VideoSeries`),
        },
        {
            id: "music-type",
            optionValue: type.music,
            optionTitle: getLocalizedResource(`${locPart}.Music`),
        },
        {
            id: "sound-type",
            optionValue: type.sound,
            optionTitle: getLocalizedResource(`${locPart}.Sound`),
        },
        {
            id: "story-type",
            optionValue: type.story,
            optionTitle: getLocalizedResource(`${locPart}.Story`),
        },
        {
            id: "storyAudio-type",
            optionValue: type.storyAudio,
            optionTitle: getLocalizedResource(`${locPart}.StoryAudio`),
        },
        {
            id: "storyInteractive-type",
            optionValue: type.storyInteractive,
            optionTitle: getLocalizedResource(`${locPart}.StoryInteractive`),
        },
        {
            id: "other-type",
            optionValue: type.other,
            optionTitle: getLocalizedResource(`${locPart}.Other`),
        }
    );

    const groupNames = await groupsService.getAllGroupNames();

    var selected = false;
    var selectedVal = "";
    var groupNamesList = "";
    console.log("group name we need", info.groupName);
    for (var i = 0; i < groupNames.length; i++) {
        if (groupNames[i].Name) {
            if (groupNames[i].Name === info.groupName && !selected) {
                selected = true;
                selectedVal = ' selected id="current-group"';
            }
            groupNamesList +=
                `<option class="${groupNames[i].Type}" value="${groupNames[i].Name}"${selectedVal}>` + `${groupNames[i].Name}` + `</option>`;

            selectedVal = "";
        }
    }

    const htmlBody = await modifyHtmlFile(constants.library.page.editContentTypeBody);
    const htmlHead = await modifyHtmlFile(constants.library.page.editContentTypeHead);

    const templ = _.template(htmlBody);

    info.body = templ({
        authorsList: "authorsList",
        contentTypesList: contentTypesList,
        groupNamesList: groupNamesList,
        localization: getCurrentLocalization(),
        contentName: getLocalizedResource(`${locPart}.ContentName`),
        contentNameValue: info.name,
        filesToAdd: getLocalizedResource(`${locPart}.FilesToAdd`),
        singleFile: getLocalizedResource(`${locPart}.SingleFile`),
        multipleFiles: getLocalizedResource(`${locPart}.MultipleFiles`),
        multipleFilesUploadWarning: getLocalizedResource(`${locPart}.MultipleFilesUploadWarning`),
        author: getLocalizedResource(`${locPart}.Author`),
        creationDate: getLocalizedResource(`${locPart}.CreationDate`),
        creationDateValue: info.creationDate,
        description: getLocalizedResource(`${locPart}.Description`),
        descriptionValue: info.description,
        contentType: getLocalizedResource(`${locPart}.ContentType`),
        createNewGroup: getLocalizedResource(`${locPart}.CreateNewGroup`),
        addToExistingGroup: getLocalizedResource(`${locPart}.AddToExistingGroup`),
        newGroupName: getLocalizedResource(`${locPart}.NewGroupName`),
        chooseExistingGroupName: getLocalizedResource(`${locPart}.ChooseExistingGroupName`),
        numberInGroup: getLocalizedResource(`${locPart}.NumberInGroup`),
        numberInGroupValue: info.numberInGroup,
        preview: getLocalizedResource(`${locPart}.Preview`),
        required: getLocalizedResource(`${locPart}.Required`),
        readyToAdd: getLocalizedResource(`${locPart}.ReadyToAdd`),
        loading: getLocalizedResource(`${locPart}.Loading`),
        processing: getLocalizedResource(`${locPart}.Processing`),
        contentTypeEdit: info.contentType,
        contentEditingTypeFormAction: `${constants.library.api.main}${constants.library.api.editContentType}`,
    });

    info.head = htmlHead;

    return response.status(200).send(info);
});

exports.getEditContentPreviewPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.addNewContent;

    const info = await contentService.getContentPreviewInfo(request.body.contentID, true);
    if (info === constants.library.status.NOT_FOUND) {
        // что делаем?
    }

    const htmlBody = await modifyHtmlFile(constants.library.page.editContentPreviewBody);
    const htmlHead = await modifyHtmlFile(constants.library.page.editContentPreviewHead);

    const templ = _.template(htmlBody);

    var invisible = "";
    if (info.hasPreview) {
        invisible = " invisible";
    }

    info.body = templ({
        newPreview: "Новое превью",
        noPreview: "Нет превью",
        deletePreview: "Удалить превью",
        defaultPreview: "Поставить дефолтный превью",
        createPreviewFromMoment: "Создать из момента в процентах (например 40%), секундах (например 30.5) или обычном формате (например 01:10.125)",
        contentPreviewPath: info.contentPreviewPath,
        hasPreview: invisible,
        required: getLocalizedResource(`${locPart}.Required`),
        readyToAdd: getLocalizedResource(`${locPart}.ReadyToAdd`),
        contentEditingPreviewFormAction: `${constants.library.api.main}${constants.library.api.editContentPreview}`,
    });

    info.head = htmlHead;

    return response.status(200).send(info);
});

exports.getAddNewContentPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.addNewContent;
    const type = constants.library.content.type;

    const contentTypesList = createContentTypesHtmlBlock(
        {
            id: "image-type",
            optionValue: type.image,
            optionTitle: getLocalizedResource(`${locPart}.Image`),
        },
        {
            id: "video-type",
            optionValue: type.video,
            optionTitle: getLocalizedResource(`${locPart}.Video`),
        },
        {
            id: "comic-type",
            optionValue: type.comic,
            optionTitle: getLocalizedResource(`${locPart}.Comic`),
        },
        {
            id: "comicMini-type",
            optionValue: type.comicMini,
            optionTitle: getLocalizedResource(`${locPart}.ComicMini`),
        },
        {
            id: "videoSeries-type",
            optionValue: type.videoSeries,
            optionTitle: getLocalizedResource(`${locPart}.VideoSeries`),
        },
        {
            id: "music-type",
            optionValue: type.music,
            optionTitle: getLocalizedResource(`${locPart}.Music`),
        },
        {
            id: "sound-type",
            optionValue: type.sound,
            optionTitle: getLocalizedResource(`${locPart}.Sound`),
        },
        {
            id: "story-type",
            optionValue: type.story,
            optionTitle: getLocalizedResource(`${locPart}.Story`),
        },
        {
            id: "storyAudio-type",
            optionValue: type.storyAudio,
            optionTitle: getLocalizedResource(`${locPart}.StoryAudio`),
        },
        {
            id: "storyInteractive-type",
            optionValue: type.storyInteractive,
            optionTitle: getLocalizedResource(`${locPart}.StoryInteractive`),
        },
        {
            id: "other-type",
            optionValue: type.other,
            optionTitle: getLocalizedResource(`${locPart}.Other`),
        }
    );

    const authors = await authorsService.getAuthorInfo(false);

    var authorsList = "";
    for (var i = 0; i < authors.length; i++) {
        authorsList += `<option value="${authors[i].Name}">` + `${authors[i].Name}` + `</option>`;
    }

    const groupNames = await groupsService.getAllGroupNames();

    var groupNamesList = "";
    for (var i = 0; i < groupNames.length; i++) {
        if (groupNames[i].Name) {
            groupNamesList += `<option class="${groupNames[i].Type}" value="${groupNames[i].Name}">` + `${groupNames[i].Name}` + `</option>`;
        }
    }

    const html = await assemblePage(constants.library.page.addNewContentHead, constants.library.page.addNewContentBody);

    const templ = _.template(html);

    return response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: `${constants.library.api.main}`,
            // currently only dark theme for this as we have problems with templ
            cssTheme: getSetting("theme"),

            authorsList: authorsList,
            contentTypesList: contentTypesList,
            groupNamesList: groupNamesList,
            localization: getCurrentLocalization(),
            contentName: getLocalizedResource(`${locPart}.ContentName`),
            filesToAdd: getLocalizedResource(`${locPart}.FilesToAdd`),
            singleFile: getLocalizedResource(`${locPart}.SingleFile`),
            multipleFiles: getLocalizedResource(`${locPart}.MultipleFiles`),
            multipleFilesUploadWarning: getLocalizedResource(`${locPart}.MultipleFilesUploadWarning`),
            author: getLocalizedResource(`${locPart}.Author`),
            noContentAuthorOption: getLocalizedResource(`${locPart}.NoContentAuthorOption`),
            creationDate: getLocalizedResource(`${locPart}.CreationDate`),
            description: getLocalizedResource(`${locPart}.Description`),
            linkToOriginal: getLocalizedResource(`${locPart}.LinkToOriginal`),
            contentType: getLocalizedResource(`${locPart}.ContentType`),
            createNewGroup: getLocalizedResource(`${locPart}.CreateNewGroup`),
            addToExistingGroup: getLocalizedResource(`${locPart}.AddToExistingGroup`),
            newGroupName: getLocalizedResource(`${locPart}.NewGroupName`),
            chooseExistingGroupName: getLocalizedResource(`${locPart}.ChooseExistingGroupName`),
            numberInGroup: getLocalizedResource(`${locPart}.NumberInGroup`),
            preview: getLocalizedResource(`${locPart}.Preview`),
            required: getLocalizedResource(`${locPart}.Required`),
            readyToAdd: getLocalizedResource(`${locPart}.ReadyToAdd`),
            loading: getLocalizedResource(`${locPart}.Loading`),
            processing: getLocalizedResource(`${locPart}.Processing`),
            noAuthorValue: constants.library.content.noContentAuthor,
            contentUploadingFormAction: `${constants.library.api.main}${constants.library.api.uploadContent}`,
        })
    );
});

exports.checkProcessingStatus = asyncWrap(function (request, response) {
    return response.status(200).send(contentProcessor.getContentProccesingInfo());
});

exports.addNewContent = asyncWrap(async function (request, response) {
    const info = await contentService.addNewContent(request.body, request.files);

    var allProblems = getAllProblems(info, request);
    if (allProblems !== constants.library.status.FINE) {
        return response.status(400).send(allProblems);
    }

    return response.status(200).send({ url: constants.library.api.main + constants.library.api.addNewContent });
});

exports.editContentInfo = asyncWrap(async function (request, response) {
    const info = await contentService.editContentInfo(request.body);

    var allProblems = getAllProblems(info, request);
    if (allProblems !== constants.library.status.FINE) {
        return response.status(400).send(allProblems);
    }

    // будет неправильный урл. если допустим менять картинку с перехода на картинку по авторам и сменить автора, тоже самое с типами, нужно будет менять урл
    return response.status(200).send({ url: request.body.currentURL });
});

exports.editContentPreview = asyncWrap(async function (request, response) {
    const info = await contentService.editContentPreview(request.body, request.files);

    var allProblems = getAllProblems(info, request);
    if (allProblems !== constants.library.status.FINE) {
        return response.status(400).send(allProblems);
    }

    return response.status(200).send({ url: request.body.currentURL });
});

exports.editContentType = asyncWrap(async function (request, response) {
    const info = await contentService.editContentType(request.body);

    var allProblems = getAllProblems(info, request);
    if (allProblems !== constants.library.status.FINE) {
        return response.status(400).send(allProblems);
    }

    return response.status(200).send({ url: request.body.currentURL });
});

exports.deleteContent = asyncWrap(async function (request, response) {
    const info = await contentService.deleteContent(request.body);

    var allProblems = getAllProblems(info, request);
    if (allProblems !== constants.library.status.FINE) {
        return response.status(400).send(allProblems);
    }

    return response.status(200).send({ url: request.body.currentURL });
});

exports.deleteContentPreview = asyncWrap(async function (request, response) {
    const info = await contentService.deleteContentPreview(request.body);

    var allProblems = getAllProblems(info, request);
    if (allProblems !== constants.library.status.FINE) {
        return response.status(400).send(allProblems);
    }

    return response.status(200).send({ url: request.body.currentURL });
});

exports.setDefaultContentPreview = asyncWrap(async function (request, response) {
    const info = await contentService.setDefaultContentPreview(request.body);

    var allProblems = getAllProblems(info, request);
    if (allProblems !== constants.library.status.FINE) {
        return response.status(400).send(allProblems);
    }

    return response.status(200).send({ url: request.body.currentURL });
});

function getAllProblems(info, request) {
    const locPart = constants.library.localization.addNewContentUploadProcess;
    const status = constants.library.status;
    const type = constants.library.content.type;

    var allProblems = "";
    var allProblemsCount = 0;
    var locReason = "";
    var extraInfo = "";
    for (var i = 0; i < info.length; i++) {
        if (info[i] !== status.FINE) {
            switch (info[i]) {
                case status.NO_CONTENT_FILE_PROVIDED:
                    locReason = "NoContentFileProvided";
                    break;

                case status.MAX_CONTENT_NAME_LENGTH_EXCEEDED:
                    locReason = "MaxContentNameLengthExceeded";
                    extraInfo = constants.library.content.maxNameLength;
                    break;

                case status.MAX_CONTENT_EXTENSION_LENGTH_EXCEEDED:
                    locReason = "MaxContentExtensionLengthExceeded";
                    extraInfo = constants.library.content.maxExtensionLength;
                    break;

                case status.MAX_CONTENT_PATH_LENGTH_EXCEEDED:
                    locReason = "MaxContentPathLengthExceeded";
                    extraInfo = constants.library.content.maxPathLength;
                    break;

                case status.MAX_CONTENT_GROUP_NAME_LENGTH_EXCEEDED:
                    locReason = "MaxContentGroupNameLengthExceeded";
                    extraInfo = constants.library.content.maxGroupNameLength;
                    break;

                case status.CONTENT_NUMBER_IN_GROUP_IS_SMALLER_THAN_MINIMUM_ALLOWED:
                    locReason = "ContentNumberInGroupIsSmallerThanMinimumAllowed";
                    extraInfo = constants.library.content.startNumberInGroup;
                    break;

                case status.CONTENT_NUMBER_IN_GROUP_IS_BIGGER_THAN_MAXIMUM_ALLOWED:
                    locReason = "ContentNumberInGroupIsBiggerThanMaximumAllowed";
                    extraInfo = constants.library.content.maxNumberInGroup;
                    break;

                case status.INVALID_CONTENT_PREVIEW_FILE:
                    locReason = "InvalidContentPreviewFile";
                    extraInfo = extensionWorker.generateString(extensionWorker.preview);
                    break;

                case status.INVALID_CONTENT_FILE_FOR_THIS_CONTENT_TYPE:
                    locReason = "InvalidContentFileForThisContentType";
                    switch (request.body.contentType) {
                        case type.image:
                            extraInfo = extensionWorker.generateString(extensionWorker.image);
                            break;

                        case type.comic:
                        case type.comicMini:
                            extraInfo = extensionWorker.generateString(extensionWorker.comic);
                            break;

                        case type.video:
                        case type.videoSeries:
                            extraInfo = extensionWorker.generateString(extensionWorker.video);
                            break;

                        case type.music:
                        case type.sound:
                        case type.storyAudio:
                            extraInfo = extensionWorker.generateString(extensionWorker.audio);
                            break;

                        case type.story:
                            extraInfo = extensionWorker.generateString(extensionWorker.text);
                            break;

                        case type.storyInteractive:
                            extraInfo = extensionWorker.generateString(extensionWorker.storyInteractive);
                            break;

                        default:
                            break;
                    }

                    break;

                case status.CONTENT_NUMBER_IN_GROUP_ALREADY_EXISTS:
                    locReason = "ContentNumberInGroupAlreadyExists";
                    break;

                case status.CONTENT_GROUP_NAME_REQUIRED:
                    locReason = "ContentGroupNameRequired";
                    break;

                case status.CONTENT_GROUP_ALREADY_EXISTS:
                    locReason = "ContentGroupAlreadyExists";
                    break;

                default:
                    locReason = "SomethingWentWrong";
                    break;
            }

            if (info.length === 1) {
                allProblems += getLocalizedResource(`${locPart}.${locReason}`) + `${extraInfo}.<br>`;
            } else if (info.length > 1) {
                allProblems +=
                    `"${request.files.contentFileMultiple[i].name}": ` + getLocalizedResource(`${locPart}.${locReason}`) + `${extraInfo}.<br>`;
                allProblemsCount++;
            }
        }
    }

    if (allProblems) {
        if (info.length !== 1) {
            allProblems = getLocalizedResource(`${locPart}.ThereWereProblemsWithTheseFiles`) + ` (${allProblemsCount}): <br> ${allProblems}`;
        }
        return allProblems;
    }

    return constants.library.status.FINE;
}
