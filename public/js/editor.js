$(function () {
    var initializationStorage = window.localStorage;

    editorClick("#content-editor-bold", "<b>", "</b>");

    editorClick("#content-editor-italic", "<i>", "</i>");

    editorClick("#content-editor-paragraph", "<p>", "</p>");

    editorClick("#content-editor-h1", "<h1>", "</h1>");

    editorClick("#content-editor-h2", "<h2>", "</h2>");

    editorClick("#content-editor-h3", "<h3>", "</h3>");

    editorClick("#content-editor-h4", "<h4>", "</h4>");

    editorClick("#content-editor-h5", "<h5>", "</h5>");

    editorClick("#content-editor-h6", "<h6>", "</h6>");

    editorClick("#content-editor-center", `<div style="text-align: center">`, "</div>");

    editorClick("#content-editor-right", `<div style="text-align: right">`, "</div>");

    editorClick(
        "#content-editor-hyperlink",
        `<a class="post-hyperlink" href="YOUR_LINK_HERE">`,
        "</a>"
    );

    editorClick(
        "#content-editor-image",
        `<img style="max-width: 50%" align="center" src="YOUR_IMAGE_LINK_HERE">`,
        ""
    );

    initializeEditor();

    $(".content-editor-setting-tools").on("click", function (event) {
        event.preventDefault();

        if (initializationStorage.getItem("showContentEditorTools") === "true") {
            $(".content-editor-tools").fadeOut(300);
            $(this).removeClass("content-editor-setting-selected");
            initializationStorage.setItem("showContentEditorTools", false);
        } else {
            $(".content-editor-tools").fadeIn(300);
            $(this).addClass("content-editor-setting-selected");
            initializationStorage.setItem("showContentEditorTools", true);
        }
    });

    $(".content-editor-setting-light").on("click", function (event) {
        event.preventDefault();

        if (initializationStorage.getItem("showContentEditorLight") === "true") {
            $(".content-description-inner").removeClass("content-description-inner-light");
            $(this).removeClass("content-editor-setting-selected");
            initializationStorage.setItem("showContentEditorLight", false);
        } else {
            $(".content-description-inner").addClass("content-description-inner-light");
            $(this).addClass("content-editor-setting-selected");
            initializationStorage.setItem("showContentEditorLight", true);
        }
    });

    $(".content-editor-setting-scroll").on("click", function (event) {
        event.preventDefault();

        if (initializationStorage.getItem("showContentEditorPreviewScroll") === "true") {
            $(".content-editor").removeClass("content-editor-scrollable");
            $(this).removeClass("content-editor-setting-selected");
            initializationStorage.setItem("showContentEditorPreviewScroll", false);
        } else {
            $(".content-editor").addClass("content-editor-scrollable");
            $(this).addClass("content-editor-setting-selected");
            initializationStorage.setItem("showContentEditorPreviewScroll", true);
        }
    });

    $("#content-description").on("focusout focus", function (event) {
        if (initializationStorage.getItem("showContentEditorLight") === "true") {
            if (event.type == "focus") {
                $(".content-description-inner").addClass("content-description-inner-focus");
            } else {
                $(".content-description-inner").removeClass("content-description-inner-focus");
            }
        } else {
            $(".content-description-inner").removeClass("content-description-inner-focus");
            $(".content-description-inner").removeClass("content-description-inner-hover");
        }
    });

    $(".content-description-inner").on("click mouseenter mouseleave", function (event) {
        if (initializationStorage.getItem("showContentEditorLight") === "true") {
            switch (event.type) {
                case "click":
                    $(this).removeClass("content-description-inner-hover");
                    $(this).addClass("content-description-inner-focus");
                    $("#content-description").trigger("focus");
                    break;

                case "mouseenter":
                    $(this).addClass("content-description-inner-hover");
                    break;

                case "mouseleave":
                    $(this).removeClass("content-description-inner-hover");
                    break;
            }
        } else {
            $(this).removeClass("content-description-inner-focus");
            $(this).removeClass("content-description-inner-hover");
        }
    });

    $("#content-editor-color").on("click", function (event) {
        console.log(event);
        if (event.target.className !== "content-editor-color-input") {
            event.preventDefault();

            var selectedText = getSelectionText();

            replaceSelectedText(
                selectedText,
                `<span style="color: ${$(".content-editor-color-input").val()}">`,
                "</span>"
            );

            reloadEditor();
        }
    });

    $("#content-editor-font-size").on("click", function (event) {
        if (event.target.className !== "content-editor-font-size-input") {
            event.preventDefault();

            var selectedText = getSelectionText();

            replaceSelectedText(
                selectedText,
                `<span style="font-size: ${$(".content-editor-font-size-input").val()}px">`,
                "</span>"
            );

            reloadEditor();
        } else {
            event.preventDefault();
        }
    });

    $("textarea[name=contentDescription]").on("keydown keyup", function (event) {
        reloadEditor();
    });

    function initializeEditor() {
        if (initializationStorage.getItem("showContentEditorTools") === "true") {
            $(".content-editor-tools").show();
            $(".content-editor-setting-tools").addClass("content-editor-setting-selected");
        } else {
            $(".content-editor-tools").hide();
            $(".content-editor-setting-tools").removeClass("content-editor-setting-selected");
        }

        if (initializationStorage.getItem("showContentEditorLight") === "true") {
            $(".content-editor-setting-light").addClass("content-editor-setting-selected");
            $(".content-description-inner").addClass("content-description-inner-light");
        } else {
            $(".content-editor-setting-light").removeClass("content-editor-setting-selected");
            $(".content-description-inner").removeClass("content-description-inner-light");
        }

        if (initializationStorage.getItem("showContentEditorPreviewScroll") === "true") {
            $(".content-editor").addClass("content-editor-scrollable");
            $(".content-editor-setting-scroll").addClass("content-editor-setting-selected");
        } else {
            $(".content-editor").removeClass("content-editor-scrollable");
            $(".content-editor-setting-scroll").removeClass("content-editor-setting-selected");
        }
    }

    function editorClick(elemName, openTag, closeTag) {
        $(elemName).on("click", function (event) {
            event.preventDefault();

            var selectedText = getSelectionText();

            replaceSelectedText(selectedText, openTag, closeTag);

            reloadEditor();
        });
    }

    function reloadEditor() {
        var html = $("textarea[name=contentDescription]").val();

        var str = replaceForHtml(html);
        str = "<div>" + str + "</div>";

        $("#content-editor").html(str);
    }

    //duplicate in content-updater
    function replaceForHtml(str) {
        str = str.replace(/\n/g, "</div><div>");
        str = str.replace(/\s\s/g, " &nbsp;");
        //из-за этой регулярки возникает баг с переносами, так как браузер считает всё одной строкой и наинает разбивать слова несмортря на стили, нужно пересмотреть логику редактора и смены описаний
        // а сам браузер не хрчет отображать 2+ пробела без спец символов...
        // str = str.replace(/\s/g, "&nbsp;");
        // пустой <div></div> не даёт абзацев, поэтому нужно делать имеено так
        str = str.replace(/<div><\/div>/g, "<br>");

        return str;
    }

    function replaceSelectedText(text, openTag, closeTag) {
        var txtArea = document.getElementById("content-description");
        if (txtArea.selectionStart != undefined) {
            var startPos = txtArea.selectionStart;
            var endPos = txtArea.selectionEnd;
            selectedText = txtArea.value.substring(startPos, endPos);
            txtArea.value =
                txtArea.value.slice(0, startPos) +
                openTag +
                text +
                closeTag +
                txtArea.value.slice(endPos);
        }
    }

    function getSelectionText() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        return text;
    }
});
