const _ = require("underscore");
const urlExist = require("url-exist");
const fs = require("fs");

const { getCurrentLocalization, getLocalizedResource } = require("../localizer.js");
const { getSetting } = require("../settings.js");
const { assemblePage } = require("../helpers/assemblePage.js");
const asyncWrap = require("../asyncWrap.js");
const constants = require("../constants.js");
const authorsService = require("../services/authorsService.js");

exports.addNewAuthor = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.addNewAuthorUploadProcess;
    const status = constants.library.status;

    const info = await authorsService.addNewAuthor(
        request.body.authorName,
        request.body.authorLinks,
        request.body.avatarLink,
        request.body.headerImageLink
    );

    var locReason;
    var extraInfo = "";
    if (info !== status.FINE) {
        switch (info) {
            case status.MAX_AUTHOR_NAME_LENGTH_EXCEEDED:
                locReason = "MaxAuthorNameLengthExceeded";
                extraInfo = constants.library.author.maxNameLength;
                break;

            case status.AUTHOR_NAME_REQUIRED:
                locReason = "AuthorNameRequired";
                break;

            case status.AUTHOR_ALREADY_EXISTS:
                locReason = "AuthorAlreadyExists";
                break;

            case status.MAX_AUTHOR_LINK_LENGTH_EXCEEDED:
                locReason = "MaxAuthorLinkLengthExceeded";
                extraInfo = constants.library.author.maxLinkLegnth;
                break;

            default:
                locReason = "SomethingWentWrong";
                break;
        }

        return response
            .status(400)
            .send(getLocalizedResource(`${locPart}.${locReason}`) + `${extraInfo}.<br>`);
    }

    return response.redirect(constants.library.api.main);
});

exports.getChangeAuthorInfoPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.changeAuthorInfo;

    const info = await authorsService.getAuthorInfo(true);

    var authorsList = "";
    for (var i = 0; i < info.authors.length; i++) {
        authorsList += `<option class="author-container">${info.authors[i].Name}</option>`;
    }

    const html = await assemblePage(
        constants.library.page.changeAuthorHead,
        constants.library.page.changeAuthorBody
    );

    const templ = _.template(html);

    return response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: constants.library.api.main,
            cssTheme: getSetting("theme"),

            localization: getCurrentLocalization(),
            authorsList: authorsList,
            authorName: getLocalizedResource(`${locPart}.AuthorName`),
            authorAvatarLink: getLocalizedResource(`${locPart}.AuthorAvatarLink`),
            authorHeaderImageLink: getLocalizedResource(`${locPart}.AuthorHeaderImageLink`),
            authorLink: getLocalizedResource(`${locPart}.AuthorLink`),
            required: getLocalizedResource(`${locPart}.Required`),
            readyToChange: getLocalizedResource(`${locPart}.ReadyToChange`),
            needMoreLinks: getLocalizedResource(`${locPart}.NeedMoreLinks`),
            deleteAuthor: getLocalizedResource(`${locPart}.DeleteAuthor`),
            additionalInfo: getLocalizedResource(`${locPart}.AdditionalInfo`),
            updateAuthorAction: `${constants.library.api.main}${constants.library.api.updateAuthor}`,
            deleteAuthorAction: `${constants.library.api.main}${constants.library.api.deleteAuthor}`,
        })
    );
});

exports.changeAuthorInfo = asyncWrap(async function (request, response) {
    // should be same as for add author, but is this right, shouldn't it be renamed???
    const locPart = constants.library.localization.addNewAuthorUploadProcess;
    const status = constants.library.status;

    const info = await authorsService.changeAuthorInfo(
        request.body.authorName,
        request.body.authorOriginalName,
        request.body.authorLinks,
        request.body.authorOriginalLinks,
        request.body.authorAvatarLink,
        request.body.authorHeaderImageLink
    );

    var locReason;
    var extraInfo = "";
    if (info !== status.FINE) {
        switch (info) {
            case status.MAX_AUTHOR_NAME_LENGTH_EXCEEDED:
                locReason = "MaxAuthorNameLengthExceeded";
                extraInfo = constants.library.author.maxNameLength;
                break;

            case status.AUTHOR_NAME_REQUIRED:
                locReason = "AuthorNameRequired";
                break;

            case status.AUTHOR_ALREADY_EXISTS:
                locReason = "AuthorAlreadyExists";
                break;

            case status.MAX_AUTHOR_LINK_LENGTH_EXCEEDED:
                locReason = "MaxAuthorLinkLengthExceeded";
                extraInfo = constants.library.author.maxLinkLegnth;
                break;

            default:
                locReason = "SomethingWentWrong";
                break;
        }

        return response
            .status(400)
            .send(getLocalizedResource(`${locPart}.${locReason}`) + `${extraInfo}.<br>`);
    }

    return response.redirect(`${constants.library.api.main}${constants.library.api.changeAuthor}`);
});

exports.deleteAuthor = asyncWrap(async function (request, response) {
    await authorsService.deleteAuthor(request.body.authorOriginalName);

    return response.redirect(`${constants.library.api.main}${constants.library.api.changeAuthor}`);
});

exports.getAddNewAuthorPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.addNewAuthor;

    const html = await assemblePage(
        constants.library.page.addNewAuthorHead,
        constants.library.page.addNewAuthorBody
    );

    const templ = _.template(html);

    return response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: constants.library.api.main,
            cssTheme: getSetting("theme"),

            authorName: getLocalizedResource(`${locPart}.AuthorName`),
            avatarLink: getLocalizedResource(`${locPart}.AvatarLink`),
            headerImageLink: getLocalizedResource(`${locPart}.HeaderImageLink`),
            authorLink: getLocalizedResource(`${locPart}.AuthorLink`),
            required: getLocalizedResource(`${locPart}.Required`),
            readyToAdd: getLocalizedResource(`${locPart}.ReadyToAdd`),
            needMoreLinks: getLocalizedResource(`${locPart}.NeedMoreLinks`),
            authorLinksUploadInfo: getLocalizedResource(`${locPart}.AuthorLinksUploadInfo`),
            uploadAuthorAction: `${constants.library.api.main}${constants.library.api.uploadAuthor}`,
        })
    );
});

exports.getAllAuthorsPage = asyncWrap(async function (request, response) {
    const locPart = constants.library.localization.authors;

    var info = await authorsService.getAuthorInfo(true);

    // это был картиночный вариант
    /* var authorsList = "";
    var link = "";
    var fullLink = "";
    // add more trusted sites
    var re = /^(twitter.com|vk.com|deviantart.com|artstation.com|pixiv.net)\//i;
    for (var i = 0; i < info.authors.length; i++) {
        authorsList += `<div class="author-item">${info.authors[i].Name}</div>`;
        authorsList += `<div class="author-links-container">`;
        var j;
        for (j = 0; j < info.links[i].length; j++) {
            link = info.links[i][j];
            //trusted sites will be here
            var match = link.match(re);
            if (match) {
                fullLink = `https://${link}`;
                if (getSetting("authorLinksFormat") == "image") {
                    switch (match[1].toLowerCase()) {
                        case "vk.com":
                              link = `<img class="author-image-item" src="/Art/vk.png" />`;
                            break;

                        default:
                            break;
                    }
                }
            } else {
                fullLink = `http://${link}`;
            }
            authorsList += `<div class="author-link-item"><a class="author-link" href="${fullLink}">${link}</a></div>`;
        }
        if (j == 0) {
            authorsList += `<div class="author-link-item">Нет ссылок</div>`;
        }
        authorsList += `</div>`;
    }*/

    var defaultAvatar = "/static/authors/author_card_avatar_default.png";
    var defaultHeader = "/static/authors/author_card_header_default.jpg";
    var authorsList = "";
    var link = "";
    // add more trusted sites
    // нужно ещё учитывать что могут впихнуть https://vk.com вместо vk.com
    // нужно добавлять разделы информация, лого и хедер картинка в бд? получается, что да
    var re = /(^|^https:\/\/)(twitter.com|vk.com|deviantart.com|artstation.com|pixiv.net)\//i;
    for (var i = 0; i < info.authors.length; i++) {
        authorsList += `<div class="author-card">`;
        authorsList += `<div class="author-card-inner">`;
        authorsList += `<div class="author-card-front">`;

        if (await urlExist(info.authors[i].HeaderImageLink)) {
            authorsList += `<img class="author-card-header-image" src="${info.authors[i].HeaderImageLink}">`;
        } else {
            if (fs.existsSync(constants.library.dir.public + info.authors[i].HeaderImageLink)) {
                authorsList += `<img class="author-card-header-image" src="${info.authors[i].HeaderImageLink}">`;
            } else {
                authorsList += `<img class="author-card-header-image" src="${defaultHeader}">`;
            }
        }

        if (await urlExist(info.authors[i].AvatarLink)) {
            authorsList += `<img class="author-card-avatar" src="${info.authors[i].AvatarLink}">`;
        } else {
            if (fs.existsSync(constants.library.dir.public + info.authors[i].AvatarLink)) {
                authorsList += `<img class="author-card-avatar" src="${info.authors[i].AvatarLink}">`;
            } else {
                authorsList += `<img class="author-card-avatar" src="${defaultAvatar}">`;
            }
        }

        authorsList += `<div class="author-card-main-info">`;
        authorsList += `<div class="author-card-title">${info.authors[i].Name}</div>`;
        authorsList += `<div class="author-card-description"> CEO & Founder, CEO & Founder, Exaasdasasdsadsadasdasd dasdasdsadasdas asdaasdasdasdasdd asdasdsadadassda asdasdasd asdasd sdasdasd dasdasdasasdasd dmple dmpleCEO & Founder, Exaasdasasdsadsadasdasd dasdasdsadasdas asdaasdasdasdasdd asdasdsadadassda asdasdasd asdasd sdasdasd dasdasdasasdasd dmple dmpleCEO & Founder, Exaasdasasdsadsadasdasd dasdasdsadasdas asdaasdasdasdasdd asdasdsadadassda asdasdasd asdasd sdasdasd dasdasdasasdasd dmple dmpleExaasdasasdsadsadasdasd dasdasdsadasdas asdaasdasdasdasdd asdasdsadadassda asdasdasd asdasd sdasdasd dasdasdasasdasd dmple dmple</div>`;
        authorsList += `</div>`;

        authorsList += `<div class="author-links-container">`;

        var j;
        for (j = 0; j < info.links[i].length; j++) {
            link = info.links[i][j];
            var proto = "";
            //trusted sites will be here
            var match = link.match(re);
            if (match) {
                if (match[1].toLowerCase() !== "https://") {
                    proto = "https://";
                }
                if (getSetting("authorLinksFormat") === "image") {
                    switch (match[2].toLowerCase()) {
                        case "vk.com":
                            link = `<a class="author-card-link fa fa-vk" href="${proto}${link}"></a>`;
                            break;

                        case "twitter.com":
                            link = `<a class="author-card-link fa fa-twitter" href="${proto}${link}"></a>`;
                            break;

                        default:
                            break;
                    }
                } else {
                    link = `<a href="${proto}${link}">${link}</a>`;
                }
            } else {
                link = `<a class="author-card-link fa fa-link" href="http://${link}"></a>`;
            }
            authorsList += `${link}`;
            proto = "";
        }
        if (j === 0) {
            authorsList += `<div class="author-link-item">Нет ссылок</div>`;
        }
        authorsList += `</div>`;

        authorsList += `<button class="author-more-info-button">Больше</button>`;
        authorsList += `</div>`;

        authorsList += `<div class="author-card-back">`;
        authorsList += `<h1>Случайная работа автора? придётся попотеть, они ведь разные будут, картинки видео музыка и т.д.</h1>`;
        authorsList += `<button class="author-less-info-button">Назад</button>`;
        authorsList += `</div>`;

        authorsList += `</div>`;
        authorsList += `</div>`;
    }

    const html = await assemblePage(
        constants.library.page.authorsHead,
        constants.library.page.authorsBody
    );

    const templ = _.template(html);

    return response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: constants.library.api.main,
            cssTheme: getSetting("theme"),

            localization: getCurrentLocalization(),
            authorsList: authorsList,
        })
    );
});

exports.getAuthorInfo = asyncWrap(async function (request, response) {
    const info = await authorsService.getAuthorInfo(true, request.body.authorOriginalName);

    return response.status(200).send(info);
});
