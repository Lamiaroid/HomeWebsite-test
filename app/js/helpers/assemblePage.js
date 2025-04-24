const _ = require("underscore");

const { getTotalContentCount, getTotalGroupCount } = require("./commonDBRequests.js");
const { modifyHtmlFile } = require("./commonHelpers.js");
const {
    createNavigationHtmlBlock,
    createContentHtmlBlock,
    createActionsHtmlBlock,
    createSettingsHtmlBlock,
    createSettingsHtmlBlockWithNoSize,
    createSettingsHtmlInputBlock,
    createMenuContentTypeHtmlBlock,
    createAuthorsHtmlBlock,
    createTagsHtmlBlock,
    createFavouritesHtmlBlock,
    createDeletedHtmlBlock,
    createToolsHtmlBlock,
} = require("./htmlBlocks.js");
const { getCurrentLocalization, getLocalizedResource } = require("../localizer.js");
const { getSetting } = require("../settings.js");
const authorsService = require("../services/authorsService.js");
const tagsService = require("../services/tagsService.js");
const constants = require("../constants.js");

async function assemblePage(headFile, bodyFile, needAllPage = true) {
    var html = await modifyHtmlFile(constants.library.page.library);

    const page = constants.library.page;
    const headBaseHtml = needAllPage ? await modifyHtmlFile(page.libraryHeadBase) : "";
    const bannerHtml = needAllPage ? await modifyHtmlFile(page.libraryBanner) : "";
    const menuHtml = needAllPage ? await modifyHtmlFile(page.libraryMenu) : "";
    const panelHtml = needAllPage ? await modifyHtmlFile(page.libraryPanel) : "";
    const backLinkHtml = needAllPage ? "<%= goBackAction %>" : "/";
    const backToMainPageHtml = needAllPage ? "<%= backToMainPage %>" : "На главную";
    const backToMainPageActionHtml = needAllPage ? "<%= backToMainPageAction %>" : "/";
    const localizationHtml = needAllPage ? "<%= localization %>" : getCurrentLocalization();
    const cssThemeHtml = needAllPage ? "<%= cssTheme %>" : getSetting("theme");

    html = modifyMainPage(
        html,
        { whatToModify: "{HEAD-BASE}", modifier: headBaseHtml },
        { whatToModify: "{BANNER}", modifier: bannerHtml },
        { whatToModify: "{MENU}", modifier: menuHtml },
        { whatToModify: "{PANEL}", modifier: panelHtml },
        { whatToModify: "{BACK-LINK}", modifier: backLinkHtml },
        { whatToModify: "{BACK-TO-MAIN-PAGE}", modifier: backToMainPageHtml },
        { whatToModify: "{BACK-TO-MAIN-PAGE-ACTION}", modifier: backToMainPageActionHtml },
        { whatToModify: "{LOCALIZATION}", modifier: localizationHtml },
        { whatToModify: "{CSS-THEME}", modifier: cssThemeHtml }
    );

    if (needAllPage) {
        html = await decorateMainPage(html);
    }

    const headHtml = await modifyHtmlFile(headFile);
    const bodyHtml = await modifyHtmlFile(bodyFile);

    html = modifyMainPage(
        html,
        { whatToModify: "{HEAD}", modifier: headHtml },
        { whatToModify: "{CONTENT}", modifier: bodyHtml }
    );

    return html;
}

async function assemblePage404() {
    return await assemblePage(
        constants.library.page.page404Head,
        constants.library.page.page404Body,
        false
    );
}

function modifyMainPage(...data) {
    var html = data[0].replaceAll(new RegExp(data[1].whatToModify, "g"), data[1].modifier);

    var i = 2;
    while (i < data.length) {
        html = html.replaceAll(new RegExp(data[i].whatToModify, "g"), data[i].modifier);
        i++;
    }

    return html;
}

async function decorateMainPage(html) {
    var locPart = constants.library.localization.menu.navigation;
    var navigationList = createNavigationHtmlBlock(
        {
            localizedResource: getLocalizedResource(`${locPart}.Content`),
        },
        {
            localizedResource: getLocalizedResource(`${locPart}.Actions`),
        },
        {
            localizedResource: getLocalizedResource(`${locPart}.Tags`),
        },
        {
            localizedResource: getLocalizedResource(`${locPart}.Authors`),
        },
        {
            localizedResource: getLocalizedResource(`${locPart}.Favourites`),
        },
        {
            localizedResource: getLocalizedResource(`${locPart}.Deleted`),
        },
        {
            localizedResource: getLocalizedResource(`${locPart}.Tools`),
        }
    );

    // как на данбоору ещё 1000 = 1к, 1300 = 1.3k , 1700000 = 1.7M
    // + при наведении маленькой подсказкой точное количество
    // + ещё рядом количество групп отображать для типов с группами
    const imageTypeCount = await getTotalContentCount(constants.library.content.type.image);
    const comicTypeCount = await getTotalContentCount(constants.library.content.type.comic);
    const comicMiniTypeCount = await getTotalContentCount(constants.library.content.type.comicMini);
    const videoTypeCount = await getTotalContentCount(constants.library.content.type.video);
    const videoSeriesTypeCount = await getTotalContentCount(
        constants.library.content.type.videoSeries
    );
    const musicTypeCount = await getTotalContentCount(constants.library.content.type.music);
    const soundTypeCount = await getTotalContentCount(constants.library.content.type.sound);
    const storyTypeCount = await getTotalContentCount(constants.library.content.type.story);
    const storyAudioTypeCount = await getTotalContentCount(
        constants.library.content.type.storyAudio
    );
    const storyInteractiveTypeCount = await getTotalContentCount(
        constants.library.content.type.storyInteractive
    );
    const otherTypeCount = await getTotalContentCount(constants.library.content.type.other);

    const comicGroupsTotalCount = await getTotalGroupCount(constants.library.content.type.comic);
    const comicMiniGroupsTotalCount = await getTotalGroupCount(
        constants.library.content.type.comicMini
    );
    const videoSeriesGroupsTotalCount = await getTotalGroupCount(
        constants.library.content.type.videoSeries
    );
    const storyGroupsTotalCount = await getTotalGroupCount(constants.library.content.type.story);
    const storyAudioGroupsTotalCount = await getTotalGroupCount(
        constants.library.content.type.storyAudio
    );
    const storyInteractiveGroupsTotalCount = await getTotalGroupCount(
        constants.library.content.type.storyInteractive
    );
    const otherGroupsTotalCount = await getTotalGroupCount(constants.library.content.type.other);

    locPart = constants.library.localization.menu.content;
    var categoriesList = createContentHtmlBlock(
        {
            requiredApi: constants.library.api.images,
            localizedResource: getLocalizedResource(`${locPart}.Images`),
            contentTotal: imageTypeCount,
        },
        {
            requiredApi: constants.library.api.comics,
            localizedResource: getLocalizedResource(`${locPart}.Comics`),
            contentTotal: comicTypeCount,
            groupsTotal: comicGroupsTotalCount,
        },
        {
            requiredApi: constants.library.api.comicsMini,
            localizedResource: getLocalizedResource(`${locPart}.ComicsMini`),
            contentTotal: comicMiniTypeCount,
            groupsTotal: comicMiniGroupsTotalCount,
        },
        {
            requiredApi: constants.library.api.videos,
            localizedResource: getLocalizedResource(`${locPart}.Videos`),
            contentTotal: videoTypeCount,
        },
        {
            requiredApi: constants.library.api.videoSeries,
            localizedResource: getLocalizedResource(`${locPart}.VideoSeries`),
            contentTotal: videoSeriesTypeCount,
            groupsTotal: videoSeriesGroupsTotalCount,
        },
        {
            requiredApi: constants.library.api.music,
            localizedResource: getLocalizedResource(`${locPart}.Music`),
            contentTotal: musicTypeCount,
        },
        {
            requiredApi: constants.library.api.sounds,
            localizedResource: getLocalizedResource(`${locPart}.Sounds`),
            contentTotal: soundTypeCount,
        },
        {
            requiredApi: constants.library.api.stories,
            localizedResource: getLocalizedResource(`${locPart}.Stories`),
            contentTotal: storyTypeCount,
            groupsTotal: storyGroupsTotalCount,
        },
        {
            requiredApi: constants.library.api.storiesAudio,
            localizedResource: getLocalizedResource(`${locPart}.StoriesAudio`),
            contentTotal: storyAudioTypeCount,
            groupsTotal: storyAudioGroupsTotalCount,
        },
        {
            requiredApi: constants.library.api.storiesInteractive,
            localizedResource: getLocalizedResource(`${locPart}.StoriesInteractive`),
            contentTotal: storyInteractiveTypeCount,
            groupsTotal: storyInteractiveGroupsTotalCount,
        },
        {
            requiredApi: constants.library.api.other,
            localizedResource: getLocalizedResource(`${locPart}.Other`),
            contentTotal: otherTypeCount,
            groupsTotal: otherGroupsTotalCount,
        },
        {
            requiredApi: constants.library.api.all,
            localizedResource: getLocalizedResource(`${locPart}.All`),
            contentTotal:
                imageTypeCount +
                comicTypeCount +
                comicMiniTypeCount +
                videoTypeCount +
                videoSeriesTypeCount +
                musicTypeCount +
                soundTypeCount +
                storyTypeCount +
                storyAudioTypeCount +
                storyInteractiveTypeCount +
                otherTypeCount,
            groupsTotal:
                comicGroupsTotalCount +
                comicMiniGroupsTotalCount +
                videoSeriesGroupsTotalCount +
                storyGroupsTotalCount +
                storyAudioGroupsTotalCount +
                storyInteractiveGroupsTotalCount +
                otherGroupsTotalCount,
        }
    );

    locPart = constants.library.localization.menu.actions;
    categoriesList += createActionsHtmlBlock(
        {
            requiredApi: constants.library.api.addNewContent,
            localizedResource: getLocalizedResource(`${locPart}.AddNewContent`),
        },
        {
            requiredApi: constants.library.api.addNewAuthor,
            localizedResource: getLocalizedResource(`${locPart}.AddNewAuthor`),
        },
        {
            requiredApi: constants.library.api.addNewTag,
            localizedResource: getLocalizedResource(`${locPart}.AddNewTag`),
        },
        {
            requiredApi: constants.library.api.changeGroupInfo,
            localizedResource: getLocalizedResource(`${locPart}.ChangeGroupInfo`),
        },
        {
            requiredApi: constants.library.api.changeAuthor,
            localizedResource: getLocalizedResource(`${locPart}.ChangeAuthorInfo`),
        },
        {
            requiredApi: constants.library.api.changeTag,
            localizedResource: getLocalizedResource(`${locPart}.ChangeTagInfo`),
        }
    );

    locPart = constants.library.localization.menu.authors;
    var authors = await authorsService.getAuthorInfo(false);
    categoriesList += createAuthorsHtmlBlock(authors);

    locPart = constants.library.localization.menu.tags;

    // + ещё количество как на главной с папочками? а как это вообще реализовать? оно типа динамически должно как-то там же разные типы
    var tags = await tagsService.getTagInfo();

    categoriesList += createTagsHtmlBlock(tags);

    categoriesList += createFavouritesHtmlBlock();

    categoriesList += createDeletedHtmlBlock();

    categoriesList += createToolsHtmlBlock(
        { link: "", name: "Image to Braille" },
        { link: "", name: "Журнал" },
        { link: "", name: "Сравнение изображений" },
        { link: `${constants.library.api.main}/VKIMPORTER`, name: "Импортер постов ВК" },
        { link: ``, name: "Загзучик файла с запроса" },
        { link: ``, name: "Gallery dl?" }
    );

    locPart = constants.library.localization.settingsPage;
    var settingsList =
        createSettingsHtmlBlockWithNoSize(
            "Сортировать посты по",
            "sortPostsBy",
            getSetting("sortPostsBy"),
            {
                optionValue: "Name",
                optionText: "Названию",
            },
            {
                optionValue: "Size",
                optionText: "Размеру",
            },
            {
                optionValue: "CreationDate",
                optionText: "Дате создания (если есть)",
            },
            {
                optionValue: "AdditionDate",
                optionText: "Дате добавления",
            },
            {
                optionValue: "Width",
                optionText: "Ширине (если есть)",
            },
            {
                optionValue: "Height",
                optionText: "Высоте (если есть)",
            },
            {
                optionValue: "Duration",
                optionText: "Продолжительности (если есть)",
            },
            {
                optionValue: "NumberInGroup",
                optionText: "Номеру в группе (если есть)",
            },
            {
                optionValue: "Extension",
                optionText: "Расширению",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "В порядке",
            "sortPostsOrder",
            getSetting("sortPostsOrder"),
            {
                optionValue: "ASC",
                optionText: "Возрастания",
            },
            {
                optionValue: "DESC",
                optionText: "Убывания",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Сортировать группы по",
            "sortGroupsBy",
            getSetting("sortGroupsBy"),
            {
                optionValue: "Name",
                optionText: "Названию",
            },
            {
                optionValue: "AdditionDate",
                optionText: "Дате добавления",
            },
            {
                optionValue: "TotalSize",
                optionText: "Размеру",
            },
            {
                optionValue: "TotalNumberInGroup",
                optionText: "Количеству номеров в группе",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "В порядке (группы)",
            "sortGroupsOrder",
            getSetting("sortGroupsOrder"),
            {
                optionValue: "ASC",
                optionText: "Возрастания",
            },
            {
                optionValue: "DESC",
                optionText: "Убывания",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Количество постов на странице",
            "numberOfPosts",
            getSetting("numberOfPosts"),
            {
                optionValue: 10,
                optionText: 10,
            },
            {
                optionValue: 25,
                optionText: 25,
            },
            {
                optionValue: 50,
                optionText: 50,
            },
            {
                optionValue: 100,
                optionText: 100,
            },
            {
                optionValue: 250,
                optionText: 250,
            },
            {
                optionValue: 500,
                optionText: 500,
            },
            {
                optionValue: 1000,
                optionText: 1000,
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Размер постов",
            "sizeOfPosts",
            getSetting("sizeOfPosts"),
            {
                optionValue: "small",
                optionText: "Маленький",
            },
            {
                optionValue: "medium",
                optionText: "Средний",
            },
            {
                optionValue: "big",
                optionText: "Большой",
            },
            {
                optionValue: "huge",
                optionText: "Огромный",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Заполнять постами всё место или оставлять пространство",
            "fullOccupiedSpaceOfPosts",
            getSetting("fullOccupiedSpaceOfPosts"),
            {
                optionValue: "true",
                optionText: "Всё",
            },
            {
                optionValue: "false",
                optionText: "Оставлять",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Отображение постов",
            "viewOfPosts",
            getSetting("viewOfPosts"),
            {
                optionValue: "table",
                optionText: "Таблица",
            },
            {
                optionValue: "list",
                optionText: "Список",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Информация постов",
            "infoOfPosts",
            getSetting("infoOfPosts"),
            {
                optionValue: "max",
                optionText: "Максимальная",
            },
            {
                optionValue: "min",
                optionText: "Минимальная",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Скачивать или копировать контент",
            "downloadOrCopyContent",
            getSetting("downloadOrCopyContent"),
            {
                optionValue: "download",
                optionText: "Скачать",
            },
            {
                optionValue: "copy",
                optionText: "Копировать",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Отображать стрелки для перехода на следующий/предыдущий контент",
            "needPrevNextArrows",
            getSetting("needPrevNextArrows"),
            {
                optionValue: "true",
                optionText: "Да",
            },
            {
                optionValue: "false",
                optionText: "Нет",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Цветные названия для разных типов контента",
            "colorfulContentTypeTitles",
            getSetting("colorfulContentTypeTitles"),
            {
                optionValue: "true",
                optionText: "Да",
            },
            {
                optionValue: "false",
                optionText: "Нет",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Отображать ссылки автора в виде",
            "authorLinksFormat",
            getSetting("authorLinksFormat"),
            {
                optionValue: "text",
                optionText: "Текста",
            },
            {
                optionValue: "image",
                optionText: "Картинок",
            }
        ) +
        createSettingsHtmlBlock(
            "Формат показа даты",
            "dateFormat",
            getSetting("dateFormat"),
            {
                optionValue: "number",
                optionText: "01.12.2021",
            },
            {
                optionValue: "combined",
                optionText: "1 Декабря 2021",
            }
        ) +
        createSettingsHtmlBlock(
            "Показа размера файла в",
            "sizeFormat",
            getSetting("sizeFormat"),
            {
                optionValue: "byte",
                optionText: "Байтах",
            },
            {
                optionValue: "kilobyte",
                optionText: "Килобайтах",
            },
            {
                optionValue: "megabyte",
                optionText: "Мегабайтах",
            },
            {
                optionValue: "gigabyte",
                optionText: "Гигабайтах",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Показа продожительности в",
            "durationFormat",
            getSetting("durationFormat"),
            {
                optionValue: "seconds",
                optionText: "4238.24 (секунды)",
            },
            {
                optionValue: "standard",
                optionText: "01:10:38.24 (стандартно)",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            `Тема (вариации с подсветкой и т.д. + замутить значок светлой темы в
                                баннере пока просто оставим безвыбора, то есть он ни на что не
                                влияет)`,
            "theme",
            getSetting("theme"),
            {
                optionValue: "dark",
                optionText: "Тёмная",
            },
            {
                optionValue: "light",
                optionText: "Светлая",
            }
        ) +
        createSettingsHtmlBlockWithNoSize(
            "Язык",
            "language",
            getSetting("language"),
            {
                optionValue: "ru",
                optionText: "Русский",
            },
            {
                optionValue: "en",
                optionText: "English",
            }
        ) +
        createSettingsHtmlInputBlock("Путь для копирования", "copyPath", getSetting("copyPath"));

    locPart = constants.library.localization.menu.contentType;
    var menuContentType = createMenuContentTypeHtmlBlock(
        "Тип контента",
        "authorContentType",
        // should use settings to get value for this
        "testonclientnow",
        {
            optionValue: "images",
            optionText: "Изображения",
        },
        {
            optionValue: "comics",
            optionText: "Комиксы",
        },
        {
            optionValue: "comics-mini",
            optionText: "Миникомиксы",
        },
        {
            optionValue: "videos",
            optionText: "Видео",
        },
        {
            optionValue: "video-series",
            optionText: "Сериалы",
        },
        {
            optionValue: "music",
            optionText: "Музыка",
        },
        {
            optionValue: "sounds",
            optionText: "Звуки",
        },
        {
            optionValue: "stories",
            optionText: "Истории",
        },
        {
            optionValue: "stories-audio",
            optionText: "Истории (аудио)",
        },
        {
            optionValue: "stories-interactive",
            optionText: "Истории (интерактивные)",
        },
        {
            optionValue: "other",
            optionText: "Другое",
        },
        {
            optionValue: "all",
            optionText: "Всё",
        }
    );

    var templ = _.template(html);

    locPart = constants.library.localization.main;
    // should global variable be used in order not to read file every time or not?
    return templ({
        localization: getCurrentLocalization(),
        showMenuOption: getLocalizedResource(`${locPart}.ShowMenuOption`),
        showPanelOption: getLocalizedResource(`${locPart}.ShowPanelOption`),
        backToMainPage: getLocalizedResource(`${locPart}.BackToMainPage`),
        panelContent: settingsList,
        menuLeftNavigation: navigationList,
        menuLeftContent: categoriesList,
        menuContentType: menuContentType,
        backToMainPageAction: constants.library.api.main,
        goBackAction: "<%= goBackAction %>",
        cssTheme: getSetting("theme"),
    });
}

module.exports = {
    assemblePage,
    assemblePage404,
};
