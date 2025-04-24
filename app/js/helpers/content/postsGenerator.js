const _ = require("underscore");
const fs = require("fs");

const {
    getContentTypeBasedOnApi,
    modifyHtmlFile,
    getContentTypeFolder,
    parseFolderSequence,
    transliterationGenerator,
    getFileFullName,
    getFormattedDate,
    getFormattedSize,
    getFormattedDuration,
    getApiBasedOnContentType,
} = require("../commonHelpers.js");
const { getLocalizedResource } = require("../../localizer.js");
const { getSetting } = require("../../settings.js");
const { pageCreator, setLastPage } = require("../pageCreator.js");
const { assemblePage } = require("../assemblePage.js");
const {
    getAllContentData,
    getALLDATA,
    getMaxNumberInGroupForCertainGroup,
    getGroupType,
    getTotalNumberInGroup,
    getGroupnames,
    getCertainGroupInfo,
} = require("../commonDBRequests.js");
const extensionWorker = require("../extensionWorker.js");
const constants = require("../../constants.js");

exports.getPostsWithGroups = async function (
    contentPath,
    groupName,
    page,
    pagePath,
    contentTypeObject,
    goBackAction
) {
    const locPart = constants.library.localization.watchContent;
    const apiLibrary = constants.library.api;
    const type = constants.library.content.type;

    var contentType;
    switch (contentPath) {
        case apiLibrary.comics:
            contentType = type.comic;
            break;

        case apiLibrary.comicsMini:
            contentType = type.comicMini;
            break;

        case apiLibrary.videoSeries:
            contentType = type.videoSeries;
            break;

        case apiLibrary.stories:
            contentType = type.story;
            break;

        case apiLibrary.storiesAudio:
            contentType = type.storyAudio;
            break;

        case apiLibrary.storiesInteractive:
            contentType = type.storyInteractive;
            break;

        case apiLibrary.other:
            contentType = type.other;
            break;

        default:
            return constants.library.status.NOT_FOUND;
    }

    const pageInt = parseInt(page);

    var htmlBody = await getAllContentOfCertainType(
        contentType,
        (pageInt - 1) * parseInt(getSetting("numberOfPosts")),
        page,
        groupName,
        contentTypeObject
    );

    if (htmlBody === constants.library.status.NOT_FOUND) {
        return constants.library.status.NOT_FOUND;
    }

    var pagesList = "";
    if (htmlBody) {
        pagesList = pageCreator(pagePath, pageInt);
    } else {
        htmlBody = `<div class="no-posts">Ничего не найдено</div>`;
    }

    const html = await modifyHtmlFile(
        constants.library.page.dataLibraryItemPageBody,
        "{POSTS}",
        htmlBody
    );

    const assembledPage = await assemblePage(constants.library.page.dataLibraryItemPageHead, html);

    const templ = _.template(assembledPage);

    // я думаю чтобы не дёргать бд по миллиарду раз нам нужно будет сохранить её и держать в памяти, записать где-то в отдельном классе, что она не менялась и там же её текущее значение
    // если что-то меняется (сортировка, новый контент, редактировние и т.д.) то мы даём сигнал сразу же, что эта уже устарела и нужна новая (в отдельный файл логику вынести)
    // или есть вариант даже лучше, мы будем запрос делать к бд что типа нужно 1000 записей, 100 и т.д.  и брать только нужное нам сейчас количество,
    // change locPart here cause it's different content
    return templ({
        title: getLocalizedResource(`${locPart}.Title`),
        goBackAction: goBackAction,
        cssTheme: getSetting("theme"),

        pagesList: pagesList,
    });
};

exports.getPostsWithoutGroups = async function (
    contentPath,
    page,
    pagePath,
    gobackAction,
    contentTypeObject
) {
    const locPart = constants.library.localization.watchContent;
    const type = constants.library.content.type;

    var contentType = getContentTypeBasedOnApi(contentPath);
    if (!contentType) {
        return constants.library.status.NOT_FOUND;
    }

    const pageInt = parseInt(page);

    // seemslike bad idea to read folder names all the time
    var htmlBody;
    if (contentType !== type.all) {
        htmlBody = await getAllContentOfCertainType(
            contentType,
            (pageInt - 1) * parseInt(getSetting("numberOfPosts")),
            page,
            "",
            contentTypeObject
        );
    } else {
        htmlBody = await getAllContent(
            (pageInt - 1) * parseInt(getSetting("numberOfPosts")),
            page,
            contentTypeObject
        );
    }

    if (htmlBody === constants.library.status.NOT_FOUND) {
        return constants.library.status.NOT_FOUND;
    }

    var pagesList = "";
    if (htmlBody) {
        pagesList = pageCreator(pagePath, pageInt);
    } else {
        htmlBody = `<div class="no-posts">Ничего не найдено</div>`;
    }

    const html = await modifyHtmlFile(
        constants.library.page.dataLibraryItemPageBody,
        "{POSTS}",
        htmlBody
    );

    const assembledPage = await assemblePage(constants.library.page.dataLibraryItemPageHead, html);

    const templ = _.template(assembledPage);

    // change locPart here cause it's different content

    return templ({
        title: getLocalizedResource(`${locPart}.Title`),
        goBackAction: gobackAction,
        cssTheme: getSetting("theme"),

        pagesList: pagesList,
    });
};

// переимненовать и убрать этот goBackaction, лучше вместо него сделать переход на уровень вверх
exports.getPost = async function (id, api, extraObject, groupName, goBackAction) {
    const locPart = constants.library.localization.watchContent;

    var contentType = getContentTypeBasedOnApi(api);
    if (!contentType) {
        return constants.library.status.NOT_FOUND;
    }

    var datum = await getPrevNextContent(extraObject, contentType, groupName, id);
    var hereIsPrev = datum.prevContentID;
    var hereIsNext = datum.nextContentID;

    if (hereIsPrev) {
        hereIsPrev = `${goBackAction}/${hereIsPrev}`;
    } else {
        hereIsPrev = "";
    }

    if (hereIsNext) {
        hereIsNext = `${goBackAction}/${hereIsNext}`;
    } else {
        hereIsNext = "";
    }

    const htmlBody = await getContentInfo(id, hereIsPrev, hereIsNext);
    if (htmlBody === constants.library.status.NOT_FOUND) {
        return constants.library.status.NOT_FOUND;
    }

    const html = await modifyHtmlFile(
        constants.library.page.contentLibraryItemBody,
        "{POST-DATA}",
        htmlBody
    );

    const assembledPage = await assemblePage(constants.library.page.contentLibraryItemHead, html);

    const templ = _.template(assembledPage);

    return templ({
        title: getLocalizedResource(`${locPart}.Title`),
        goBackAction: goBackAction,
        cssTheme: getSetting("theme"),

        contentTitle: getLocalizedResource(`${locPart}.ContentTitle`),
        favourite: getLocalizedResource(`${locPart}.Favourite`),
        tags: getLocalizedResource(`${locPart}.Tags`),
        author: getLocalizedResource(`${locPart}.Author`),
        extension: getLocalizedResource(`${locPart}.Extension`),
        creationDate: getLocalizedResource(`${locPart}.CreationDate`),
        additionDate: getLocalizedResource(`${locPart}.AdditionDate`),
        size: getLocalizedResource(`${locPart}.Size`),
        description: getLocalizedResource(`${locPart}.Description`),
        resolution: getLocalizedResource(`${locPart}.Resolution`),
        duration: getLocalizedResource(`${locPart}.Duration`),
        numberInGroup: getLocalizedResource(`${locPart}.NumberInGroup`),
        save: getLocalizedResource(`${locPart}.Save`),
    });
};

async function getAllContent(chunkOffset, currentPage, extraObject = null) {
    const allFilenames = await getAllContentData(extraObject, "", "");

    const numberOfPosts = parseInt(getSetting("numberOfPosts"));

    if (allFilenames == constants.library.status.NOT_FOUND) {
        return allFilenames;
    }

    if (!allFilenames || !allFilenames.length) {
        if (currentPage > 1) {
            return constants.library.status.NOT_FOUND;
        }
        return "";
    }

    var i = chunkOffset;
    // do we really need 404 when page is biger than we want???
    if (!allFilenames[i]) {
        return constants.library.status.NOT_FOUND;
    }

    var html = `<div class="all" id="content-type-container">`;
    setLastPage(allFilenames.length / numberOfPosts);
    while (i < chunkOffset + numberOfPosts && allFilenames[i]) {
        var groupId = "";
        var groupParsedFolderSequence = "";
        if (allFilenames[i].GroupID) {
            const groupInfo = await getCertainGroupInfo(allFilenames[i].GroupID);

            if (!groupInfo) {
                return constants.library.status.NOT_FOUND;
            }

            groupId = `/${groupInfo.ID}`;
            groupParsedFolderSequence = parseFolderSequence(groupInfo.FolderSequence);
        }

        html += await generateHtmlPost(
            allFilenames[i],
            getContentTypeFolder(allFilenames[i].Type),
            currentPage,
            parseFolderSequence(allFilenames[i].FolderSequence),
            groupId,
            groupParsedFolderSequence
        );
        i++;
    }
    html += `</div>`;

    return html;
}

async function getAllContentOfCertainType(
    contentType,
    currentPostNumber,
    currentPage,
    foldername = "",
    extraObject = null
) {
    var foldernameClass = "";
    if (foldername) {
        foldernameClass = " " + foldername;
    }

    const allFilenames = await getAllContentData(extraObject, contentType, foldername);

    const numberOfPostsToDisplay = parseInt(getSetting("numberOfPosts"));

    const contentTypeFolder = getContentTypeFolder(contentType);

    const type = constants.library.content.type;

    if (allFilenames == constants.library.status.NOT_FOUND) {
        return allFilenames;
    }

    if (!allFilenames || !allFilenames.length) {
        if (currentPage > 1) {
            return constants.library.status.NOT_FOUND;
        }
        return "";
    }

    var html = `<div class="${contentType}${foldernameClass}" id="content-type-container">`;
    var i = currentPostNumber;
    if (!foldername) {
        switch (contentType) {
            case type.image:
            case type.video:
            case type.music:
            case type.sound:
                if (!allFilenames[i]) {
                    return constants.library.status.NOT_FOUND;
                }

                setLastPage(allFilenames.length / numberOfPostsToDisplay);
                while (i < currentPostNumber + numberOfPostsToDisplay && allFilenames[i]) {
                    html += await generateHtmlPost(
                        allFilenames[i],
                        contentTypeFolder,
                        currentPage,
                        parseFolderSequence(allFilenames[i].FolderSequence)
                    );
                    i++;
                }

                break;

            case type.comic:
            case type.comicMini:
            case type.videoSeries:
            case type.story:
            case type.storyAudio:
            case type.storyInteractive:
            case type.other:
                const groupnames = await getGroupnames(extraObject, contentType, allFilenames);

                if (!groupnames[i]) {
                    return constants.library.status.NOT_FOUND;
                }

                setLastPage(groupnames.length / numberOfPostsToDisplay);
                while (i < currentPostNumber + numberOfPostsToDisplay && groupnames[i]) {
                    html += await generateHtmlGroupPost(
                        groupnames[i].ID,
                        groupnames[i].Name,
                        currentPage,
                        parseFolderSequence(groupnames[i].FolderSequence)
                    );
                    i++;
                }

                break;

            default:
                break;
        }
    } else {
        if (!allFilenames[i]) {
            return constants.library.status.NOT_FOUND;
        }

        setLastPage(allFilenames.length / numberOfPostsToDisplay);
        while (i < currentPostNumber + numberOfPostsToDisplay && allFilenames[i]) {
            const groupInfo = await getCertainGroupInfo(allFilenames[i].GroupID);

            if (!groupInfo) {
                return constants.library.status.NOT_FOUND;
            }

            html += await generateHtmlPost(
                allFilenames[i],
                contentTypeFolder,
                currentPage,
                parseFolderSequence(allFilenames[i].FolderSequence),
                `/${groupInfo.ID}`,
                parseFolderSequence(groupInfo.FolderSequence)
            );
            i++;
        }
    }
    html += `</div>`;

    return html;
}

async function getContentInfo(requestBodyId, prevLinkk, nextLinkk) {
    var allData = await getALLDATA(requestBodyId);

    var content = allData.content;
    var group = allData.group;
    var author = allData.author;
    var tags = allData.tags;
    var descr = allData.descr;

    // have problems showing content for example wmv
    var html = `<div class="post-container">`;
    html += await generateMainContentElement(content, group);

    //many authors for one type of content? that was in plans btw

    // post options
    html += `<div class="post-options">`;
    // удалённое не может быть любимым
    if (!content.IsDeleted) {
        if (!content.IsFavourite) {
            html += `<div class="post-option post-option-favourite"><span class="symbol">☆</span><span class="post-option-favourite-title">Добавить в любимое</span></div>`;
        } else {
            html += `<div class="post-option post-option-favourite"><span class="symbol">★</span><span class="post-option-favourite-title">В любимом</span></div>`;
        }
    }
    //если в панели настроек выбрать опцию копировать файл, а не загужать его, то эта опция должна меняться на другую, которая будет копировать в указанный фолдер (он будет указан в файле ini и по дефолту это будет документы папка)
    if (getSetting("downloadOrCopyContent") === "download") {
        html +=
            `<div class="post-option"><span class="symbol">⇩</span><span class="post-option-download-title">` +
            `<a href="${getContentSrc(content, group)}" ` +
            `download="${transliterationGenerator(content.Name)}.` +
            `${transliterationGenerator(content.Extension)}">` +
            `Скачать</a></span></div>`;
    } else {
        html += `<div class="post-option post-option-copy"><span class="symbol">🗍</span><span class="post-option-copy-title">Копировать</span></div>`;
    }

    html += `<div class="post-option post-option-edit"><span class="symbol">🖊</span><span class="post-option-edit-title">Редактировать</span></div>`;
    html += `<div class="post-option post-option-preview"><span class="symbol">🖼</span><span class="post-option-preview-title">Превью</span></div>`;
    html += `<div class="post-option post-option-tags"><span class="symbol tag-symbol">🏷</span><span class="post-option-tags-title">Тэги</span></div>`;
    html += `<div class="post-option post-option-change-type"><span class="symbol">🖊</span><span class="post-option-change-type-title">Сменить тип</span></div>`;

    // need to do this in the end as i don't know full list of files required for deletion of certain file now
    if (!content.IsDeleted) {
        html += `<div class="post-option post-option-delete"><span class="symbol">🗑</span><span class="post-option-delete-title">Удалить</span></div>`;
    } else {
        html += `<div class="post-option post-option-restore"><span class="symbol">⇧</span><span class="post-option-restore-title">Восстановить</span></div>`;
        html += `<div class="post-option post-option-destroy"><span class="symbol">☠</span><span class="post-option-destroy-title">Уничтожить</span></div>`;
    }

    html += `</div>`;
    // post options

    // post main info
    html += `<div class="post-info">`;

    html += `<div class="post-main-info">`;
    html += `<div class="post-title"><%= contentTitle %>: ${content.Name}</div>`;

    html += `<div class="post-author"><%= author %>: `;
    if (author) {
        html +=
            `<a href="${constants.library.api.main + constants.library.api.author}` +
            `/${author.ID + getApiBasedOnContentType(content.Type)}">${author.Name}</a>`;
    } else {
        html += `-`;
    }
    html += `</div>`;

    // no number in group for not group items
    html += `<div class="post-group-name">Название группы: `;
    if (group) {
        html +=
            `<a href="${constants.library.api.main + getApiBasedOnContentType(content.Type)}` +
            `/1/${group.ID}">${group.Name}</a>`;
    } else {
        html += `-`;
    }
    html += `</div>`;

    // no number in group for not group items
    html += `<div class="post-number-in-group"><%= numberInGroup %>: `;
    if (content.NumberInGroup) {
        html += `${content.NumberInGroup}`;
    } else {
        html += `-`;
    }
    html += `</div>`;

    html += `<div class="post-original-name">Название исходника: ${content.OriginalName}</div>`;

    html += `<div class="post-link-to-original">Ссылка на оригинал: `;
    if (content.LinkToOriginal) {
        html += `${content.LinkToOriginal}`;
    } else {
        html += `-`;
    }
    html += `</div>`;

    html += `</div>`;

    html += `<div class="post-dates">`;
    //format date
    html += `<div class="post-creation-date"><%= creationDate %>: `;
    if (content.CreationDate) {
        html += `${getFormattedDate(content.CreationDate, false, getSetting("dateFormat"))}`;
    } else {
        html += `-`;
    }
    html += `</div>`;

    html +=
        `<div class="post-addition-date">` +
        `<%= additionDate %>: ` +
        `${getFormattedDate(content.AdditionDate, true, getSetting("dateFormat"))}` +
        `</div>`;
    html += `</div>`;

    // post additional info
    html += `<div class="post-additional-info">`;

    var suggestedExtension = "";
    if (content.SuggestedExtension && content.SuggestedExtension !== content.Extension) {
        suggestedExtension = ` <span ext="${content.SuggestedExtension}" class="suggested-extension">(?)</span>`;
    }
    html += `<div class="post-extension"><%= extension %>: ${content.Extension}${suggestedExtension}</div>`;

    var contSize = getFormattedSize(content.Size, getSetting("sizeFormat"));
    html += `<div class="post-size"><%= size %>: ${contSize}</div>`;

    html += `<div class="post-resolution"><%= resolution %>: `;
    if (content.Width && content.Height) {
        html += `${content.Width}x${content.Height}`;
    } else {
        html += `-`;
    }
    html += `</div>`;

    html += `<div class="post-duration"><%= duration %>: `;
    if (content.Duration) {
        var contDuration = getFormattedDuration(content.Duration, getSetting("durationFormat"));
        html += `${contDuration}`;
    } else {
        html += `-`;
    }
    html += `</div>`;

    //additional when file type is not displayed in chrome
    if (content.Name) {
        html +=
            `<div class="post-extra-info"><span info="Оригинальный файл имеет расширение doc и может быть открыт в программе MicrosoftOffice Word.` +
            `Текущее отображаемое расширеник: png" class="something-important">(Дополнительно)<span></div>`;
    }

    html += `</div>`;
    //post additional info

    html += `</div>`;
    // post main info

    // post tags
    var allPostTags = "";
    for (var i = 0; i < tags.length; i++) {
        allPostTags +=
            `<a class="watch-tag" href="` +
            `${constants.library.api.main + constants.library.api.tag}/` +
            `${tags[i].ID + getApiBasedOnContentType(content.Type)}">` +
            `<span class="tag-name">${tags[i].Name}</span>` +
            `</a>`;
    }

    html += `<div class="post-tags">`;
    html += `<div class="post-tags-area">${allPostTags}</div>`;
    html += `</div>`;
    // post tags

    // post description
    descr = replaceForHtml(descr);
    html += `<div class="post-description">`;
    html += `<div>${descr}</div>`;
    html += `</div>`;
    // post description

    //post next and previous items
    if (getSetting("needPrevNextArrows") === "true") {
        if (prevLinkk) {
            html += `<a class="post-previous-item" href="${prevLinkk}">⇦</a>`;
        }

        if (nextLinkk) {
            html += `<a class="post-next-item" href="${nextLinkk}">⇨</a>`;
        }
    }
    //post next and previous items

    html += `</div>`;
    html += `</div>`;

    //   console.log("desr is right now", descr);

    return html;
}

// это ещё используется на клиентской части, по идее этого здесь быть не должно но
// // похоже что сама страница пытается сразу заюзать полученный див, но так как он не совсем корректен то и выходит этот самый баг, тогда следует отправлять дескришн как атрибут, а потом его удалять
function replaceForHtml(str) {
    // в общем это лучше оставить здесь
    str = str.replace(/\n/g, "</div><div>");
    str = str.replace(/<div>\r<\/div>/g, "<br>");
    str = str.replace(/\s\s/g, " &nbsp;");
    //из-за этой регулярки возникает баг с переносами, так как браузер считает всё одной строкой и наинает разбивать слова несмортря на стили, нужно пересмотреть логику редактора и смены описаний
    // а сам браузер не хрчет отображать 2+ пробела без спец символов...
    // str = str.replace(/\s/g, "&nbsp;");
    // пустой <div></div> не даёт абзацев, поэтому нужно делать имеено так

    return str;
}

function getContentSrc(content, group) {
    var extraFolder = "";
    var extraPageAdder = "";
    if (group) {
        extraPageAdder = content.NumberInGroup;
        extraFolder = parseFolderSequence(group.FolderSequence) + `/${group.ID}`;
    }

    var fileFullName = getFileFullName(content.ID, content.Extension, "", extraPageAdder);

    var contentTypeFolder = getContentTypeFolder(content.Type);

    var contentSrc =
        `${constants.library.folder.content + contentTypeFolder + extraFolder}` +
        `${parseFolderSequence(content.FolderSequence)}/${fileFullName}`;

    return contentSrc;
}

// btw have bug when there are 0 groups and we click and then click on create new one dir is null and not found
async function generateMainContentElement(content, group) {
    const type = constants.library.content.type;

    var extraFolder = "";
    var extraPageAdder = "";
    if (group) {
        extraPageAdder = content.NumberInGroup;
        extraFolder = parseFolderSequence(group.FolderSequence) + `/${group.ID}`;
    }

    var extension = content.Extension;
    var suggestedExntesion = content.SuggestedExtension;

    var fileFullName = getFileFullName(content.ID, content.Extension, "", extraPageAdder);

    var contentTypeFolder = getContentTypeFolder(content.Type);

    var contentSrc =
        `${constants.library.folder.content + contentTypeFolder + extraFolder}` +
        `${parseFolderSequence(content.FolderSequence)}/${fileFullName}`;

    var imgPreviewBlock = "";

    var block = "";
    switch (content.Type) {
        case type.music:
        case type.sound:
        case type.storyAudio:
            // do we really need preview file ??? or without image will show???
            //   if (content.HasPreview == 1) {
            // this shouldn't be imgSrcBlock this should be smth like imgSrcPreviewBlock
            block += imgPreviewBlock;
            //  }

            break;

        case type.story:
        case type.storyInteractive:
            //if (content.HasPreview == 1) {
            block += imgPreviewBlock;
            //  }
            break;

        case type.other:
            //  if (content.HasPreview == 1) {
            block += imgPreviewBlock;
            //  }

            break;

        default:
            break;
    }

    var kkk;

    kkk = checkIfChosenHtmlIsRight(
        extension,
        suggestedExntesion,
        extensionWorker.imageDiv,
        `<img id="cursorImage2" src="${contentSrc}" alt="${content.Name}">`
    );
    if (kkk) {
        return block + kkk;
    }

    kkk = checkIfChosenHtmlIsRight(
        extension,
        suggestedExntesion,
        extensionWorker.videoDiv,
        `<video id="cursorVideo" controls>` +
            `<source src="${contentSrc}" alt="${content.Name}" type='video/webm; codecs="vp8, vorbis"'/>` +
            `</video>`
    );
    if (kkk) {
        return block + kkk;
    }

    kkk = checkIfChosenHtmlIsRight(
        extension,
        suggestedExntesion,
        extensionWorker.audioDiv,
        `<audio id="cursorAudio" controls>` +
            `<source src="${contentSrc}" alt="${content.Name}" />` +
            `</audio>`
    );
    if (kkk) {
        return block + kkk;
    }

    if (extensionWorker.checkIfExtensionPassesWithExtension(extension, extensionWorker.textDiv)) {
        return block + "read info from file";
    }

    kkk = checkIfChosenHtmlIsRight(
        extension,
        suggestedExntesion,
        extensionWorker.iframeDiv,
        `<iframe id="iframepdf" src="${contentSrc}"></iframe>`
    );
    if (kkk) {
        return block + kkk;
    }

    return block + "can be opened with (link to program??)";
}

function checkIfChosenHtmlIsRight(extension, suggestedExtension, dictionary, viewHtml) {
    if (extensionWorker.checkIfExtensionPassesWithExtension(extension, dictionary)) {
        // does iframe has alt or we should put contnetName inside???
        return viewHtml;
    }

    if (extensionWorker.checkIfExtensionPassesWithExtension(suggestedExtension, dictionary)) {
        // does iframe has alt or we should put contnetName inside???
        return viewHtml;
    }

    return null;
}

async function getPrevNextContent(extraObject, contentType, groupname, currentID) {
    console.log("это же это?", extraObject, contentType, groupname, currentID);
    if (contentType === constants.library.content.type.all) {
        contentType = "";
    }

    var allContent = await getAllContentData(extraObject, contentType, groupname);

    var hereItIs = allContent.findIndex((o) => o.ID === currentID);
    console.log("ксть такой? ", hereItIs);

    var prevContentID = null;
    var nextContentID = null;
    if (hereItIs !== -1) {
        if (hereItIs !== 0) {
            prevContentID = allContent[hereItIs - 1].ID;
        }
        if (hereItIs !== allContent.length - 1) {
            nextContentID = allContent[hereItIs + 1].ID;
        }
    }

    return { prevContentID, nextContentID };
}

async function generateHtmlPost(
    contentData,
    contentTypeFolder,
    currentPage,
    folderSequence,
    groupId = "",
    groupFolderSequence = ""
) {
    const type = constants.library.content.type;
    const id = contentData.ID;
    const contentName = contentData.Name;

    var contentNumberInGroup = "";
    if (contentData.NumberInGroup) {
        contentNumberInGroup = `${contentData.NumberInGroup}_`;
    }

    const filename =
        `/${contentNumberInGroup + id}` +
        `${constants.library.content.extraInfo.preview}.${constants.library.preview.extension}`;

    const filePathMainPart =
        contentTypeFolder + groupFolderSequence + groupId + folderSequence + filename;

    var html = "";
    if (fs.existsSync(constants.library.dir.contentPreview + filePathMainPart)) {
        html += await generateHtmlImagePreview(
            "",
            contentName,
            id,
            contentData,
            currentPage,
            false,
            constants.library.folder.preview + filePathMainPart
        );
    } else {
        var previewImage;
        switch (contentData.Type) {
            case type.image:
            case type.comic:
            case type.comicMini:
                previewImage = constants.library.preview.default.image;
                break;

            case type.video:
            case type.videoSeries:
                previewImage = constants.library.preview.default.video;
                break;

            case type.story:
            case type.storyAudio:
            case type.storyInteractive:
                previewImage = constants.library.preview.default.story;
                break;

            case type.other:
                previewImage = constants.library.preview.default.other;
                break;

            case type.music:
            case type.sound:
                previewImage = constants.library.preview.default.sound;
                break;

            default:
                break;
        }

        html += await generateHtmlImagePreview(
            "-empty",
            contentName,
            id,
            contentData,
            currentPage,
            previewImage
        );
    }

    return html;
}

async function generateHtmlGroupPost(groupId, groupName, currentPage, parsedGroupFolderSequence) {
    var folderPathMainPart =
        `${constants.library.folder.contentType.group + parsedGroupFolderSequence}/` +
        `${groupId + constants.library.content.extraInfo.preview}.${
            constants.library.preview.extension
        }`;

    var html = "";
    if (fs.existsSync(constants.library.dir.contentPreview + folderPathMainPart)) {
        html += await generateHtmlImagePreview(
            "",
            groupName,
            groupId,
            "",
            currentPage,
            false,
            constants.library.folder.preview + folderPathMainPart
        );
    } else {
        html += await generateHtmlImagePreview(
            "-empty",
            groupName,
            groupId,
            "",
            currentPage,
            constants.library.preview.default.folder
        );
    }

    return html;
}

// do we really need this empty option????
async function generateHtmlImagePreview(
    extraInfo,
    imageAlt,
    itemDivId,
    data,
    currentPage,
    defaultIcon,
    previewSrc = ""
) {
    if (getSetting("viewOfPosts") == "table") {
        var fullOccupiedSpace = "library-watch-item-allspace";
        var gifMark = "";
        // добавить графу средняя инфа
        //   if (imageExtension === "gif") {
        if (data) {
            gifMark = `<div class="special-post-mark">${data.Extension.toUpperCase()}</div>`;
        }
        //   gifMark = `<div class="special-post-mark">GIF</div>`;
        //  }

        if (getSetting("fullOccupiedSpaceOfPosts") == "false") {
            fullOccupiedSpace = "";
        }

        var html =
            `<div class="library-watch-item ` +
            `library-watch-item-${getSetting("sizeOfPosts")} ` +
            `${fullOccupiedSpace}" ` +
            `id="${itemDivId}">`;
        html += `<a class="watch-item-test" href="${currentPage}/${itemDivId}">`;
        html += `<div class="watch-item-test2">`;

        var src;
        if (!defaultIcon) {
            src = previewSrc;
        } else {
            src = `${constants.library.folder.art}/${defaultIcon}`;
        }

        html += gifMark;

        var newImageAlt = imageAlt;
        if (imageAlt.length > constants.library.post.maxPostTitleLength) {
            newImageAlt = "";
            for (var i = 0; i < constants.library.post.maxPostTitleLength - 2; i++) {
                newImageAlt += imageAlt[i];
            }
            newImageAlt += "..." + imageAlt[imageAlt.length - 2] + imageAlt[imageAlt.length - 1];
        }

        html +=
            `<img class="img-preview${extraInfo}-${getSetting("sizeOfPosts")}" ` +
            `src="${src}" alt="${imageAlt}">`;

        if (getSetting("infoOfPosts") == "max") {
            html += `<div class="img-preview-text">${newImageAlt}</div>`;
        }
        html += `</div>`;
        html += `</a>`;
        html += `</div>`;

        return html;
    } else {
        // это для обычных файлов
        if (data) {
            // это вообще дожно быть именно здесь??
            var receivedGroupType = await getALLDATA(data.ID);

            var content = receivedGroupType.content;
            var group = receivedGroupType.group;
            var author = receivedGroupType.author;
            var tags = receivedGroupType.tags;
            var descr = receivedGroupType.descr;

            var maxGroupPage = "";
            if (group) {
                maxGroupPage = await getMaxNumberInGroupForCertainGroup(group.ID);
            }

            var gifMark = "";
            // добавить графу средняя инфа
            //   if (imageExtension === "gif") {
            if (data.Extension) {
                gifMark = `<div class="special-post-mark special-post-mark-list">${data.Extension.toUpperCase()}</div>`;
            }
            //   gifMark = `<div class="special-post-mark">GIF</div>`;
            //  }

            var html =
                `<div class="library-watch-item ` +
                `library-watch-item-${getSetting("sizeOfPosts")} ` +
                `library-watch-item-list " ` +
                `id="${itemDivId}">`;
            html += `<a class="watch-item-list-anchor" href="${currentPage}/${itemDivId}"></a>`;
            html += `<div class="watch-item-test">`;
            html += `<div class="watch-item-test2 watch-item-test2-list">`;

            var src;
            if (!defaultIcon) {
                src = previewSrc;
            } else {
                src = `${constants.library.folder.art}/${defaultIcon}`;
            }

            html += gifMark;

            var newImageAlt = imageAlt;
            if (imageAlt.length > constants.library.post.maxPostTitleLength) {
                newImageAlt = "";
                for (var i = 0; i < constants.library.post.maxPostTitleLength - 2; i++) {
                    newImageAlt += imageAlt[i];
                }
                newImageAlt +=
                    "..." + imageAlt[imageAlt.length - 2] + imageAlt[imageAlt.length - 1];
            }

            html += `<div class="watch-item-list-image">`;
            html +=
                `<img class="img-preview${extraInfo}-${getSetting("sizeOfPosts")}" ` +
                `src="${src}" alt="${imageAlt}">`;
            html += "</div>";

            // console.log("here is it ", data);
            html +=
                `<div class="watch-item-list-description ` +
                `watch-item-list-description-${getSetting("sizeOfPosts")}">`;
            descr = "<div>" + replaceForHtml(descr) + "</div>";
            var allPostTags = "";
            for (var i = 0; i < tags.length; i++) {
                if (tags[i]) {
                    allPostTags +=
                        `<a class="watch-item-list-tag" href="` +
                        `${constants.library.api.main + constants.library.api.tag}/` +
                        `${tags[i].ID + getApiBasedOnContentType(content.Type)}">` +
                        `<span class="tag-name">${tags[i].Name}</span>` +
                        `</a>`;
                }
            }
            if (getSetting("infoOfPosts") == "max") {
                html += `<div class="img-preview-text watch-item-list-title">${newImageAlt}</div>`;

                html += `<div class="watch-item-list-main-info">`;
                if (author) {
                    html +=
                        `<a class="img-preview-text watch-item-list-author" ` +
                        `href="${constants.library.api.main + constants.library.api.author}` +
                        `/${author.ID + getApiBasedOnContentType(content.Type)}">${
                            author.Name
                        }</a>`;
                } else {
                    // это только для тестов
                    html += `<div class="img-preview-text watch-item-list-author">Автор</div>`;
                }

                html += `<div class="img-preview-text watch-item-list-size">${data.Size}</div>`;
                // if (data.Width) {
                html += `<div class="img-preview-text watch-item-list-resolution">${data.Width}x${data.Height}</div>`;
                //   }
                //   if (data.Duration) {
                html += `<div class="img-preview-text watch-item-list-duration">${data.Duration}</div>`;
                //   }
                html += `<div class="img-preview-text watch-item-list-type">${content.Type}</div>`;
                html += `</div>`;

                if (group) {
                    html += `<div class="watch-item-list-main-info">`;
                    html +=
                        `<a class="watch-item-list-group" href="` +
                        `${constants.library.api.main + getApiBasedOnContentType(content.Type)}` +
                        `/1/${group.ID}">${group.Name}</a>`;

                    html += `<div class="img-preview-text watch-item-list-numberInGroup">${content.NumberInGroup} / ${maxGroupPage}</div>`;
                    html += `</div>`;
                } else {
                    // это только для тестов
                    html += `<div class="watch-item-list-main-info">`;
                    html += `<div class="img-preview-text watch-item-list-group">Группа</div>`;
                    html += `<div class="img-preview-text watch-item-list-numberInGroup">1 / 25</div>`;
                    html += `</div>`;
                }

                if (tags[0]) {
                    html += `<div class="watch-item-list-tags-area">`;
                    html += `${allPostTags}`;
                    html += `</div>`;
                }

                // пока там баг
                // нельзя иметь ссылку в ссылке (то есть а в а)
                html += `<div class="watch-item-list-descr">${descr}</div>`;
            }
            html += `</div>`;
            html += `</div>`;
            html += `</div>`;
            html += `</div>`;

            return html;
        } else {
            // это для групп
            // это вообще дожно быть именно здесь??
            var receivedGroupType = await getGroupType(itemDivId);

            var maxGroupPage = await getTotalNumberInGroup(itemDivId);
            console.log(maxGroupPage);

            var gifMark = "";
            // добавить графу средняя инфа
            //   if (imageExtension === "gif") {

            gifMark = `<div class="special-post-mark special-post-mark-list"><i class="fa fa-folder-o"></i></div>`;

            //   gifMark = `<div class="special-post-mark">GIF</div>`;
            //  }

            var html =
                `<div class="library-watch-item ` +
                `library-watch-item-${getSetting("sizeOfPosts")} ` +
                `library-watch-item-list " ` +
                `id="${itemDivId}">`;
            html += `<a class="watch-item-list-anchor" href="${currentPage}/${itemDivId}"></a>`;
            html += `<div class="watch-item-test">`;
            html += `<div class="watch-item-test2 watch-item-test2-list">`;

            var src;
            if (!defaultIcon) {
                src = previewSrc;
            } else {
                src = `${constants.library.folder.art}/${defaultIcon}`;
            }

            html += gifMark;

            var newImageAlt = imageAlt;
            if (imageAlt.length > constants.library.post.maxPostTitleLength) {
                newImageAlt = "";
                for (var i = 0; i < constants.library.post.maxPostTitleLength - 2; i++) {
                    newImageAlt += imageAlt[i];
                }
                newImageAlt +=
                    "..." + imageAlt[imageAlt.length - 2] + imageAlt[imageAlt.length - 1];
            }

            html += `<div class="watch-item-list-image">`;
            html +=
                `<img class="img-preview${extraInfo}-${getSetting("sizeOfPosts")}" ` +
                `src="${src}" alt="${imageAlt}">`;
            html += "</div>";

            // console.log("here is it ", data);
            html +=
                `<div class="watch-item-list-description ` +
                `watch-item-list-description-${getSetting("sizeOfPosts")}">`;

            if (getSetting("infoOfPosts") == "max") {
                html += `<div class="img-preview-text watch-item-list-title">${newImageAlt}</div>`;

                html += `<div class="watch-item-list-main-info">`;
                html += `<div class="img-preview-text watch-item-list-type">${receivedGroupType}</div>`;
                html += `</div>`;

                html += `<div class="watch-item-list-main-info">`;
                html += `<div class="img-preview-text watch-item-list-numberInGroup">${maxGroupPage}</div>`;
                html += `</div>`;
            }
            html += `</div>`;
            html += `</div>`;
            html += `</div>`;
            html += `</div>`;

            return html;
        }
    }
}
