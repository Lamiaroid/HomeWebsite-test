$(function () {
    let gMouseDownX = 0;
    let gMouseDownY = 0;
    let gMouseDownOffsetX = 0;
    let gMouseDownOffsetY = 0;

    // we can define by elem.length jquery so we don't need flag
    var created = false;
    var elem;

    var created2 = false;
    var elem2;

    //duplicate in editor
    function replaceForHtml(str) {
        str = str.replace(/\n/g, "</div><div>");
        str = str.replace(/\s\s/g, " &nbsp;");
        //из-за этой регулярки возникает баг с переносами, так как браузер считает всё одной строкой и наинает разбивать слова несмортря на стили, нужно пересмотреть логику редактора и смены описаний
        // а сам браузер не хрчет отображать 2+ пробела без спец символов...
        //str = str.replace(/\s/g, "&nbsp;");
        // пустой <div></div> не даёт абзацев, поэтому нужно делать имеено так
        str = str.replace(/<div><\/div>/g, "<br>");

        return str;
    }

    $(window).on("click", function () {
        if (created) {
            $(elem).fadeOut(500, function () {
                $(this).remove();
                created = false;
            });
        }

        if (created2) {
            $(elem2).fadeOut(500, function () {
                $(this).remove();
                created2 = false;
            });
        }
    });

    $(".post-option-copy").on("click", function () {
        $.post(
            "/library/copy-content",
            { contentID: getFileID(window.location.href) },
            function (data) {
                alert(data.status);
                //alert(data.name);
            }
        ).fail(function (xhr, status, error) {});
    });

    $(".post-option-edit").on("click", function () {
        $.post(
            "/library/get-content-edit-info",
            { contentID: getFileID(window.location.href) },
            function (data) {
                $("body").append(data.body);
                $("head").append(data.head);
                $("#content-editor").html(
                    "<div>" +
                        replaceForHtml($("textarea[name=contentDescription]").val() + "</div>")
                );
                // scroll looks ugly
                $("body").addClass("no-overflow-y");

                $(".close-post-option-dialog").on("click", function () {
                    $("body").removeClass("no-overflow-y");
                    $(".post-option-dialog-area-default").remove();
                    $(".edit-content-script").remove();
                    $(".edit-content-style").remove();
                });

                //alert(data.name);
            }
        ).fail(function (xhr, status, error) {});
    });

    $(".post-option-preview").on("click", function () {
        $.post(
            "/library/get-content-edit-preview",
            { contentID: getFileID(window.location.href) },
            function (data) {
                $("body").append(data.body);
                $("head").append(data.head);

                // scroll looks ugly
                $("body").addClass("no-overflow-y");

                $(".close-post-option-dialog").on("click", function () {
                    $("body").removeClass("no-overflow-y");
                    $(".post-option-dialog-area-default").remove();
                    $(".edit-content-preview-script").remove();
                    $(".edit-content-preview-style").remove();
                });
            }
        ).fail(function (xhr, status, error) {});
    });

    $(".post-option-change-type").on("click", function () {
        $.post(
            "/library/get-content-edit-type",
            { contentID: getFileID(window.location.href) },
            function (data) {
                $("body").append(data.body);
                $("head").append(data.head);

                // scroll looks ugly
                $("body").addClass("no-overflow-y");

                $(".close-post-option-dialog").on("click", function () {
                    $("body").removeClass("no-overflow-y");
                    $(".post-option-dialog-area-default").remove();
                    $(".edit-content-type-script").remove();
                    $(".edit-content-type-style").remove();
                });
            }
        ).fail(function (xhr, status, error) {});
    });

    $(".post-option-tags").on("click", function () {
        $.post("/library/get-all-tags", {}, function (data) {
            //alert("reafy");

            var currNames = collectPostCurrentTags();

            var allCurTags = "";
            for (var i = 0; i < currNames.length; i++) {
                allCurTags += `${createTag(currNames[i])} `;
            }

            // i don't like this kind of searching for used values, should find smth more elegant
            var allTags = "";
            for (var i = 0; i < data.length; i++) {
                var j;
                for (j = 0; j < currNames.length; j++) {
                    if (currNames[j] == data[i].Name) {
                        j = currNames.length + 1;
                    }
                }

                if (j == currNames.length) {
                    allTags += `${createAdditionTag(data[i].Name)} `;
                }
            }

            // scroll here is ugly
            var windscr =
                `<div class="post-option-dialog-area">` +
                `<div class="close-post-option-dialog unselectable">❌</div>` +
                `<button class="post-option-save">Save</button>` +
                `<div class="post-option-dialog-container">` +
                `<div class="post-option-dialog">` +
                `<div class="post-option-dialog-header">` +
                `<div class="post-option-dialog-title">Тэги контента</div>` +
                `</div>` +
                `<div class="post-option-dialog-body">` +
                `<div class="current-tags-area">` +
                `${allCurTags}` +
                `</div>` +
                `</div>` +
                `</div>` +
                `</div>` +
                `<div class="post-option-dialog-container">` +
                `<div class="post-option-dialog">` +
                `<div class="post-option-dialog-header">` +
                `<div class="post-option-dialog-title">Существующие тэги</div>` +
                `</div>` +
                `<div class="post-option-dialog-body">` +
                `<div class="have-tags-area">` +
                `${allTags}` +
                `</div>` +
                `</div>` +
                `</div>` +
                `</div>` +
                `</div>`;

            $("body").append(windscr);

            $(".close-post-option-dialog").on("click", function () {
                $(".post-option-dialog-area").remove();
            });

            // clicking should be only on + and cross
            $(".current-tags-area").on("click", ".current-tag", function () {
                $(this).remove();
                $(".have-tags-area").append(
                    createAdditionTag($(this).children(".tag-name").text())
                );
            });

            $(".have-tags-area").on("click", ".have-tag", function () {
                $(this).remove();
                $(".current-tags-area").append(createTag($(this).children(".tag-name").text()));
            });

            $(".post-option-save").on("click", function () {
                var formData = new FormData();

                var ttttt = collectPostCurrentAddedTags();

                var i = 0;
                while (ttttt[i]) {
                    formData.append("tagName", ttttt[i]);
                    i++;
                }

                // alert(window.location.href);
                var jjjj = window.location.href.match(/(\/library\/.*)$/i);
                // alert(jjjj[1]);
                formData.append("currentURL", jjjj[1]);

                // do we have ..../pagenumber/id everywhere?
                // have problems with comics using re like this
                // var xxxx = window.location.href.match(/\/[0-9]+\/(.*)$/i);
                // alert(jjjj[1]);
                formData.append("postID", getFileID(window.location.href));

                fetch("/library/add-new-tags-to-post", {
                    method: "POST",
                    body: formData,
                })
                    .then((data) => {
                        if (data.redirected) {
                            window.location.href = data.url;

                            return;
                        }

                        data.text().then((message) => {
                            $("#status-container").fadeOut(200, function () {
                                $("#status-container").html(message).fadeIn(400);
                            });
                        });
                    })
                    .catch((reason) => {
                        alert(reason);
                    });
            });
        }).fail(function (xhr, status, error) {});
    });

    $(".suggested-extension").on("click", function (event) {
        event.stopPropagation();
        // need cross, buttons, and close if clicked outside
        if (!created) {
            created = true;
            var suggestedExtension = $(".suggested-extension").attr("ext");
            var position = $(".suggested-extension").position();
            console.log(position);
            elem = $(
                `<div class="mymessage">` +
                    `<div class="close-mymessage unselectable">❌</div>` +
                    `<div class="mymessage-title">Предполагаемое расширение файла: ${suggestedExtension} <br> Хотите поменять на него?</div>` +
                    `<div class="mymessage-options-container">` +
                    `<button class="mymessage-button mymessage-yes">Да</button>` +
                    `<button class="mymessage-button mymessage-no">Нет</button>` +
                    `</div>` +
                    `</div>`
            );

            $(elem)
                .css({
                    top: position.top - "115",
                    left: $(".post-extension").width() - "300",
                })
                .hide()
                .appendTo(".post-extension")
                .fadeIn(500);

            $(elem).on("click", function (event) {
                event.stopPropagation();
            });

            $(".close-mymessage, .mymessage-no").on("click", function (event) {
                $(elem).fadeOut(500, function () {
                    $(this).remove();
                    created = false;
                });
            });

            $(".mymessage-yes").on("click", function (event) {
                var jjjj = window.location.href.match(/(\/library\/.*)$/i);
                // alert(jjjj[1]);
                console.log("gere");
                $.post(
                    "/library/apply-suggested-extension",
                    { contentID: getFileID(window.location.href), currentURL: jjjj[1] },
                    function (data) {
                        window.location.href = jjjj[1];
                    }
                ).fail(function (xhr, status, error) {});
            });
        }
    });

    $(".something-important").on("click", function (event) {
        event.stopPropagation();
        // need cross, buttons, and close if clicked outside
        if (!created2) {
            created2 = true;
            var suggestedExtension = $(".something-important").attr("info");
            var position = $(".something-important").position();
            console.log(position);
            elem2 = $(
                `<div class="mymessage-extra">` +
                    `<div class="close-mymessage-extra unselectable">❌</div>` +
                    `<div class="mymessage-extra-title">${suggestedExtension}</div>` +
                    `</div>`
            );

            $(elem2)
                .css({
                    top: position.top - "115",
                    left: $(".post-extra-info").width() - "300",
                })
                .hide()
                .appendTo(".post-extra-info")
                .fadeIn(500);

            $(elem2).on("click", function (event) {
                event.stopPropagation();
            });

            $(".close-mymessage-extra").on("click", function (event) {
                $(elem2).fadeOut(500, function () {
                    $(this).remove();
                    created2 = false;
                });
            });
        }
    });

    $(".post-option-favourite").on("click", function () {
        var jjjj = window.location.href.match(/(\/library\/.*)$/i);
        // alert(jjjj[1]);
        console.log("gere");
        $.post(
            "/library/add-to-favourite",
            { contentID: getFileID(window.location.href), currentURL: jjjj[1] },
            function (data) {
                window.location.href = jjjj[1];
            }
        ).fail(function (xhr, status, error) {});
    });

    $(".post-option-delete").on("click", function () {
        var jjjj = window.location.href.match(/(\/library\/.*)$/i);
        // alert(jjjj[1]);
        console.log("gere");
        $.post(
            "/library/add-to-deleted",
            { contentID: getFileID(window.location.href), currentURL: jjjj[1] },
            function (data) {
                window.location.href = jjjj[1];
            }
        ).fail(function (xhr, status, error) {});
    });

    $(".post-option-restore").on("click", function () {
        var jjjj = window.location.href.match(/(\/library\/.*)$/i);
        // alert(jjjj[1]);
        console.log("gere");
        $.post(
            "/library/add-to-deleted",
            { contentID: getFileID(window.location.href), currentURL: jjjj[1] },
            function (data) {
                window.location.href = jjjj[1];
            }
        ).fail(function (xhr, status, error) {});
    });

    // тут ещё и разные данные, то есть в одних методах юзается contentID в других просто ID нужно всё привести к одному виду
    $(".post-option-destroy").on("click", function () {
        if (confirm("Вы уверены что хотите полностью удалить этот контент?")) {
            var jjjj = window.location.href.match(/(\/library\/.*)$/i);
            // alert(jjjj[1]);
            console.log("gere");
            $.post(
                "/library/destroy-content",
                { ID: getFileID(window.location.href), currentURL: jjjj[1] },
                function (data) {
                    window.location.href = jjjj[1];
                }
            ).fail(function (xhr, status, error) {});
        } else {
            return false;
        }
    });

    // this should be done with reg exp but i don't know how
    function getFileID(fileName) {
        var extensionMirrored = "";
        for (var i = fileName.length - 1; i >= 0; i--) {
            if (fileName[i] != "/") {
                extensionMirrored += fileName[i];
            } else {
                i = -2;
            }
        }

        if (i == -1) {
            return "";
        }

        var extension = "";
        for (var j = extensionMirrored.length - 1; j >= 0; j--) {
            extension += extensionMirrored[j];
        }

        return extension;
    }

    function collectPostCurrentTags() {
        var arr = [];
        $(".watch-tag").each(function () {
            arr.push($(this).children(".tag-name").text());
        });

        return arr;
    }

    function collectPostCurrentAddedTags() {
        var arr = [];
        $(".current-tag").each(function () {
            arr.push($(this).children(".tag-name").text());
        });

        return arr;
    }

    function createTag(tagName) {
        return (
            `<div class="current-tag">` +
            `<span class="tag-name">${tagName}</span>` +
            `<span class="remove-tag">❌</span>` +
            `</div>`
        );
    }

    function createAdditionTag(tagName) {
        return (
            `<div class="have-tag">` +
            `<span class="add-tag">➕</span>` +
            `<span class="tag-name">${tagName}</span>` +
            `</div>`
        );
    }

    $("#cursorImage2").on("click", function () {
        var windscr =
            `<div class="opened-image">` +
            `<div class="close-big-image unselectable">❌</div>` +
            `<div class="full-size-image unselectable">↕</div>` +
            `<div class="full-screen-image unselectable">☩</div>` +
            `<img class="this-image unselectable undraggable" id="cursorImage" ` +
            `src="${$(this).attr("src")}" />` +
            `</div>`;

        $("body").append(windscr).addClass("no-scroll");

        $(".close-big-image").on("click", function () {
            $(".opened-image").remove();
            $("body").removeClass("no-scroll");
        });

        $(".full-size-image").on("click", function () {
            var elem = $(".this-image");
            elem.css("transform", "scale(1, 1)");

            elem.css("top", 0);
            elem.css("left", 0);
            elem.css("margin-left", (window.innerWidth - elem.width()) / 2 + "px");
            elem.css("margin-top", (window.innerHeight - elem.height()) / 2 + "px");
            new ScrollZoom(elem, 0.0625, 16, 0.1, 1);
        });

        $(".full-screen-image").on("click", function () {
            var elem = $(".this-image");

            var factorMain = window.innerWidth / elem.width();
            if (factorMain > window.innerHeight / elem.height()) {
                factorMain = window.innerHeight / elem.height();
            }

            if (factorMain > 1) {
                factorMain = 1;
            }

            elem.css("transform", `scale(${factorMain}, ${factorMain})`);
            elem.css("top", 0);
            elem.css("left", 0);
            elem.css("margin-left", (window.innerWidth - elem.width()) / 2 + "px");
            elem.css("margin-top", (window.innerHeight - elem.height()) / 2 + "px");
            new ScrollZoom(elem, 0.0625, 16, 0.1, factorMain);
        });

        new ScrollZoom($(".this-image"), 0.0625, 16, 0.1, 1);

        addListeners();

        /*var scale = 1,
            panning = false,
            start = { x: 0, y: 0 },
            zoom = document.getElementsByClassName("this-image");

        zoom = zoom[0];
        console.log(zoom);

        $(".this-image").css("transform-origin", "0px 0px");

        function setTransform() {
            zoom.style.transform =
                "translate(" + pointX + "px, " + pointY + "px) scale(" + scale + ")";
        }

         zoom.onmousedown = function (e) {
            e.preventDefault();
            start = { x: e.clientX - pointX, y: e.clientY - pointY };
            panning = true;
        };

        zoom.onmouseup = function (e) {
            panning = false;
        };

        zoom.onmousemove = function (e) {
            e.preventDefault();
            if (!panning) {
                return;
            }
            pointX = e.clientX - start.x;
            pointY = e.clientY - start.y;
            setTransform();
        };

        zoom.onwheel = function (e) {
            e.preventDefault();
            var xs = (e.clientX - pointX) / scale,
                ys = (e.clientY - pointY) / scale,
                delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;
            delta > 0 ? (scale *= 1.2) : (scale /= 1.2);
            pointX = e.clientX - xs * scale;
            pointY = e.clientY - ys * scale;

            setTransform();
        };*/

        $(".full-screen-image").trigger("click");
    });

    var pointX = 0;
    var pointY = 0;

    //this is scroll
    function ScrollZoom(target, min_scale, max_scale, factor, currentScale) {
        var scale = currentScale;
        // target.css("transform-origin", "0px 0px");
        target.css("transform-origin", "50% 50%");
        target.on("mousewheel DOMMouseScroll", scrolled);

        //  var pointX = 0;
        //  var pointY = 0;

        function scrolled(e) {
            e.preventDefault();
            var delta = e.delta || e.originalEvent.wheelDelta;
            if (delta === undefined) {
                //we are on firefox
                delta = e.originalEvent.detail;
            }
            delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency

            // apply zoom
            scale += delta * factor * scale;
            scale = Math.max(min_scale, Math.min(max_scale, scale));

            update();
        }

        function update() {
            target.css("transform", "scale(" + scale + "," + scale + ")");
        }
    }

    // this is move
    // zoom + fade effect
    function addListeners() {
        var elem = document.getElementById("cursorImage");
        elem.addEventListener("mousedown", mouseDown);
        window.addEventListener("mouseup", mouseUp);
        // elem.setAttribute("draggable", false);
    }

    function mouseUp() {
        window.removeEventListener("mousemove", divMove);
    }

    function mouseDown(e) {
        gMouseDownX = e.clientX;
        gMouseDownY = e.clientY;

        var div = document.getElementById("cursorImage");

        //The following block gets the X offset (the difference between where it starts and where it was clicked)
        let leftPart = "";
        if (!div.style.left) {
            leftPart += "0px";
        }
        //In case this was not defined as 0px explicitly.
        else {
            leftPart = div.style.left;
        }
        let leftPos = leftPart.indexOf("px");
        let leftNumString = leftPart.slice(0, leftPos); // Get the X value of the object.
        gMouseDownOffsetX = gMouseDownX - parseInt(leftNumString, 10);

        //The following block gets the Y offset (the difference between where it starts and where it was clicked)
        let topPart = "";
        if (!div.style.top) {
            topPart += "0px";
        }
        //In case this was not defined as 0px explicitly.
        else {
            topPart = div.style.top;
        }
        let topPos = topPart.indexOf("px");
        let topNumString = topPart.slice(0, topPos); // Get the Y value of the object.
        gMouseDownOffsetY = gMouseDownY - parseInt(topNumString, 10);

        window.addEventListener("mousemove", divMove);
    }

    function divMove(e) {
        var div = document.getElementById("cursorImage");
        div.style.position = "absolute";
        //  div.style.transform = "translate(" + 0 + "px, " + 0 + "px)";
        let topAmount = e.clientY - gMouseDownOffsetY;
        div.style.top = topAmount + "px";
        // pointY = topAmount;
        let leftAmount = e.clientX - gMouseDownOffsetX;
        div.style.left = leftAmount + "px";
        //   pointX = leftAmount;
    }
});
