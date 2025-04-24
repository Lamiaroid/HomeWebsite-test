const { dirname } = require("path");

const appDir = dirname(require.main.filename);

const logDir = appDir + "/logs";
const publicDir = appDir + "/public";
const privateDir = appDir + "/app";

const publicCssDir = publicDir + "/css";
const publicJsDir = publicDir + "/js";
const publicStaticDir = publicDir + "/static";

const privateHtmlDir = privateDir + "/html";
const privateJsDir = privateDir + "/js";
const privateLocalizationDir = privateDir + "/localization";

module.exports = Object.freeze({
    library: Object.freeze({
        file: Object.freeze({
            encoding: "utf8",
        }),
        log: Object.freeze({
            extension: "log",
            extraInfo: Object.freeze({ error: "_err" }),
        }),
        sql: Object.freeze({
            database: Object.freeze({
                library: "LibraryDatabase",
            }),
            // указать своё название сервера
            server: "DESKTOP-RTK4EID\\SQLEXPRESS",
        }),
        settings: Object.freeze({
            file: appDir + "/settings.ini",
        }),
        storages: Object.freeze({
            file: appDir + "/storages.ini",
        }),
        status: Object.freeze({
            AUTHENTICATE: "$AUTHENTICATE$",
            IS_USER: "$IS_USER$",
            SMTH_BAD: "$SMTH_BAD$",
            BAD_TOKEN: "$BAD_TOKEN$",
            BAD_DATA: "$BAD_DATA$",
            FINE: "$FINE$",
            NOT_FOUND: "$NOT_FOUND$",
            NO_CONTENT_FILE_PROVIDED: "$NO_CONTENT_FILE_PROVIDED$",
            MAX_CONTENT_NAME_LENGTH_EXCEEDED: "$MAX_CONTENT_NAME_LENGTH_EXCEEDED$",
            MAX_CONTENT_TRANSLITERATED_NAME_LENGTH_EXCEEDED:
                "$MAX_CONTENT_TRANSLITERATED_NAME_LENGTH_EXCEEDED$",
            MAX_CONTENT_EXTENSION_LENGTH_EXCEEDED: "$MAX_EXTENSION_LENGTH_EXCEEDED$",
            MAX_CONTENT_PATH_LENGTH_EXCEEDED: "$MAX_CONTENT_PATH_LENGTH_EXCEEDED$",
            MAX_CONTENT_GROUP_NAME_LENGTH_EXCEEDED: "$MAX_GROUP_NAME_LENGTH_EXCEEDED$",
            MAX_CONTENT_GROUP_TRANSLITERATED_NAME_LENGTH_EXCEEDED:
                "$MAX_GROUP_TRANSLITERATED_NAME_LENGTH_EXCEEDED$",
            CONTENT_NUMBER_IN_GROUP_IS_SMALLER_THAN_MINIMUM_ALLOWED:
                "$CONTENT_NUMBER_IN_GROUP_IS_SMALLER_THAN_MINIMUM_ALLOWED$",
            CONTENT_NUMBER_IN_GROUP_IS_BIGGER_THAN_MAXIMUM_ALLOWED:
                "$CONTENT_NUMBER_IN_GROUP_IS_BIGGER_THAN_MAXIMUM_ALLOWED$",
            INVALID_CONTENT_PREVIEW_FILE: "$INVALID_CONTENT_PREVIEW_FILE$",
            INVALID_CONTENT_FILE_FOR_THIS_CONTENT_TYPE:
                "$INVALID_CONTENT_FILE_FOR_THIS_CONTENT_TYPE$",
            CONTENT_NUMBER_IN_GROUP_ALREADY_EXISTS: "$CONTENT_NUMBER_IN_GROUP_ALREADY_EXISTS$",
            CONTENT_GROUP_NAME_REQUIRED: "$CONTENT_GROUP_NAME_REQUIRED$",
            CONTENT_GROUP_ALREADY_EXISTS: "$CONTENT_GROUP_ALREADY_EXISTS$",
            AUTHOR_ALREADY_EXISTS: "$AUTHOR_ALREADY_EXISTS$",
            AUTHOR_NAME_REQUIRED: "$AUTHOR_NAME_REQUIRED$",
            MAX_AUTHOR_NAME_LENGTH_EXCEEDED: "$MAX_AUTHOR_NAME_LENGTH_EXCEEDED$",
            MAX_AUTHOR_LINK_LENGTH_EXCEEDED: "$MAX_AUTHOR_LINK_LENGTH_EXCEEDED$",
            TAG_ALREADY_EXISTS: "$TAG_ALREADY_EXISTS$",
            TAG_NAME_REQUIRED: "$TAG_NAME_REQUIRED$",
            MAX_TAG_NAME_LENGTH_EXCEEDED: "$MAX_TAG_NAME_LENGTH_EXCEEDED$",
        }),
        api: Object.freeze({
            any: "*",
            homepage: "/",
            main: "/library",
            addNewContent: "/add-new-content",
            editContent: "/edit-content",
            editContentPreview: "/edit-content-preview",
            editContentType: "/edit-content-type",
            deleteContentPreview: "/delete-content-preview",
            defaultContentPreview: "/default-content-preview",
            copyContent: "/copy-content",
            uploadContent: "/upload-content",
            updateContent: "/update-content",
            checkProcessingStatus: "/check-processing-status",
            author: "/author",
            authors: "/authors",
            applySuggestedExtension: "/apply-suggested-extension",
            addToFavourite: "/add-to-favourite",
            addToDeleted: "/add-to-deleted",
            destroyContent: "/destroy-content",
            addNewAuthor: "/add-new-author",
            changeAuthor: "/change-author",
            uploadAuthor: "/upload-author",
            updateAuthor: "/update-author",
            deleteAuthor: "/delete-author",
            getAuthorInfo: "/get-author-info",
            getGroupInfo: "/get-group-info",
            getContentEditInfo: "/get-content-edit-info",
            getContentEditPreview: "/get-content-edit-preview",
            getContentEditType: "/get-content-edit-type",
            changeGroupInfo: "/change-group-info",
            updateGroupInfo: "/update-group-info",
            deleteGroupPreview: "/delete-group-preview",
            tag: "/tag",
            tags: "/tags",
            favourite: "/favourite",
            deleted: "/deleted",
            addNewTag: "/add-new-tag",
            changeTag: "/change-tag",
            uploadTag: "/upload-tag",
            updateTag: "/update-tag",
            deleteTag: "/delete-tag",
            getAllTags: "/get-all-tags",
            getTagInfo: "/get-tag-info",
            addTagsToPost: "/add-new-tags-to-post",
            images: "/images",
            comics: "/comics",
            comicsMini: "/comics-mini",
            videos: "/videos",
            videoSeries: "/video-series",
            music: "/music",
            sounds: "/sounds",
            stories: "/stories",
            storiesAudio: "/stories-audio",
            storiesInteractive: "/stories-interactive",
            other: "/other",
            all: "/all",
            saveSettings: "/save-settings",
        }),
        dir: Object.freeze({
            app: appDir,
            log: logDir,
            public: publicDir,
            private: privateDir,

            art: publicStaticDir,
            font: publicDir + "/fonts",
            script: publicJsDir,
            style: publicCssDir,
            localizationDir: privateLocalizationDir,

            content: publicDir + "/Content/Content",
            contentDeleted: publicDir + "/Content/Deleted",
            contentDescription: publicDir + "/Content/Description",
            contentPreview: publicDir + "/Content/Preview",
        }),
        page: Object.freeze({
            library: privateHtmlDir + "/index.html",
            libraryHead: privateHtmlDir + "/index-head.html",
            libraryHeadBase: privateHtmlDir + "/index-head-base.html",
            libraryBanner: privateHtmlDir + "/index-banner.html",
            libraryMenu: privateHtmlDir + "/index-menu.html",
            libraryPanel: privateHtmlDir + "/index-panel.html",

            // пока что нужно для дальнейшего выпиливания из кода
            page404: privateHtmlDir + "/miscellanous/500.html",
            page500: privateHtmlDir + "/miscellanous/500.html",

            page404Head: privateHtmlDir + "/miscellanous/404-head.html",
            page404Body: privateHtmlDir + "/miscellanous/404-body.html",
            page500Head: privateHtmlDir + "/miscellanous/500-head.html",
            page500Body: privateHtmlDir + "/miscellanous/500-body.html",

            addNewContentHead: privateHtmlDir + "/content/add-new-content-head.html",
            addNewContentBody: privateHtmlDir + "/content/add-new-content-body.html",
            editContentHead: privateHtmlDir + "/content/edit-content-head.html",
            editContentBody: privateHtmlDir + "/content/edit-content-body.html",
            editContentPreviewHead: privateHtmlDir + "/content/edit-content-preview-head.html",
            editContentPreviewBody: privateHtmlDir + "/content/edit-content-preview-body.html",
            editContentTypeHead: privateHtmlDir + "/content/edit-content-type-head.html",
            editContentTypeBody: privateHtmlDir + "/content/edit-content-type-body.html",
            dataLibraryItemPageHead: privateHtmlDir + "/content/watch-content-head.html",
            dataLibraryItemPageBody: privateHtmlDir + "/content/watch-content-body.html",
            contentLibraryItemHead: privateHtmlDir + "/content/content-item-viewer-head.html",
            contentLibraryItemBody: privateHtmlDir + "/content/content-item-viewer-body.html",

            addNewTagHead: privateHtmlDir + "/tags/add-new-tag-head.html",
            addNewTagBody: privateHtmlDir + "/tags/add-new-tag-body.html",
            changeTagHead: privateHtmlDir + "/tags/change-tag-info-head.html",
            changeTagBody: privateHtmlDir + "/tags/change-tag-info-body.html",

            authorsHead: privateHtmlDir + "/authors/authors-head.html",
            authorsBody: privateHtmlDir + "/authors/authors-body.html",
            changeAuthorHead: privateHtmlDir + "/authors/change-author-info-head.html",
            changeAuthorBody: privateHtmlDir + "/authors/change-author-info-body.html",
            addNewAuthorHead: privateHtmlDir + "/authors/add-new-author-head.html",
            addNewAuthorBody: privateHtmlDir + "/authors/add-new-author-body.html",

            changeGroupNameHead: privateHtmlDir + "/groups/change-group-info-head.html",
            changeGroupNameBody: privateHtmlDir + "/groups/change-group-info-body.html",

            vkImporterHead: privateHtmlDir + "/vkImporter/vkImporter-head.html",
            vkImporterBody: privateHtmlDir + "/vkImporter/vkImporter-body.html",
        }),
        content: Object.freeze({
            type: Object.freeze({
                comic: "comic",
                comicMini: "comicMini",
                group: "group",
                image: "image",
                music: "music",
                other: "other",
                sound: "sound",
                story: "story",
                storyAudio: "storyAudio",
                storyInteractive: "storyInteractive",
                video: "video",
                videoSeries: "videoSeries",
                all: "all",
            }),
            extraInfo: Object.freeze({
                folderPreview: "folder_",
                preview: "_preview",
                description: "_description",
            }),
            // more symbols to allow?
            allowedSymbolsToDisplayInFileNameRE: /^[a-zA-Z0-9\)\(\+\-\']$/i,
            maxPathLength: 255,
            maxNameLength: 150,
            maxTransliteratedNameLength: 170,
            maxExtensionLength: 10,
            maxGroupNameLength: 150,
            maxTransliteratedGroupNameLength: 170,
            maxNumberInGroup: 1000000000,
            // must be >= 1
            startNumberInGroup: 1,
            noContentAuthor: "<__XXXnoXXX__XXXcontentXXX__XXXauthorXXX__>",
        }),
        folder: Object.freeze({
            art: "/static",
            content: "/Content/Content",
            description: "/Content/Description",
            preview: "/Content/Preview",
            deletedContent: "/Deleted/Content",
            deletedDescription: "/Deleted/Description",
            deletedPreview: "/Deleted/Preview",
            contentType: Object.freeze({
                comic: "/Comic",
                comicMini: "/ComicMini",
                image: "/Image",
                music: "/Music",
                other: "/Other",
                group: "/Group",
                sound: "/Sound",
                story: "/Story",
                storyAudio: "/StoryAudio",
                storyInteractive: "/StoryInteractive",
                video: "/Video",
                videoSeries: "/VideoSeries",
            }),
        }),
        author: Object.freeze({ maxNameLength: 150, maxLinkLegnth: 200 }),
        description: Object.freeze({
            extension: "xml",
        }),
        id: Object.freeze({
            type: Object.freeze({
                author: "author",
                content: "content",
                group: "group",
                tag: "tag",
            }),
            firstSymbol: Object.freeze({ author: "A", content: "F", group: "G", tag: "T" }),
            requiredLength: 16,
        }),
        folderSequence: Object.freeze({
            // it must be 1000 but for testing now we will take 3
            max: 10,
            initial: "000100010001",
            levelLength: 4,
        }),
        post: Object.freeze({
            maxPostTitleLength: 25,
        }),
        preview: Object.freeze({
            emptyExtension: "empty",
            maxDimensionSize: 400,
            // gif frame for preview
            // gifFrame: "0",
            // video timestamp for preview
            // can be also in seconds 20.5
            // and in normal time 01:10.25
            timestamp: "99%",
            extension: "png",
            default: Object.freeze({
                folder: "folder_icon.png",
                image: "image_icon.png",
                video: "video_icon.png",
                sound: "sound_icon.png",
                music: "sound_icon.png",
                story: "story_icon.png",
                other: "other_icon.jpg",
            }),
        }),
        tag: Object.freeze({ maxNameLength: 150 }),
        localization: Object.freeze({
            ru: "ru",
            en: "en",
            file: Object.freeze({
                ru: privateLocalizationDir + "/ru.properties",
                en: privateLocalizationDir + "/en.properties",
            }),
            main: "Library.Page.Main",
            menu: Object.freeze({
                navigation: "Library.Menu.Navigation",
                content: "Library.Menu.Content",
                actions: "Library.Menu.Actions",
                authors: "Library.Menu.Authors",
                tags: "Library.Menu.Tags",
                contentType: "Library.Menu.ContentType",
            }),
            watchContent: "Library.WatchPage",
            addNewContent: "Library.Page.AddNewContent",
            addNewContentUploadProcess: "Library.Page.AddNewContent.UploadProcess",
            authors: "Library.Page.Authors",
            addNewAuthor: "Library.Page.AddNewAuthor",
            addNewAuthorUploadProcess: "Library.Page.AddNewAuthor.UploadProcess",
            changeAuthorInfo: "Library.Page.ChangeAuthorInfo",
            addNewTag: "Library.Page.AddNewTag",
            changeTag: "Library.Page.ChangeTagInfo",
            addNewTagUploadProcess: "Library.Page.AddNewTag.UploadProcess",
            changeGroupInfo: "Library.Page.ChangeGroupInfo",
            settingsPage: "Library.Page.Settings",
        }),
    }),
});
