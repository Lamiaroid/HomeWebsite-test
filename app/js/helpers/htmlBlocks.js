const { getLocalizedResource } = require("../localizer.js");
const { getFormattedContentTotalCountStr } = require("./commonHelpers.js");
const constants = require("../constants.js");

function createContentTypesHtmlBlock(...data) {
    var block = "";
    var selected = " selected";
    for (var i = 0; i < data.length; i++) {
        block +=
            `<option id="${data[i].id}" value="${data[i].optionValue}"${selected}>` +
            `${data[i].optionTitle}` +
            `</option>`;

        if (selected === " selected") {
            selected = "";
        }
    }

    return block;
}

function createContentTypesHtmlBlockWithPreselectedType(...data) {
    var block = "";
    var selected = "";
    for (var i = 1; i < data.length; i++) {
        if (data[i].optionValue === data[0]) {
            selected = " selected";
        }
        block +=
            `<option id="${data[i].id}" value="${data[i].optionValue}"${selected}>` +
            `${data[i].optionTitle}` +
            `</option>`;

        selected = "";
    }

    return block;
}

function createNavigationHtmlBlock(...data) {
    var block = "";
    for (var i = 0; i < data.length; i++) {
        block +=
            `<span class="menu-navigation-item menu-navigation-item-${i + 1}">` +
            `${data[i].localizedResource}` +
            `</span>`;

        if (i !== data.length - 1) {
            block += `<span>●</span>`;
        }
    }

    return block;
}

function createContentHtmlBlock(...data) {
    var block = "";
    for (var i = 0; i < data.length; i++) {
        // title не прикольно, нужна кастомная отображалка
        block +=
            `<div class="menu-item menu-content-item">` +
            `<a href="${constants.library.api.main}${data[i].requiredApi}" class="menu-link">` +
            `${data[i].localizedResource}` +
            `</a>` +
            `<span class="menu-item-content-total-count" title="${data[i].contentTotal}">` +
            `${getFormattedContentTotalCountStr(data[i].contentTotal)}</span>`;

        if (data[i].groupsTotal) {
            block +=
                `<span class="menu-item-groups-total-count" title="${data[i].groupsTotal}">(<i class="fa fa-folder-o"> ` +
                `${getFormattedContentTotalCountStr(data[i].groupsTotal)})</i></span>`;
        }

        block += `</div>`;
    }

    return block;
}

function createActionsHtmlBlock(...data) {
    var block = "";
    for (var i = 0; i < data.length; i++) {
        block +=
            `<div class="menu-item menu-actions-item">` +
            `<a href="${constants.library.api.main}${data[i].requiredApi}" class="menu-link">` +
            `${data[i].localizedResource}` +
            `</a>` +
            `</div>`;
    }

    return block;
}

function createSettingsHtmlBlock(...data) {
    var block =
        `<div class="panel-item settings-item">` +
        `<div class="settings-select-outer">` +
        `<div class="settings-select-title">${data[0]}</div>` +
        `<div class="settings-select-inner">` +
        `<select name="${data[1]}" size="2">`;

    var selected = "";
    for (var i = 3; i < data.length; i++) {
        if (data[i].optionValue === data[2]) {
            selected = " selected";
        } else {
            selected = "";
        }
        block += `<option value="${data[i].optionValue}"${selected}>${data[i].optionText}</option>`;
    }

    block += `</select>` + `</div>` + `</div>` + `</div>`;

    return block;
}

// вот это наш кастом селект (нужно переделать под него)
function createSettingsHtmlBlockWithNoSize(...data) {
    var block =
        `<div class="panel-item settings-item">` +
        `<div class="settings-select-outer">` +
        `<div class="settings-select-title">${data[0]}</div>` +
        `<div class="custom-select">` +
        `<select name="${data[1]}">`;

    var selected = "";
    for (var i = 3; i < data.length; i++) {
        if (data[i].optionValue === data[2]) {
            selected = " selected";
        } else {
            selected = "";
        }
        block += `<option value="${data[i].optionValue}"${selected}>${data[i].optionText}</option>`;
    }

    block += `</select>` + `</div>` + `</div>` + `</div>`;

    return block;
}

function createSettingsHtmlInputBlock(...data) {
    var block =
        `<div class="panel-item settings-item">` +
        `<div class="settings-select-outer">` +
        `<div class="settings-select-title">${data[0]}</div>` +
        `<div class="settings-select-inner">` +
        `<input name="${data[1]}" value="${data[2]}">` +
        `</div>` +
        `</div>` +
        `</div>`;

    return block;
}

// забыть и отпустить, не везде подходит обычный селект, оставим его только в выборе на формах
function createMenuContentTypeHtmlBlock(...data) {
    var block =
        `<div class="menu-item content-type-item">` +
        `<div class="menu-select-outer">` +
        `<div class="menu-select-title">${data[0]}</div>` +
        //  `<div class="menu-select-inner">` +
        `<div class="custom-select">` +
        // `<select name="${data[1]}" size="2">`;
        `<select name="${data[1]}">`;

    var selected = "";
    for (var i = 3; i < data.length; i++) {
        if (data[i].optionValue == data[2]) {
            selected = " selected";
        } else {
            selected = "";
        }
        block += `<option value="${data[i].optionValue}"${selected}>${data[i].optionText}</option>`;
    }

    block += `</select>` + `</div>` + `</div>` + `</div>`;

    return block;
}

function createAuthorsHtmlBlock(data) {
    var block =
        `<div class="menu-item menu-author-item">` +
        `<a href="${constants.library.api.main}${constants.library.api.authors}" ` +
        `class="menu-link">` +
        `${getLocalizedResource(constants.library.localization.menu.authors + ".All")}
        </a>
        </div>`;

    for (var i = 0; i < data.length; i++) {
        block +=
            `<div class="menu-item menu-author-item">` +
            `<a href="${constants.library.api.main}${constants.library.api.author}/${data[i].ID}/" class="menu-link">` +
            `${data[i].Name}
            </a>
            </div>`;
    }

    return block;
}

function createTagsHtmlBlock(data) {
    var block = "";

    for (var i = 0; i < data.length; i++) {
        block +=
            `<div class="menu-item menu-tag-item">` +
            `<a href="${constants.library.api.main}${constants.library.api.tag}/${data[i].ID}/" class="menu-link">` +
            `${data[i].Name}` +
            `</a>` +
            `</div>`;
    }

    return block;
}

function createFavouritesHtmlBlock() {
    var block =
        `<div class="menu-item menu-favourite-item">` +
        `<a href="${constants.library.api.main}${constants.library.api.favourite}/" class="menu-link">` +
        `Поиск` +
        `</a>` +
        `</div>`;

    return block;
}

function createDeletedHtmlBlock() {
    var block =
        `<div class="menu-item menu-deleted-item">` +
        `<a href="${constants.library.api.main}${constants.library.api.deleted}/" class="menu-link">` +
        `Поиск2` +
        `</a>` +
        `</div>`;

    return block;
}

function createToolsHtmlBlock(...data) {
    var block = "";
    for (var i = 0; i < data.length; i++) {
        block +=
            `<div class="menu-item menu-tools-item">` +
            `<a href="${data[i].link}" class="menu-link">` +
            `${data[i].name}` +
            `</a>` +
            `</div>`;
    }

    return block;
}

module.exports = {
    createContentTypesHtmlBlock,
    createContentTypesHtmlBlockWithPreselectedType,
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
};
