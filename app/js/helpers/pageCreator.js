const constants = require("../constants.js");
//number of items on page
var pageLast = 11;

function setLastPage(last) {
    pageLast = Math.ceil(last);
}

//sorting by???
// have bug with redirecting pages on comics and like this
function pageCreator(path, currentPage) {
    // need to take it depending on all files that we hav
    console.log(path);

    const pageNumberClass = "page-number";
    const pageCurrentClass = "page-current";

    var hrefPart = `<a href="${constants.library.api.main}/${path}`;
    var pagesList;
    if (currentPage === 1) {
        pagesList = `${hrefPart}/1" class="${pageNumberClass} ${pageCurrentClass}">1</a> `;
    } else {
        pagesList = `${hrefPart}/1" class="${pageNumberClass}">1</a> `;
    }

    if (pageLast <= 10) {
        for (var i = 2; i < pageLast; i++) {
            if (i === currentPage) {
                pagesList += `${hrefPart}/${i}" class="${pageNumberClass} ${pageCurrentClass}">${i}</a> `;
            } else {
                pagesList += `${hrefPart}/${i}" class="${pageNumberClass}">${i}</a> `;
            }
        }
    } else {
        switch (currentPage) {
            case 1:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `${hrefPart}/3" class="${pageNumberClass}">3</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${pageLast - 1}" class="${pageNumberClass}">${pageLast - 1}</a> `;
                break;

            case 2:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass} ${pageCurrentClass}">2</a> ` +
                    `${hrefPart}/3" class="${pageNumberClass}">3</a> ` +
                    `${hrefPart}/4" class="${pageNumberClass}">4</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${pageLast - 1}" class="${pageNumberClass}">${pageLast - 1}</a> `;
                break;

            case 3:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `${hrefPart}/3" class="${pageNumberClass} ${pageCurrentClass}">3</a> ` +
                    `${hrefPart}/4" class="${pageNumberClass}">4</a> ` +
                    `${hrefPart}/5" class="${pageNumberClass}">5</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${pageLast - 1}" class="${pageNumberClass}">${pageLast - 1}</a> `;
                break;

            case 4:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `${hrefPart}/3" class="${pageNumberClass}">3</a> ` +
                    `${hrefPart}/4" class="${pageNumberClass} ${pageCurrentClass}">4</a> ` +
                    `${hrefPart}/5" class="${pageNumberClass}">5</a> ` +
                    `${hrefPart}/6" class="${pageNumberClass}">6</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${pageLast - 1}" class="${pageNumberClass}">${pageLast - 1}</a> `;
                break;

            case 5:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `${hrefPart}/3" class="${pageNumberClass}">3</a> ` +
                    `${hrefPart}/4" class="${pageNumberClass}">4</a> ` +
                    `${hrefPart}/5" class="${pageNumberClass} ${pageCurrentClass}">5</a> ` +
                    `${hrefPart}/6" class="${pageNumberClass}">6</a> ` +
                    `${hrefPart}/7" class="${pageNumberClass}">7</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${pageLast - 1}" class="${pageNumberClass}">${pageLast - 1}</a> `;
                break;

            case pageLast - 4:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${currentPage - 2}" class="${pageNumberClass}">${
                        currentPage - 2
                    }</a> ` +
                    `${hrefPart}/${currentPage - 1}" class="${pageNumberClass}">${
                        currentPage - 1
                    }</a> ` +
                    `${hrefPart}/${currentPage}" class="${pageNumberClass} ${pageCurrentClass}">${currentPage}</a> ` +
                    `${hrefPart}/${currentPage + 1}" class="${pageNumberClass}">${
                        currentPage + 1
                    }</a> ` +
                    `${hrefPart}/${currentPage + 2}" class="${pageNumberClass}">${
                        currentPage + 2
                    }</a> ` +
                    `${hrefPart}/${currentPage + 3}" class="${pageNumberClass}">${
                        currentPage + 3
                    }</a> `;
                break;

            case pageLast - 3:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${currentPage - 2}" class="${pageNumberClass}">${
                        currentPage - 2
                    }</a> ` +
                    `${hrefPart}/${currentPage - 1}" class="${pageNumberClass}">${
                        currentPage - 1
                    }</a> ` +
                    `${hrefPart}/${currentPage}" class="${pageNumberClass} ${pageCurrentClass}">${currentPage}</a> ` +
                    `${hrefPart}/${currentPage + 1}" class="${pageNumberClass}">${
                        currentPage + 1
                    }</a> ` +
                    `${hrefPart}/${currentPage + 2}" class="${pageNumberClass}">${
                        currentPage + 2
                    }</a> `;
                break;

            case pageLast - 2:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${currentPage - 2}" class="${pageNumberClass}">${
                        currentPage - 2
                    }</a> ` +
                    `${hrefPart}/${currentPage - 1}" class="${pageNumberClass}">${
                        currentPage - 1
                    }</a> ` +
                    `${hrefPart}/${currentPage}" class="${pageNumberClass} ${pageCurrentClass}">${currentPage}</a> ` +
                    `${hrefPart}/${currentPage + 1}" class="${pageNumberClass}">${
                        currentPage + 1
                    }</a> `;
                break;

            case pageLast - 1:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${currentPage - 2}" class="${pageNumberClass}">${
                        currentPage - 2
                    }</a> ` +
                    `${hrefPart}/${currentPage - 1}" class="${pageNumberClass}">${
                        currentPage - 1
                    }</a> ` +
                    `${hrefPart}/${currentPage}" class="${pageNumberClass} ${pageCurrentClass}">${currentPage}</a> `;
                break;

            case pageLast:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${currentPage - 2}" class="${pageNumberClass}">${
                        currentPage - 2
                    }</a> ` +
                    `${hrefPart}/${currentPage - 1}" class="${pageNumberClass}">${
                        currentPage - 1
                    }</a> `;
                break;

            default:
                pagesList +=
                    `${hrefPart}/2" class="${pageNumberClass}">2</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${currentPage - 2}" class="${pageNumberClass}">${
                        currentPage - 2
                    }</a> ` +
                    `${hrefPart}/${currentPage - 1}" class="${pageNumberClass}">${
                        currentPage - 1
                    }</a> ` +
                    `${hrefPart}/${currentPage}" class="${pageNumberClass} ${pageCurrentClass}">${currentPage}</a> ` +
                    `${hrefPart}/${currentPage + 1}" class="${pageNumberClass}">${
                        currentPage + 1
                    }</a> ` +
                    `${hrefPart}/${currentPage + 2}" class="${pageNumberClass}">${
                        currentPage + 2
                    }</a> ` +
                    `<span>...</span>` +
                    `${hrefPart}/${pageLast - 1}" class="${pageNumberClass}">${pageLast - 1}</a> `;
                break;
        }
    }

    console.log(pagesList);

    if (pageLast && pageLast !== 1) {
        if (currentPage === pageLast) {
            pagesList += `${hrefPart}/${pageLast}" class="${pageNumberClass} ${pageCurrentClass}">${pageLast}</a>`;
        } else {
            pagesList += `${hrefPart}/${pageLast}" class="${pageNumberClass}">${pageLast}</a>`;
        }
    }

    return pagesList;
}

module.exports = {
    pageCreator,
    setLastPage,
};
