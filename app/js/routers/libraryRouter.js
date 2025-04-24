const _ = require("underscore");
const express = require("express");

const { assemblePage, assemblePage404 } = require("../helpers/assemblePage.js");
const {
    changeLocalization,
    getCurrentLocalization,
    getLocalizedResource,
} = require("../localizer.js");
const { setSetting, saveSettings, getSetting } = require("../settings.js");

//это не должен быть контроллер???  сделать toolsController?
const { generateVkPostForDiscord } = require("../controllers/vkImporterController.js");
const asyncWrap = require("../asyncWrap.js");
const constants = require("../constants.js");
const postsGenerator = require("../helpers/content/postsGenerator.js");
const tagsController = require("../controllers/tagsController.js");
const authorsController = require("../controllers/authorsController.js");
const groupsController = require("../controllers/groupsController.js");
const contentController = require("../controllers/contentController.js");

const libraryRouter = express.Router();

libraryRouter.get("/", async function (request, response) {
    const locPart = constants.library.localization.main;

    const html = await assemblePage(constants.library.page.dataLibraryItemPageHead, "");

    const templ = _.template(html);

    //check later; these 3 lines title and gobackaction and theme must be in every template where assemble is
    response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: constants.library.api.main,
            cssTheme: getSetting("theme"),
        })
    );
});

libraryRouter.post("/", function (request, response) {
    response.redirect(constants.library.api.main);
});

libraryRouter.get(constants.library.api.addNewContent, contentController.getAddNewContentPage);

libraryRouter.post(constants.library.api.editContent, contentController.editContentInfo);

libraryRouter.post(constants.library.api.copyContent, contentController.copyContent);

libraryRouter.post(constants.library.api.editContentPreview, contentController.editContentPreview);

libraryRouter.post(constants.library.api.editContentType, contentController.editContentType);

libraryRouter.post(
    constants.library.api.deleteContentPreview,
    contentController.deleteContentPreview
);

libraryRouter.post(
    constants.library.api.defaultContentPreview,
    contentController.setDefaultContentPreview
);

libraryRouter.post(constants.library.api.uploadContent, contentController.addNewContent);

libraryRouter.post(
    constants.library.api.getContentEditInfo,
    contentController.getEditContentInfoPage
);

libraryRouter.post(
    constants.library.api.getContentEditPreview,
    contentController.getEditContentPreviewPage
);

libraryRouter.post(
    constants.library.api.getContentEditType,
    contentController.getEditContentTypePage
);

libraryRouter.post(constants.library.api.addTagsToPost, contentController.addTagsToContent);

libraryRouter.post(
    constants.library.api.applySuggestedExtension,
    contentController.applySuggestedExtension
);

libraryRouter.post(constants.library.api.addToFavourite, contentController.addToFavourite);

libraryRouter.post(constants.library.api.addToDeleted, contentController.addToDeleted);

libraryRouter.post(constants.library.api.destroyContent, contentController.deleteContent);

libraryRouter.post(
    constants.library.api.checkProcessingStatus,
    contentController.checkProcessingStatus
);

libraryRouter.get(constants.library.api.authors, authorsController.getAllAuthorsPage);

libraryRouter.post(constants.library.api.getAuthorInfo, authorsController.getAuthorInfo);

libraryRouter.get(constants.library.api.changeAuthor, authorsController.getChangeAuthorInfoPage);

libraryRouter.post(constants.library.api.updateAuthor, authorsController.changeAuthorInfo);

libraryRouter.post(constants.library.api.uploadAuthor, authorsController.addNewAuthor);

libraryRouter.post(constants.library.api.deleteAuthor, authorsController.deleteAuthor);

libraryRouter.get(constants.library.api.addNewAuthor, authorsController.getAddNewAuthorPage);

libraryRouter.get(constants.library.api.addNewTag, tagsController.getAddNewTagPage);

libraryRouter.post(constants.library.api.uploadTag, tagsController.addNewTag);

libraryRouter.get(constants.library.api.changeTag, tagsController.getChangeTagInfoPage);

libraryRouter.post(constants.library.api.updateTag, tagsController.changeTagInfo);

libraryRouter.post(constants.library.api.deleteTag, tagsController.deleteTag);

libraryRouter.post(constants.library.api.getTagInfo, tagsController.getTagInfo);

libraryRouter.post(constants.library.api.getAllTags, tagsController.getAllTagsInfo);

libraryRouter.get(constants.library.api.changeGroupInfo, groupsController.getChangeGroupInfoPage);

libraryRouter.post(constants.library.api.getGroupInfo, groupsController.getGroupInfo);

libraryRouter.post(constants.library.api.updateGroupInfo, groupsController.changeGroupInfo);

libraryRouter.post(constants.library.api.deleteGroupPreview, groupsController.deleteGroupPreview);

//это 2 фигнюшка должна переключать инструменты (может её сразу в контроллер и прокидывать, а он там уже выберет,, что нам надо?)
libraryRouter.get("/VKIMPORTER", async function (request, response, next) {
    //throw new Error("Here it is");

    await generateVkPostForDiscord(request, response);
});

// это чисто для тестов, потом можно удалить
libraryRouter.get("/x", async function (request, response, next) {
    throw new Error("Here it is");
});

libraryRouter.post(constants.library.api.saveSettings, async function (request, response) {
    setSetting("numberOfPosts", request.body.numberOfPosts);
    setSetting("sizeOfPosts", request.body.sizeOfPosts);
    setSetting("fullOccupiedSpaceOfPosts", request.body.fullOccupiedSpaceOfPosts);
    setSetting("viewOfPosts", request.body.viewOfPosts);
    setSetting("infoOfPosts", request.body.infoOfPosts);
    setSetting("sortPostsBy", request.body.sortPostsBy);
    setSetting("sortPostsOrder", request.body.sortPostsOrder);
    setSetting("sortGroupsBy", request.body.sortGroupsBy);
    setSetting("sortGroupsOrder", request.body.sortGroupsOrder);
    setSetting("needPrevNextArrows", request.body.needPrevNextArrows);
    setSetting("dateFormat", request.body.dateFormat);
    setSetting("sizeFormat", request.body.sizeFormat);
    setSetting("durationFormat", request.body.durationFormat);
    setSetting("authorLinksFormat", request.body.authorLinksFormat);
    setSetting("colorfulContentTypeTitles", request.body.colorfulContentTypeTitles);
    setSetting("downloadOrCopyContent", request.body.downloadOrCopyContent);
    setSetting("language", request.body.language);
    setSetting("theme", request.body.theme);
    setSetting("copyPath", request.body.copyPath);

    await saveSettings();

    if (request.body.language !== getCurrentLocalization()) {
        await changeLocalization(request.body.language);
    }

    return response.redirect(request.body.currentURL);
});

// Available path examples:
// author   /AXXXXX/comics/1/GXXXXX/1/FXXXXX
// author   /AXXXXX/comics/1/GXXXXX/1
// author   /AXXXXX/images/1/FXXXXX
// author   /AXXXXX/images/1
// favourite/comics/1     /GXXXXX/1/FXXXXX
// favourite/comics/1     /GXXXXX/1
// favourite/images/1     /FXXXXX
// favourite/images/1
// comics   /1     /GXXXXX/1/FXXXXX
// comics   /1     /GXXXXX/1
// images   /1     /FXXXXX
// images   /1

libraryRouter.get("/:type", function (request, response) {
    response.redirect(`${constants.library.api.main}/${request.params.type}/1`);
});

libraryRouter.post("/:type", function (request, response) {
    response.redirect(`${constants.library.api.main}/${request.params.type}`);
});

libraryRouter.get(
    "/:type/:page",
    asyncWrap(async function (request, response) {
        const apiLibrary = constants.library.api;

        const type = request.params.type;
        const page = request.params.page;

        var html = "";
        switch (`/${type}`) {
            case apiLibrary.favourite:
            case apiLibrary.deleted:
                return response.redirect(`${apiLibrary.main}/${type}/${page}/1`);

            case apiLibrary.comics:
            case apiLibrary.comicsMini:
            case apiLibrary.videoSeries:
            case apiLibrary.stories:
            case apiLibrary.storiesAudio:
            case apiLibrary.storiesInteractive:
            case apiLibrary.other:
            case apiLibrary.images:
            case apiLibrary.videos:
            case apiLibrary.music:
            case apiLibrary.sounds:
            case apiLibrary.all:
                html = await postsGenerator.getPostsWithoutGroups(
                    `/${type}`,
                    page,
                    type,
                    constants.library.api.main,
                    null
                );
                break;

            default:
                return response.status(404).send(await assemblePage404());
        }

        switch (html) {
            case constants.library.status.NOT_FOUND:
                return response.status(404).send(await assemblePage404());

            default:
                return response.status(200).send(html);
        }
    })
);

libraryRouter.post("/:type/:page", function (request, response) {
    response.redirect(
        `${constants.library.api.main}/${request.params.type}/${request.params.page}`
    );
});

libraryRouter.get(
    "/:type/:idOrPage/:typeOrGroupOrId",
    asyncWrap(async function (request, response) {
        const apiLibrary = constants.library.api;

        const type = request.params.type;
        const idOrPage = request.params.idOrPage;
        const typeOrGroupOrId = request.params.typeOrGroupOrId;

        var html = "";
        switch (`/${type}`) {
            case apiLibrary.images:
            case apiLibrary.videos:
            case apiLibrary.music:
            case apiLibrary.sounds:
            case apiLibrary.all:
                html = await postsGenerator.getPost(
                    typeOrGroupOrId,
                    `/${type}`,
                    null,
                    "",
                    `${apiLibrary.main}/${type}/${idOrPage}`
                );
                break;

            case apiLibrary.comics:
            case apiLibrary.comicsMini:
            case apiLibrary.videoSeries:
            case apiLibrary.stories:
            case apiLibrary.storiesAudio:
            case apiLibrary.storiesInteractive:
            case apiLibrary.other:
            case apiLibrary.author:
            case apiLibrary.tag:
                return response.redirect(
                    `${apiLibrary.main}/${type}/${idOrPage}/${typeOrGroupOrId}/1`
                );

            case apiLibrary.favourite:
            case apiLibrary.deleted:
                html = await postsGenerator.getPostsWithoutGroups(
                    `/${idOrPage}`,
                    typeOrGroupOrId,
                    `${type}/${idOrPage}`,
                    apiLibrary.main,
                    { type: type, value: "" }
                );
                break;

            default:
                return response.status(404).send(await assemblePage404());
        }

        switch (html) {
            case constants.library.status.NOT_FOUND:
                return response.status(404).send(await assemblePage404());

            default:
                return response.status(200).send(html);
        }
    })
);

libraryRouter.post("/:type/:idOrPage/:typeOrGroupOrId", function (request, response) {
    response.redirect(
        `${constants.library.api.main}/${request.params.type}/` +
            `${request.params.idOrPage}/${request.params.typeOrGroupOrId}`
    );
});

libraryRouter.get(
    "/:type/:idOrPage/:typeOrGroupOrId/:page",
    asyncWrap(async function (request, response) {
        const apiLibrary = constants.library.api;

        const type = request.params.type;
        const idOrPage = request.params.idOrPage;
        const typeOrGroupOrId = request.params.typeOrGroupOrId;
        const page = request.params.page;

        var html = "";
        switch (`/${type}`) {
            case apiLibrary.comics:
            case apiLibrary.comicsMini:
            case apiLibrary.videoSeries:
            case apiLibrary.stories:
            case apiLibrary.storiesAudio:
            case apiLibrary.storiesInteractive:
            case apiLibrary.other:
                html = await postsGenerator.getPostsWithGroups(
                    `/${type}`,
                    typeOrGroupOrId,
                    page,
                    `${type}/${idOrPage}/${typeOrGroupOrId}`,
                    null,
                    `${apiLibrary.main}/${type}/${idOrPage}`
                );
                break;

            case apiLibrary.author:
            case apiLibrary.tag:
                html = await postsGenerator.getPostsWithoutGroups(
                    `/${typeOrGroupOrId}`,
                    page,
                    `${type}/${idOrPage}/${typeOrGroupOrId}`,
                    apiLibrary.main,
                    { type: type, value: idOrPage }
                );
                break;

            case apiLibrary.favourite:
            case apiLibrary.deleted:
                switch (`/${idOrPage}`) {
                    case apiLibrary.images:
                    case apiLibrary.videos:
                    case apiLibrary.music:
                    case apiLibrary.sounds:
                    case apiLibrary.all:
                        html = await postsGenerator.getPost(
                            page,
                            `/${idOrPage}`,
                            { type: type, value: "" },
                            "",
                            `${apiLibrary.main}/${type}/${idOrPage}/${typeOrGroupOrId}`
                        );
                        break;

                    default:
                        return response.redirect(
                            `${apiLibrary.main}/${type}/${idOrPage}/${typeOrGroupOrId}/${page}/1`
                        );
                }
                break;

            default:
                return response.status(404).send(await assemblePage404());
        }

        switch (html) {
            case constants.library.status.NOT_FOUND:
                return response.status(404).send(await assemblePage404());

            default:
                return response.status(200).send(html);
        }
    })
);

libraryRouter.post("/:type/:idOrPage/:typeOrGroupOrId/:page", function (request, response) {
    response.redirect(
        `${constants.library.api.main}/${request.params.type}/` +
            `${request.params.idOrPage}/${request.params.typeOrGroupOrId}/` +
            `${request.params.page}`
    );
});

libraryRouter.get(
    "/:type/:idOrPage/:typeOrGroupOrId/:page/:groupOrId",
    asyncWrap(async function (request, response) {
        const apiLibrary = constants.library.api;

        const type = request.params.type;
        const idOrPage = request.params.idOrPage;
        const typeOrGroupOrId = request.params.typeOrGroupOrId;
        const page = request.params.page;
        const groupOrId = request.params.groupOrId;

        var html = "";
        switch (`/${type}`) {
            case apiLibrary.favourite:
            case apiLibrary.deleted:
                switch (`/${idOrPage}`) {
                    case apiLibrary.comics:
                    case apiLibrary.comicsMini:
                    case apiLibrary.videoSeries:
                    case apiLibrary.stories:
                    case apiLibrary.storiesAudio:
                    case apiLibrary.storiesInteractive:
                    case apiLibrary.other:
                        html = await postsGenerator.getPostsWithGroups(
                            `/${idOrPage}`,
                            page,
                            groupOrId,
                            `${type}/${idOrPage}/${typeOrGroupOrId}/${page}`,
                            { type: type, value: "" },
                            `${constants.library.api.main}/${type}/${idOrPage}/${typeOrGroupOrId}`
                        );
                        break;

                    default:
                        return response.status(404).send(await assemblePage404());
                }
                break;

            case apiLibrary.author:
            case apiLibrary.tag:
                switch (`/${typeOrGroupOrId}`) {
                    case apiLibrary.images:
                    case apiLibrary.videos:
                    case apiLibrary.music:
                    case apiLibrary.sounds:
                    case apiLibrary.all:
                        html = await postsGenerator.getPost(
                            groupOrId,
                            `/${typeOrGroupOrId}`,
                            { type: type, value: idOrPage },
                            "",
                            `${apiLibrary.main}/${type}/${idOrPage}/${typeOrGroupOrId}/${page}`
                        );
                        break;

                    case apiLibrary.comics:
                    case apiLibrary.comicsMini:
                    case apiLibrary.videoSeries:
                    case apiLibrary.stories:
                    case apiLibrary.storiesAudio:
                    case apiLibrary.storiesInteractive:
                    case apiLibrary.other:
                        return response.redirect(
                            `${apiLibrary.main}/${type}/${idOrPage}/${typeOrGroupOrId}/${page}/${groupOrId}/1`
                        );

                    default:
                        return response.status(404).send(await assemblePage404());
                }
                break;

            case apiLibrary.comics:
            case apiLibrary.comicsMini:
            case apiLibrary.videoSeries:
            case apiLibrary.stories:
            case apiLibrary.storiesAudio:
            case apiLibrary.storiesInteractive:
            case apiLibrary.other:
                html = await postsGenerator.getPost(
                    groupOrId,
                    `/${type}`,
                    null,
                    typeOrGroupOrId,
                    `${apiLibrary.main}/${type}/${idOrPage}/${typeOrGroupOrId}/${page}`
                );
                break;

            default:
                return response.status(404).send(await assemblePage404());
        }

        switch (html) {
            case constants.library.status.NOT_FOUND:
                return response.status(404).send(await assemblePage404());

            default:
                return response.status(200).send(html);
        }
    })
);

libraryRouter.post(
    "/:type/:idOrPage/:typeOrGroupOrId/:page/:groupOrId",
    function (request, response) {
        response.redirect(
            `${constants.library.api.main}/${request.params.type}/` +
                `${request.params.idOrPage}/${request.params.typeOrGroupOrId}/` +
                `${request.params.page}/${request.params.groupOrId}`
        );
    }
);

libraryRouter.get(
    "/:type/:idOrPage/:typeOrGroupOrId/:page/:groupOrId/:groupPage",
    asyncWrap(async function (request, response) {
        const apiLibrary = constants.library.api;

        const type = request.params.type;
        const idOrPage = request.params.idOrPage;
        const typeOrGroupOrId = request.params.typeOrGroupOrId;
        const page = request.params.page;
        const groupOrId = request.params.groupOrId;
        const groupPage = request.params.groupPage;

        var html = "";
        switch (`/${type}`) {
            case apiLibrary.favourite:
            case apiLibrary.deleted:
                switch (`/${idOrPage}`) {
                    case apiLibrary.comics:
                    case apiLibrary.comicsMini:
                    case apiLibrary.videoSeries:
                    case apiLibrary.stories:
                    case apiLibrary.storiesAudio:
                    case apiLibrary.storiesInteractive:
                    case apiLibrary.other:
                        html = await postsGenerator.getPost(
                            groupPage,
                            `/${idOrPage}`,
                            { type: type, value: "" },
                            page,
                            `${apiLibrary.main}/${type}/${idOrPage}/${typeOrGroupOrId}/${page}/${groupOrId}`
                        );
                        break;

                    default:
                        return response.status(404).send(await assemblePage404());
                }
                break;

            case apiLibrary.author:
            case apiLibrary.tag:
                switch (`/${typeOrGroupOrId}`) {
                    case apiLibrary.comics:
                    case apiLibrary.comicsMini:
                    case apiLibrary.videoSeries:
                    case apiLibrary.stories:
                    case apiLibrary.storiesAudio:
                    case apiLibrary.storiesInteractive:
                    case apiLibrary.other:
                        html = await postsGenerator.getPostsWithGroups(
                            `/${typeOrGroupOrId}`,
                            groupOrId,
                            groupPage,
                            `${type}/${idOrPage}/${typeOrGroupOrId}/${page}/${groupOrId}`,
                            { type: type, value: idOrPage },
                            `${constants.library.api.main}/${type}/${idOrPage}/${typeOrGroupOrId}/${page}`
                        );
                        break;

                    default:
                        return response.status(404).send(await assemblePage404());
                }
                break;

            default:
                return response.status(404).send(await assemblePage404());
        }

        switch (html) {
            case constants.library.status.NOT_FOUND:
                return response.status(404).send(await assemblePage404());

            default:
                return response.status(200).send(html);
        }
    })
);

libraryRouter.post(
    "/:type/:idOrPage/:typeOrGroupOrId/:page/:groupOrId/:groupPage",
    function (request, response) {
        response.redirect(
            `${constants.library.api.main}/${request.params.type}/` +
                `${request.params.idOrPage}/${request.params.typeOrGroupOrId}/` +
                `${request.params.page}/${request.params.groupOrId}/` +
                `${request.params.groupPage}`
        );
    }
);

libraryRouter.get(
    "/:type/:idOrPage/:typeOrGroupOrId/:page/:groupOrId/:groupPage/:id",
    asyncWrap(async function (request, response) {
        const apiLibrary = constants.library.api;

        const type = request.params.type;
        const idOrPage = request.params.idOrPage;
        const typeOrGroupOrId = request.params.typeOrGroupOrId;
        const page = request.params.page;
        const groupOrId = request.params.groupOrId;
        const groupPage = request.params.groupPage;
        const id = request.params.id;

        // how do we check author id and pages???
        var html = "";
        switch (`/${type}`) {
            case apiLibrary.author:
            case apiLibrary.tag:
                switch (`/${typeOrGroupOrId}`) {
                    case apiLibrary.comics:
                    case apiLibrary.comicsMini:
                    case apiLibrary.videoSeries:
                    case apiLibrary.stories:
                    case apiLibrary.storiesAudio:
                    case apiLibrary.storiesInteractive:
                    case apiLibrary.other:
                        html = await postsGenerator.getPost(
                            id,
                            `/${typeOrGroupOrId}`,
                            { type: type, value: idOrPage },
                            groupOrId,
                            `${constants.library.api.main}/${type}/` +
                                `${idOrPage}/${typeOrGroupOrId}/` +
                                `${page}/${groupOrId}/${groupPage}`
                        );
                        break;

                    default:
                        return response.status(404).send(await assemblePage404());
                }
                break;

            default:
                return response.status(404).send(await assemblePage404());
        }

        switch (html) {
            case constants.library.status.NOT_FOUND:
                return response.status(404).send(await assemblePage404());

            default:
                return response.status(200).send(html);
        }
    })
);

libraryRouter.post(
    "/:type/:idOrPage/:typeOrGroupOrId/:page/:groupOrId/:groupPage/:id",
    function (request, response) {
        response.redirect(
            `${constants.library.api.main}/${request.params.type}/` +
                `${request.params.idOrPage}/${request.params.typeOrGroupOrId}/` +
                `${request.params.page}/${request.params.groupOrId}/` +
                `${request.params.groupPage}/${request.params.id}`
        );
    }
);

module.exports = libraryRouter;
