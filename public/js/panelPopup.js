$(function () {
    var initializationStorage = window.localStorage;
    var doc = document.documentElement;
    var curScroll = doc.scrollTop;

    const itemsInItemSet = 7;
    var panelState = 0;
    var currentPanelPage = -1;
    var prevActiveItem = $("");

    var bannerEl = document.getElementsByClassName("banner")[0];
    var menuEl = document.getElementsByClassName("menu")[0];
    var element = document.getElementsByClassName("menu-container")[0];

    var settingsArr = [];
    //for menu types arrays
    var contentArr = [];
    var actionsArr = [];
    var tagsArr = [];
    var authorsArr = [];
    var favouritesArr = [];
    var deletedArr = [];
    var toolsArr = [];

    var currentObj = [
        { value: $("select[name=language]").val(), name: "language" },
        { value: $("select[name=theme]").val(), name: "theme" },
        { value: $("select[name=numberOfPosts]").val(), name: "numberOfPosts" },
        { value: $("select[name=sizeOfPosts]").val(), name: "sizeOfPosts" },
        {
            value: $("select[name=fullOccupiedSpaceOfPosts]").val(),
            name: "fullOccupiedSpaceOfPosts",
        },
        { value: $("select[name=viewOfPosts]").val(), name: "viewOfPosts" },
        { value: $("select[name=infoOfPosts]").val(), name: "infoOfPosts" },
        { value: $("select[name=sortPostsBy]").val(), name: "sortPostsBy" },
        { value: $("select[name=sortPostsOrder]").val(), name: "sortPostsOrder" },
        { value: $("select[name=sortGroupsBy]").val(), name: "sortGroupsBy" },
        { value: $("select[name=sortGroupsOrder]").val(), name: "sortGroupsOrder" },
        { value: $("select[name=needPrevNextArrows]").val(), name: "needPrevNextArrows" },
        { value: $("select[name=dateFormat]").val(), name: "dateFormat" },
        { value: $("select[name=sizeFormat]").val(), name: "sizeFormat" },
        { value: $("select[name=durationFormat]").val(), name: "durationFormat" },
        { value: $("select[name=authorLinksFormat]").val(), name: "authorLinksFormat" },
        {
            value: $("select[name=colorfulContentTypeTitles]").val(),
            name: "colorfulContentTypeTitles",
        },
        { value: $("select[name=downloadOrCopyContent]").val(), name: "downloadOrCopyContent" },
    ];

    var currentCopyPath = $("input[name=copyPath]").val();

    // save users current selected navigation

    initializePage();

    baseInit();

    // to do
    // refactor code
    // bugs clicking many times show panel/menu
    // html page blinks after reloading (showing non-styled html for a moment) (images page i think it is because there are too much elements)
    // animation off switcher when checkbox is disabled after page reload (it shouldn't be animation here)
    window.addEventListener("scroll", toggleHeader);

    document.addEventListener("click", closeAllCustomSelect);

    $(window).on("click", function () {
        if ($(".gear-settings-area-container").length) {
            $(".gear-settings-area-container").fadeOut(500, function () {
                $(this).remove();
            });
        }
    });

    $(".panel-activator").on("click", function (wind) {
        if (panelState == 0) {
            $(".panel-activator").removeClass("panel-close");
            // restart animation
            void element.offsetWidth;
            $(".panel-activator").addClass("panel-open");
            $(".panel-content").css("margin-left", "0em");
            panelState = 1;
        } else {
            $(".panel-activator").removeClass("panel-open");
            // restart animation
            void element.offsetWidth;
            $(".panel-activator").addClass("panel-close");
            $(".panel-content").css("margin-left", "-22em");
            panelState = 0;
        }
    });

    $("#panel-switcher").on("click", function (wind) {
        if ($("#need-panel-checkbox").is(":checked")) {
            $("#need-panel-checkbox").prop("checked", false);
            $(".panel-activator").removeClass("panel-close");
            $(".panel").fadeOut("slow", function () {});
            initializationStorage.setItem("needLeftPanel", "false");
        } else {
            $("#need-panel-checkbox").prop("checked", true);
            $(".panel-activator").removeClass("panel-close");
            $(".panel").fadeIn("slow", function () {});
            initializationStorage.setItem("needLeftPanel", "true");
        }
    });

    $("#menu-switcher").on("click", function (wind) {
        if ($("#need-menu-checkbox").is(":checked")) {
            $("#need-menu-checkbox").prop("checked", false);
            $(".menu-container").removeClass("menu-container-back");
            // restart animation
            void element.offsetWidth;
            $(".menu-container").addClass("menu-container-away");
            initializationStorage.setItem("needLeftMenu", "false");
        } else {
            $("#need-menu-checkbox").prop("checked", true);
            $(".menu-container").removeClass("menu-container-away");
            // restart animation
            void element.offsetWidth;
            $(".menu-container").addClass("menu-container-back");
            initializationStorage.setItem("needLeftMenu", "true");
        }
    });

    $("select[name=authorContentType]").on("change", function (event) {
        initializationStorage.setItem(
            "currentSelectedContentTypeForTagsAuthorsSearch",
            $(this).val()
        );
        authorsArr = modifyLink(authorsArr, /^.*\/.*\/.*\//, 0);
        tagsArr = modifyLink(tagsArr, /^.*\/.*\/.*\//, -1);
        favouritesArr = modifyLink(favouritesArr, /^.*\/.*\//, -1);
        deletedArr = modifyLink(deletedArr, /^.*\/.*\//, -1);
    });

    $("#panel-move-right").on("click", function () {
        grabPanelItems();

        if (currentPanelPage === settingsArr.length - 1) {
            $("#panel-move-right").css("opacity", "0");
        }
        $("#panel-move-left").css("opacity", "1");
    });

    $("#panel-move-left").on("click", function () {
        grabPanelItemsReverse();

        if (currentPanelPage === 0) {
            $("#panel-move-left").css("opacity", "0");
        }
        $("#panel-move-right").css("opacity", "1");
    });

    //content
    $(".menu-navigation-item-1").on("click", function () {
        initializationStorage.setItem("currentActiveItem", "menu-navigation-item-1");
        $(".thisisjusttest").fadeOut(300);
        performMenuNavigationSwap($(this), contentArr);
    });

    //actions
    $(".menu-navigation-item-2").on("click", function () {
        initializationStorage.setItem("currentActiveItem", "menu-navigation-item-2");
        $(".thisisjusttest").fadeOut(300);
        performMenuNavigationSwap($(this), actionsArr);
    });

    //tags
    $(".menu-navigation-item-3").on("click", function () {
        initializationStorage.setItem("currentActiveItem", "menu-navigation-item-3");
        performMenuNavigationSwap($(this), tagsArr, true);
    });

    //authors
    $(".menu-navigation-item-4").on("click", function () {
        initializationStorage.setItem("currentActiveItem", "menu-navigation-item-4");
        performMenuNavigationSwap($(this), authorsArr, true);
    });

    //favourite
    $(".menu-navigation-item-5").on("click", function () {
        initializationStorage.setItem("currentActiveItem", "menu-navigation-item-5");
        performMenuNavigationSwap($(this), favouritesArr, true);
    });

    //deleted
    $(".menu-navigation-item-6").on("click", function () {
        initializationStorage.setItem("currentActiveItem", "menu-navigation-item-6");
        performMenuNavigationSwap($(this), deletedArr, true);
    });

    //deleted
    $(".menu-navigation-item-7").on("click", function () {
        initializationStorage.setItem("currentActiveItem", "menu-navigation-item-7");
        $(".thisisjusttest").fadeOut(300);
        performMenuNavigationSwap($(this), toolsArr);
    });

    $("#save-settings-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        currentObj.forEach((element) => {
            formData.append(element.name, element.value);
        });

        formData.append("copyPath", currentCopyPath);
        // is this really must be like this or we should extract /library/... path and not with localhost???
        formData.append("currentURL", window.location.href);

        fetch($(this).attr("action"), { method: "POST", body: formData })
            .then((data) => {
                if (data.redirected) {
                    window.location.href = data.url;

                    return;
                }

                data.text().then((message) => {
                    console.log(message);
                    // here we show if it suceesfully changed or delete this for settings???
                    $("#status-container").fadeOut(200, function () {
                        $("#status-container").html(message).fadeIn(400);
                    });
                });
            })
            .catch((reason) => {
                alert(reason);
            });
    });

    $(".banner-gear").on("click", function (event) {
        event.stopPropagation();

        if (!$(".gear-settings-area-container").length) {
            var shouldShowTooltip = "";
            var shouldPinBanner = "";
            var shouldPinBannerClass = "";
            var shouldAutoplay = "";
            var shouldRepeat = "";
            var descriptionLineWidth = initializationStorage.getItem("descriptionLineWidth");
            var descriptionFontSize = initializationStorage.getItem("descriptionFontSize");
            var descriptionLineHeight = initializationStorage.getItem("descriptionLineHeight");
            var descriptionLineIndent = initializationStorage.getItem("descriptionLineIndent");
            var descriptionTextPosition = initializationStorage.getItem("descriptionTextPosition");
            var descriptionWordSpacing = initializationStorage.getItem("descriptionWordSpacing");

            if (initializationStorage.getItem("shouldShowTooltip") === "true") {
                shouldShowTooltip = " checked";
            } else {
                shouldShowTooltip = "";
            }

            if (initializationStorage.getItem("shouldPinBanner") === "true") {
                shouldPinBanner = " checked";
                shouldPinBannerClass = " gear-settings-area-container-shouldPinBanner";
            } else {
                shouldPinBanner = "";
                shouldPinBannerClass = "";
            }

            if (initializationStorage.getItem("shouldAutoplay") === "true") {
                shouldAutoplay = " checked";
            } else {
                shouldAutoplay = "";
            }

            if (initializationStorage.getItem("shouldRepeat") === "true") {
                shouldRepeat = " checked";
            } else {
                shouldRepeat = "";
            }

            //add different fonts setting?? like in author.today
            var elem = $(
                `<div class="gear-settings-area-container${shouldPinBannerClass}">` +
                    `<div class="gear-settings-area">` +
                    `<div class="menu-reset-settings">` +
                    `↺` +
                    `</div>` +
                    `<div class="menu-range-input-area">` +
                    `<label for="descriptionLineWidth">Ширина поля</label>` +
                    `<input type="range" class="menu-range-input" name="descriptionLineWidth" min="2" max="100" step="2" value="${descriptionLineWidth}">` +
                    `</div>` +
                    `<div class="menu-range-input-area">` +
                    `<label for="descriptionFontSize">Размер шрифта</label>` +
                    `<input type="range" class="menu-range-input" name="descriptionFontSize" min="1" max="64" value="${descriptionFontSize}">` +
                    `</div>` +
                    `<div class="menu-range-input-area">` +
                    `<label for="descriptionLineHeight">Высота строк</label>` +
                    `<input type="range" class="menu-range-input" name="descriptionLineHeight" min="16" max="250" value="${descriptionLineHeight}">` +
                    `</div>` +
                    `<div class="menu-range-input-area">` +
                    `<label for="descriptionLineIndent">Размер отступа</label>` +
                    `<input type="range" class="menu-range-input" name="descriptionLineIndent" min="0" max="50" value="${descriptionLineIndent}">` +
                    `</div>` +
                    `<div class="menu-range-input-area">` +
                    `<label for="descriptionTextPosition">Положение текста</label>` +
                    `<input type="range" class="menu-range-input" name="descriptionTextPosition" min="0" max="3" value="${descriptionTextPosition}">` +
                    `</div>` +
                    `<div class="menu-range-input-area">` +
                    `<label for="descriptionWordSpacing">Расствояние между словами</label>` +
                    `<input type="range" class="menu-range-input" name="descriptionWordSpacing" min="0" max="250" value="${descriptionWordSpacing}">` +
                    `</div>` +
                    `<div class="menu-checkbox-input-area">` +
                    `<input type="checkbox" class="menu-checkbox-input" id="shouldShowTooltip" name="shouldShowTooltip"${shouldShowTooltip}>` +
                    `<label for="shouldShowTooltip">Показывать подсказку при наведении на контент</label>` +
                    `</div>` +
                    `<div class="menu-checkbox-input-area">` +
                    `<input type="checkbox" class="menu-checkbox-input" id="shouldPinBanner" name="shouldPinBanner"${shouldPinBanner}>` +
                    `<label for="shouldPinBanner">Закрепить баннер</label>` +
                    `</div>` +
                    `<div class="menu-checkbox-input-area">` +
                    `<input type="checkbox" class="menu-checkbox-input" id="shouldAutoplay" name="shouldAutoplay"${shouldAutoplay}>` +
                    `<label for="shouldAutoplay">Автовоспроизведение</label>` +
                    `</div>` +
                    `<div class="menu-checkbox-input-area">` +
                    `<input type="checkbox" class="menu-checkbox-input" id="shouldRepeat" name="shouldRepeat"${shouldRepeat}>` +
                    `<label for="shouldRepeat">Повтор</label>` +
                    `</div>` +
                    `</div>` +
                    `</div>`
            );

            $(elem).hide().appendTo("body").fadeIn(500);

            $(elem).on("click", function (event) {
                event.stopPropagation();
            });

            checkboxInputFill("shouldShowTooltip");

            checkboxInputFillShouldPinBanner();

            checkboxInputFill("shouldAutoplay");

            checkboxInputFill("shouldRepeat");

            rangeInputFill("descriptionLineWidth");

            rangeInputFill("descriptionFontSize");

            rangeInputFill("descriptionLineHeight");

            rangeInputFill("descriptionLineIndent");

            rangeInputFill("descriptionTextPosition");

            rangeInputFill("descriptionWordSpacing");

            $(".menu-reset-settings").on("click", function () {
                if (confirm("Хотите вернуться к стандартным настройкам?")) {
                    setDefaultSettings();
                } else {
                    return false;
                }
            });
        }
    });

    function initializePage() {
        if (initializationStorage.getItem("needLeftMenu") !== "false") {
            // $(".slider").addClass("no-animation");
            $("#need-menu-checkbox").prop("checked", true);
            $(".menu-container").css("margin-left", "0").removeClass("invisible");
            //  $("#need-menu-checkbox").removeClass("no-animation");

            //   $(".menu-container").show();
        } else {
            // $(".slider").addClass("no-animation");
            $("#need-menu-checkbox").prop("checked", false);
            $(".menu-container").css("margin-left", "-15vw").removeClass("invisible");

            //$(".menu-container").hide();
        }

        if (initializationStorage.getItem("needLeftPanel") !== "false") {
            $("#need-panel-checkbox").prop("checked", true);
            $(".panel").show().removeClass("invisible");
        } else {
            $("#need-panel-checkbox").prop("checked", false);
            $(".panel").hide().removeClass("invisible");
        }

        if (initializationStorage.getItem("shouldPinBanner") === "true") {
            $(".banner").addClass("banner-shouldPinBanner");
            $(".main-container").addClass("main-container-shouldPinBanner");
            $(".menu").removeClass("menu-fixed").addClass("menu-shouldPinBanner");
            $(".gear-settings-area-container").addClass(
                "gear-settings-area-container-shouldPinBanner"
            );
        }

        if (curScroll > bannerEl.offsetHeight) {
            menuEl.classList.add("menu-fixed");
        }

        if (curScroll < bannerEl.offsetHeight) {
            menuEl.classList.remove("menu-fixed");
        }

        // this changed, now in panel we will have only settings
        settingsArr = collectAllPanelItems(".settings-item", itemsInItemSet);
        contentArr = collectAllMenuItems(".menu-content-item");
        actionsArr = collectAllMenuItems(".menu-actions-item");
        tagsArr = collectAllMenuItems(".menu-tag-item");
        authorsArr = collectAllMenuItems(".menu-author-item");
        favouritesArr = collectAllMenuItems(".menu-favourite-item");
        deletedArr = collectAllMenuItems(".menu-deleted-item");
        toolsArr = collectAllMenuItems(".menu-tools-item");

        $("select[name=authorContentType]").val(
            initializationStorage.getItem("currentSelectedContentTypeForTagsAuthorsSearch")
        );

        authorsArr = modifyLink(authorsArr, /^.*\/.*\/.*\//, 0);
        tagsArr = modifyLink(tagsArr, /^.*\/.*\/.*\//, -1);
        favouritesArr = modifyLink(favouritesArr, /^.*\/.*\//, -1);
        deletedArr = modifyLink(deletedArr, /^.*\/.*\//, -1);

        // to avoid flickering
        $(".panel-inside").empty().removeClass("invisible");
        $(".menu-content").empty().removeClass("invisible");

        // shouln't be here??
        grabPanelItems();

        prevActiveItem = $(`.${initializationStorage.getItem("currentActiveItem")}`);
        $(".thisisjusttest").hide();
        switch (initializationStorage.getItem("currentActiveItem")) {
            case "menu-navigation-item-1":
                performMenuNavigationSwap(prevActiveItem, contentArr);
                break;

            case "menu-navigation-item-2":
                performMenuNavigationSwap(prevActiveItem, actionsArr);
                break;

            case "menu-navigation-item-3":
                performMenuNavigationSwap(prevActiveItem, tagsArr, true);
                break;

            case "menu-navigation-item-4":
                performMenuNavigationSwap(prevActiveItem, authorsArr, true);
                break;

            case "menu-navigation-item-5":
                performMenuNavigationSwap(prevActiveItem, favouritesArr, true);
                break;

            case "menu-navigation-item-6":
                performMenuNavigationSwap(prevActiveItem, deletedArr, true);
                break;

            case "menu-navigation-item-7":
                performMenuNavigationSwap(prevActiveItem, toolsArr);
                break;

            default:
                break;
        }

        $(".thisisjusttest").removeClass("invisible");

        if (currentPanelPage === settingsArr.length - 1) {
            $("#panel-move-right").css("opacity", "0");
        }

        if (currentPanelPage === 0) {
            $("#panel-move-left").css("opacity", "0");
        }

        // for settings page there should be no realoaing page, except language changing, all states must be saved for user in local storage(store them on server too???)
    }

    function toggleHeader() {
        curScroll = window.scrollY || doc.scrollTop;

        if (initializationStorage.getItem("shouldPinBanner") === "false") {
            if (curScroll > bannerEl.offsetHeight) {
                menuEl.classList.add("menu-fixed");
            }

            if (curScroll < bannerEl.offsetHeight) {
                menuEl.classList.remove("menu-fixed");
            }
        }
    }

    function modifyLink(arr, matchRegex, elementIndexSkipToSkipModification) {
        arr.forEach((element, index) => {
            if (index != elementIndexSkipToSkipModification) {
                var link = element.children("a").attr("href");

                var regMatch = link.match(matchRegex);
                if (regMatch) {
                    link = regMatch[0];
                }

                element
                    .children("a")
                    .attr("href", `${link}${$("select[name=authorContentType]").val()}`);
            }
        });

        return arr;
    }

    function performMenuNavigationSwap(that, arrToWorkWith, needContentTypesSelect) {
        prevActiveItem.removeClass("menu-navigation-item-active");
        prevActiveItem = that.addClass("menu-navigation-item-active");

        $(".menu-content").fadeOut(300, function () {
            $(".menu-content").empty();

            var i = 0;
            while (arrToWorkWith[i]) {
                $(".menu-content").append(arrToWorkWith[i]);
                i++;
            }

            $(".menu-content").fadeIn(300, function () {});

            if (needContentTypesSelect) {
                $(".thisisjusttest").fadeIn(300);
            }
        });
    }

    function collectAllMenuItems(elementSelector) {
        var arr = [];
        $(elementSelector).each(function () {
            arr.push($(this));
        });

        return arr;
    }

    function collectAllPanelItems(elementSelector, shouldBeItemsInSet) {
        var itemSet = [];
        var arr = [];
        var panelItemsCount = $(elementSelector).length;

        var i = 0;
        $(elementSelector).each(function (index) {
            if (i < shouldBeItemsInSet - 1) {
                itemSet.push($(this));
                if (index == panelItemsCount - 1) {
                    arr.push({ currentPageItems: itemSet });
                }
                i++;
            } else {
                itemSet.push($(this));
                arr.push({ currentPageItems: itemSet });
                i = 0;
                itemSet = [];
            }
        });

        return arr;
    }

    function grabPanelItems() {
        if (currentPanelPage + 1 >= settingsArr.length) {
            return;
        }

        currentPanelPage++;
        getItems();
    }

    function grabPanelItemsReverse() {
        if (currentPanelPage - 1 < 0) {
            return;
        }

        currentPanelPage--;
        getItems();
    }

    function getItems() {
        $(".panel-inside").fadeOut(300, function () {
            removeAllCustomSelect();

            $(".panel-inside").empty();

            var i = 0;
            while (settingsArr[currentPanelPage].currentPageItems[i]) {
                $(".panel-inside").append(settingsArr[currentPanelPage].currentPageItems[i]);
                i++;
            }

            applyCustomSelect();
            $(".panel-inside").fadeIn(300, function () {
                currentObj.forEach((element) => {
                    $(`select[name=${element.name}]`).on("change", function () {
                        element.value = $(this).val();
                    });
                });

                $("input[name=copyPath]").on("change", function () {
                    currentCopyPath = $(this).val();
                });
            });
        });
    }

    function setDefaultSettings() {
        $("input[name=shouldShowTooltip]").prop("checked", true).trigger("change");
        $("input[name=shouldPinBanner]").prop("checked", false).trigger("change");
        $("input[name=shouldAutoplay]").prop("checked", false).trigger("change");
        $("input[name=shouldRepeat]").prop("checked", false).trigger("change");
        $("input[name=descriptionLineWidth]").val(94).trigger("change").trigger("input");
        $("input[name=descriptionFontSize]").val(20).trigger("change").trigger("input");
        $("input[name=descriptionLineHeight]").val(23).trigger("change").trigger("input");
        $("input[name=descriptionLineIndent]").val(0).trigger("change").trigger("input");
        $("input[name=descriptionTextPosition]").val(0).trigger("change").trigger("input");
        $("input[name=descriptionWordSpacing]").val(0).trigger("change").trigger("input");
    }

    function checkboxInputFill(inputName) {
        $(`input[name=${inputName}]`).on("change", function () {
            if ($(this).prop("checked")) {
                initializationStorage.setItem(inputName, true);
            } else {
                initializationStorage.setItem(inputName, false);
            }
        });
    }

    // много багов с этим закреплениеем баннера по части z-index нужно всю систему пересмотреть
    function checkboxInputFillShouldPinBanner() {
        $(`input[name=shouldPinBanner]`).on("change", function () {
            if ($(this).prop("checked")) {
                initializationStorage.setItem("shouldPinBanner", true);
                $(".banner").addClass("banner-shouldPinBanner");
                $(".main-container").addClass("main-container-shouldPinBanner");
                $(".menu").removeClass("menu-fixed").addClass("menu-shouldPinBanner");
                $(".gear-settings-area-container").addClass(
                    "gear-settings-area-container-shouldPinBanner"
                );
            } else {
                initializationStorage.setItem("shouldPinBanner", false);
                $(".banner").removeClass("banner-shouldPinBanner");
                $(".main-container").removeClass("main-container-shouldPinBanner");
                $(".menu").removeClass("menu-shouldPinBanner");
                $(".gear-settings-area-container").removeClass(
                    "gear-settings-area-container-shouldPinBanner"
                );

                if (curScroll > bannerEl.offsetHeight) {
                    menuEl.classList.add("menu-fixed");
                }

                if (curScroll < bannerEl.offsetHeight) {
                    menuEl.classList.remove("menu-fixed");
                }
            }
        });
    }

    function rangeInputFill(inputName) {
        $(`input[name=${inputName}]`).on("change", function () {
            initializationStorage.setItem(`${inputName}`, $(this).val());
            baseInit();
        });

        $(`input[name=${inputName}]`).on("input", function (event) {
            updateGradient(this);
        });

        updateGradient($(`input[name=${inputName}]`));
    }

    // same must be for editor + change values instantly when it is change on gear setting
    function baseInit() {
        if ($(".post-description").length) {
            $(".post-description").css(
                "font-size",
                initializationStorage.getItem("descriptionFontSize") + "px"
            );

            $(".post-description").css(
                "width",
                initializationStorage.getItem("descriptionLineWidth") + "%"
            );

            $(".post-description").css(
                "text-indent",
                initializationStorage.getItem("descriptionLineIndent") + "vw"
            );

            $(".post-description").css(
                "line-height",
                initializationStorage.getItem("descriptionLineHeight") + "px"
            );

            var textPosition = initializationStorage.getItem("descriptionTextPosition");
            switch (textPosition) {
                case "0":
                    textPosition = "left";
                    break;

                case "1":
                    textPosition = "justify";
                    break;

                case "2":
                    textPosition = "center";
                    break;

                case "3":
                    textPosition = "right";
                    break;

                default:
                    textPosition = "left";
                    break;
            }
            $(".post-description").css("text-align", textPosition);

            $(".post-description").css(
                "word-spacing",
                initializationStorage.getItem("descriptionWordSpacing") + "px"
            );
        }
    }

    function updateGradient(elem) {
        const percentage =
            (($(elem).val() - $(elem).prop("min")) / ($(elem).prop("max") - $(elem).prop("min"))) *
            100;
        $(elem).css("--percentage", percentage + "%");
    }

    function applyCustomSelect() {
        var customSelectDiv = $(".custom-select");
        $(customSelectDiv).each(function () {
            var selectName = $(this).children("select").attr("name");
            var selectOptionStr = `select[name=${selectName}] option`;
            var currentSelectedText = $(`select[name=${selectName}] :selected`).text();

            var selectSelectedDiv = $("<div></div>")
                .addClass("select-selected")
                .text(currentSelectedText);
            $(this).append($(selectSelectedDiv));

            var selectItemsAreaDiv = $("<div></div>").addClass("select-items select-hide");
            $(selectOptionStr).each(function () {
                var selectItemDiv = $("<div></div>").text($(this).text());
                if ($(selectItemDiv).text() == currentSelectedText) {
                    $(selectSelectedDiv).text(currentSelectedText);
                    $(selectItemDiv).addClass("same-as-selected");
                }
                $(selectItemDiv).on("click", function () {
                    var selectSelectedForCurrentCustomSelect = $(this).parent().prev();
                    var that = $(this);

                    $(selectOptionStr).each(function () {
                        if ($(this).text() == $(that).text()) {
                            $(selectSelectedForCurrentCustomSelect).text($(that).text());
                            $(that)
                                .parent()
                                .children(".same-as-selected")
                                .removeClass("same-as-selected");
                            $(that).addClass("same-as-selected");
                            $(`select[name=${selectName}]`).val($(this).val()).trigger("change");
                        }
                    });

                    selectSelectedForCurrentCustomSelect.trigger("click");
                });

                $(selectItemsAreaDiv).append($(selectItemDiv));
            });

            $(this).append($(selectItemsAreaDiv));

            $(selectSelectedDiv).on("click", function (event) {
                event.stopPropagation();

                closeAllCustomSelect();

                $(this).next().toggleClass("select-hide");
                $(this).toggleClass("select-arrow-active");

                var marginTotal = $(this).outerHeight(true) - $(this).outerHeight();

                $(this)
                    .next()
                    .css("top", "-" + marginTotal + "px");
                $(this).css("opacity", "0");
            });
        });
    }

    function removeAllCustomSelect() {
        $(".select-selected").remove();
        $(".select-items").remove();
    }

    function closeAllCustomSelect() {
        $(".select-selected").css("opacity", "1");
        $(".select-items").addClass("select-hide");
        $(".select-selected").removeClass("select-arrow-active");
    }
});
