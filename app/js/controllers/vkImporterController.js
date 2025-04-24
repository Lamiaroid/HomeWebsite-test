const _ = require("underscore");
const request = require("request-promise");
const fs = require("fs");
const client = require("https");

var { getVkPostInfo } = require("../helpers/vkImporter/vkWallImporter.js");
const {
    getVkUserId,
    getVideoInfo,
    getVkUserInfo,
    getVkGroupInfo,
    getRealLink,
    vkRequestor,
} = require("../helpers/vkImporter/vkImporterHelper.js");
const { assemblePage } = require("../helpers/assemblePage.js");
const { getSetting } = require("../settings.js");
const { getCurrentLocalization, getLocalizedResource } = require("../localizer.js");
const constants = require("../constants.js");

const vkAuthObj = {
    scope: "notify,photos,friends,audio,video,notes,pages,docs,status,questions,offers,wall,groups,notifications,stats,ads,offline",
    // зарегать приложение в вк и получить id
    appID: 1,
    display: "page",
    responseType: "token",
    apiVersion: "5.131",
};

const vkAuthURL =
    `https://oauth.vk.com/authorize?client_id=${vkAuthObj.appID}` +
    `&display=${vkAuthObj.display}` +
    `&scope=${vkAuthObj.scope}` +
    `&response_type=${vkAuthObj.responseType}` +
    `&v=${vkAuthObj.apiVersion}` +
    `&state=123456`;

// dupicate in post generator везде (жто нужно куда-то в отдельное место)
// это ещё используется на клиентской части, по идее этого здесь быть не должно но
// // похоже что сама страница пытается сразу заюзать полученный див, но так как он не совсем корректен то и выходит этот самый баг, тогда следует отправлять дескришн как атрибут, а потом его удалять
function replaceForHtml(str) {
    // в общем это лучше оставить здесь
    str = str.replace(/\n/g, "</div><div>");
    str = str.replace(/<div><\/div>/g, "<br>");
    str = str.replace(/<div>\r<\/div>/g, "<br>");
    str = str.replace(/\s\s/g, " &nbsp;");
    //из-за этой регулярки возникает баг с переносами, так как браузер считает всё одной строкой и наинает разбивать слова несмортря на стили, нужно пересмотреть логику редактора и смены описаний
    // а сам браузер не хрчет отображать 2+ пробела без спец символов...
    // str = str.replace(/\s/g, "&nbsp;");
    // пустой <div></div> не даёт абзацев, поэтому нужно делать имеено так

    return str;
}

async function genPost(needPosts, offset) {
    var info = await getVkPostInfo(needPosts, offset);

    switch (info) {
        case 15:
            console.log("Приватный профиль, не могу взять оттуда пост");
            return;

        default:
            break;
    }

    var authorsList = "";
    for (var i = 0; i < info.length; i++) {
        var postId = info[i].postId;
        var postAttachments = info[i].postAttachments;
        var postDescription = info[i].postDescription;

        var originalPoster = {
            avatar: info[i].originalPosterAvatar,
            id: info[i].originalPosterId,
            name: info[i].originalPosterName,
            cover: info[i].originalPosterCover,
            originalPostTime: info[i].originalPostTime,
            originalPosterMark: info[i].originalPosterMark,
        };

        var reposter = {
            avatar: info[i].reposterAvatar,
            id: info[i].reposterId,
            name: info[i].reposterName,
            repostTime: info[i].repostTime,
            reposterMark: info[i].reposterMark,
        };

        var player = info[i].player;

        console.log(`Ссылочка на видосик ${player}`);

        authorsList += `<div class="vkPost">`;
        authorsList += `<div class="vkPost-inner">`;

        var headerBackground = "";
        if (originalPoster.cover) {
            headerBackground = `style="background-image: url(${originalPoster.cover});" `;
        }

        authorsList += `<div class="vkPost-header">`;
        authorsList += `<div ${headerBackground}class="vkPost-header-cover"></div>`;
        authorsList +=
            `<a ` +
            `href="https://vk.com/${originalPoster.originalPosterMark}` +
            `${Math.abs(originalPoster.id)}">` +
            `<img class="vkPost-avatar" src="${originalPoster.avatar}">` +
            `</a>`;
        authorsList += `<div class="vkPost-title-composition">`;
        authorsList +=
            `<a class="vkPost-title" ` +
            `href="https://vk.com/${originalPoster.originalPosterMark}` +
            `${Math.abs(originalPoster.id)}">` +
            `${originalPoster.name}</a>`;
        authorsList +=
            `<a class="vkPost-creation-date" ` +
            `href="https://vk.com/wall${originalPoster.id}_${postId}">` +
            `${timeConverter(originalPoster.originalPostTime)}` +
            `<i class="vkPost-creation-date-icon fa fa-vk"></i></a>`;
        authorsList += `</div>`;
        authorsList += `<div class="vkPost-actions-composition">`;
        authorsList += `<div class="vkPost-approve"><i class="fa fa-check"></i></div>`;
        authorsList += `<div class="vkPost-reject"><i class="fa fa-times"></i></div>`;
        authorsList += `</div>`;
        authorsList += `</div>`;

        authorsList += `<div class="vkPost-main-info">`;
        authorsList +=
            `<div class="vkPost-description">` +
            `<div>${replaceForHtml(postDescription)}</div>` +
            `</div>`;
        authorsList += `</div>`;

        authorsList += `<div class="vkPost-content-container">`;
        for (var j = 0; j < postAttachments.length; j++) {
            authorsList += `<div class="vkPost-content-image-container">`;
            authorsList += `<img class="vkPost-content-image" src="${postAttachments[j]}">`;
            authorsList += `</div>`;
        }
        authorsList += `</div>`;

        authorsList += `<div class="vkPost-links-container">`;
        authorsList +=
            `<a class="vkPost-link" href="https://vk.com/wall${originalPoster.id}_${postId}">` +
            `<i class="vkPost-link-icon fa fa-vk"></i><span class="vkPost-link-title">Источник</span>` +
            `</a>`;
        authorsList += `</div>`;

        authorsList += `</div>`;
        authorsList += `</div>`;
    }

    return authorsList;
}

async function generateVkPostForDiscord(request, response) {
    const locPart = constants.library.localization.authors;

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    var needPosts = 50; // MAX = 100
    var offset = 0;

    var authorsList = ""; // await genPost(needPosts, offset);

    // у нас ограничение на 5 запросов в секунду, поэтому что мы делаем?
    // динамически подругражем? или по 3 поста на кпоку грузим (с ожиданием в 3 секунды)
    //await delay(1000);

    const html = await assemblePage(
        constants.library.page.vkImporterHead,
        constants.library.page.vkImporterBody
    );

    if (html == constants.library.status.SMTH_BAD) {
        return response.status(500).sendFile(constants.library.page.page500);
    }

    var templ = _.template(html);

    response.status(200).send(
        templ({
            title: getLocalizedResource(`${locPart}.Title`),
            goBackAction: constants.library.api.main,
            cssTheme: getSetting("theme"),

            localization: getCurrentLocalization(),
            authorsList: authorsList,
            vkAuthURL: vkAuthURL,
        })
    );
}

function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
        "Января",
        "Февраля",
        "Марта",
        "Апреля",
        "Мая",
        "Июня",
        "Июля",
        "Августа",
        "Сентября",
        "Октября",
        "Ноября",
        "Декабря",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours() < 10 ? "0" + a.getHours() : a.getHours();
    var min = a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes();
    var time = date + " " + month + " " + year + " в " + hour + ":" + min;

    return time;
}

module.exports = {
    generateVkPostForDiscord,
};
