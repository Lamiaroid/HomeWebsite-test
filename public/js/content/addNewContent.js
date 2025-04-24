$(function () {
    // test all info that goes to server again
    // test view when all is shown (comment hide actions) (cause there can be troubles in css or smth, need to debug this)

    var isUploadingAndProcessing = false;

    var uploadProgressBarIndicator = $(".upload-progress-bar-indicator");
    var uploadProgressBarValue = $(".upload-progress-bar-value");
    var processingProgressBarIndicator = $(".processing-progress-bar-indicator");
    var processingProgressBarValue = $(".processing-progress-bar-value");

    initialize();

    $("#groupNew").on("click", function (wind) {
        changeElementsAvailabilityBasedOnGroup(true);
    });

    $("#groupExisting").on("click", function (wind) {
        changeElementsAvailabilityBasedOnGroup(false);
    });

    $("#content-type").on("click", function (wind) {
        changeElementsAvailabilityBasedOnGroup(true, true);
    });

    $("#fileSingle").on("click", function (wind) {
        if (!$("#groupExisting").prop("disabled") || !$("#groupNew").prop("disabled")) {
            $("#content-number-in-group").prop("disabled", false);
            $(".content-number-in-group").show();
        }

        $("#content-file-single").prop("disabled", false);
        $("#content-file-multiple").val("");
        $("#content-file-multiple").prop("disabled", true);
        $(".file-multiple-radio").removeClass("file-multiple-radio-checked");
        $(".file-single-radio").addClass("file-single-radio-checked");
        $("#content-file-multiple").hide();
        $("#content-file-single").show();
    });

    $("#fileMultiple").on("click", function (wind) {
        $("#content-number-in-group").prop("disabled", true);
        $("#content-number-in-group").val("");
        $(".content-number-in-group").hide();

        $("#content-file-single").prop("disabled", true);
        $("#content-file-single").val("");
        $("#content-file-multiple").prop("disabled", false);
        $(".file-multiple-radio").addClass("file-multiple-radio-checked");
        $(".file-single-radio").removeClass("file-single-radio-checked");
        $("#content-file-multiple").show();
        $("#content-file-single").hide();
    });

    $(
        "#comic-type, #comicMini-type, #videoSeries-type, #story-type, #storyAudio-type, #storyInteractive-type, #other-type, #image-type, #video-type, #music-type, #sound-type"
    ).on("click", function (wind) {
        showGroupNamesForCertainContentType($(this).attr("id").replace("-type", ""));
    });

    $("#content-uploading-form").on("submit", function (event) {
        event.preventDefault();

        if (!isUploadingAndProcessing) {
            isUploadingAndProcessing = true;

            var formData = new FormData();

            formData.append("contentName", $("input[name=contentName]").val());

            if ($("#content-file-single").prop("files")[0]) {
                formData.append("contentFileSingle", $("#content-file-single").prop("files")[0]);
            }

            if ($("#content-file-multiple").prop("files")[0]) {
                var contentFiles = $("#content-file-multiple").prop("files");
                var i = 0;
                while (contentFiles[i]) {
                    formData.append("contentFileMultiple", contentFiles[i]);
                    i++;
                }
            }

            // а есть ли у нас проверки для пустого типа контента и автора???
            var contentAuthor = $("select[name=contentAuthor]").val();
            if (!contentAuthor) {
                contentAuthor = "";
            }
            formData.append("contentAuthor", contentAuthor);

            formData.append("contentCreationDate", $("input[name=contentCreationDate]").val());
            formData.append("contentDescription", $("textarea[name=contentDescription]").val());
            formData.append("contentLinkToOriginal", $("input[name=contentLinkToOriginal]").val());

            // а есть ли у нас проверки для пустого типа контента и автора???
            var contentType = $("select[name=contentType]").val();
            if (!contentType) {
                contentType = "";
            }
            formData.append("contentType", contentType);

            if (!$("input[name=contentGroupNameNew]").prop("disabled")) {
                formData.append("contentGroupNameNew", $("input[name=contentGroupNameNew]").val());
            }

            // so do we take value by val() or :selected? (selected seems better try with filter as on stackoverflow)
            // нужно быть очень аккуратным с селектом, так как не выбранное значение даёт null которе потом передаётся на сервер как 'null' строкой поэтому нужно устанавливать пустую строку уже здесь
            if (!$("select[name=contentGroupNameExisting]").prop("disabled")) {
                var contentGroupNameExisting = $("select[name=contentGroupNameExisting]").val();
                if (!contentGroupNameExisting) {
                    contentGroupNameExisting = "";
                }
                formData.append("contentGroupNameExisting", contentGroupNameExisting);
            }

            if (!$("input[name=contentNumberInGroup]").prop("disabled")) {
                formData.append(
                    "contentNumberInGroup",
                    $("input[name=contentNumberInGroup]").val()
                );
            }

            if ($("#content-preview").prop("files")[0]) {
                formData.append("contentPreview", $("#content-preview").prop("files")[0]);
            }

            $(".upload-progress-bar-container").fadeIn(200);
            $("#status-container").fadeOut(200);

            var longPoll;
            $.ajax({
                url: $(this).attr("action"),
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,

                complete: function (data) {
                    isUploadingAndProcessing = false;
                    clearInterval(longPoll);

                    if (data.status == 200) {
                        window.location.href = data.responseJSON.url;
                    } else {
                        $("#status-container").fadeOut(200, function () {
                            finishedProcessing();
                            $("#status-container").html(data.responseText).fadeIn(400);
                        });
                    }
                },

                xhr: function () {
                    var xhr = new XMLHttpRequest();

                    xhr.upload.addEventListener(
                        "progress",
                        function (e) {
                            if (e.lengthComputable) {
                                var uploadPercent = (e.loaded / e.total) * 100;

                                moveUploadIndicator(Math.floor(uploadPercent));

                                if (uploadPercent == 100) {
                                    var processingStarted = false;
                                    longPoll = setInterval(function () {
                                        $.post("/library/check-processing-status").then(function (
                                            status
                                        ) {
                                            if (!processingStarted) {
                                                $(".processing-progress-bar-container").fadeIn(200);
                                                processingStarted = true;
                                            }
                                            moveProcessingIndicator(status.processed, status.total);

                                            if (parseInt(status.processed === status.total)) {
                                                finishedProcessing();
                                                clearInterval(longPoll);
                                            }
                                        });
                                    }, 250);
                                }
                            }
                        },
                        false
                    );

                    return xhr;
                },
            });
        }
    });

    $("#content-description").on("focusout focus", function (event) {
        if (event.type == "focus") {
            $(".content-description-inner").addClass("content-description-inner-focus");
        } else {
            $(".content-description-inner").removeClass("content-description-inner-focus");
        }
    });

    $(".content-description-inner").on("click mouseenter mouseleave", function (event) {
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
    });

    function initialize() {
        // Initial groups clearing
        // а нам это вообще надо?
        // кстати imagetobraille можно использовать для создания артов, потом просто размер шрифта на сайте уменьшать
        showGroupNamesForCertainContentType("image-type");
        $("#content-file-single").hide().removeClass("invisible");
        $(".groups-container").hide().removeClass("invisible");
        $(".content-number-in-group").hide();
        $(".file-multiple-radio").addClass("file-multiple-radio-checked");
    }

    function changeElementsAvailabilityBasedOnGroup(isNewGroup, contentTypeChanged = false) {
        const contentType = "#content-type";
        const groupNew = "#groupNew";
        const groupExisting = "#groupExisting";
        const contentGroupNameNew = "#content-group-name-new";
        const contentGroupNameExisting = "#content-group-name-existing";
        const contentNumberInGroup = "#content-number-in-group";

        if (
            $(contentType).val() == constants.contentType.comic ||
            $(contentType).val() == constants.contentType.comicMini ||
            $(contentType).val() == constants.contentType.videoSeries ||
            $(contentType).val() == constants.contentType.story ||
            $(contentType).val() == constants.contentType.storyAudio ||
            $(contentType).val() == constants.contentType.storyInteractive ||
            $(contentType).val() == constants.contentType.other
        ) {
            if (!contentTypeChanged) {
                $(groupNew).prop("disabled", false);
                $(groupExisting).prop("disabled", false);
                if ($("#content-file-multiple").prop("disabled")) {
                    $(contentNumberInGroup).prop("disabled", false);
                    $(".content-number-in-group").show();
                }
                if (isNewGroup) {
                    $(contentGroupNameNew).prop("disabled", false);
                    $(contentGroupNameExisting).val("");
                    $(contentGroupNameExisting).prop("disabled", true);
                    $(".content-group-name-existing").hide();
                    $(".content-group-name-new").show();
                    $(".group-new-radio").addClass("group-new-radio-checked");
                    $(".group-existing-radio").removeClass("group-existing-radio-checked");
                } else {
                    $(contentGroupNameNew).prop("disabled", true);
                    $(contentGroupNameNew).val("");
                    $(contentGroupNameExisting).prop("disabled", false);
                    $(".content-group-name-existing").show();
                    $(".content-group-name-new").hide();
                    $(".group-new-radio").removeClass("group-new-radio-checked");
                    $(".group-existing-radio").addClass("group-existing-radio-checked");
                }
                $(".groups-container").show();
            } else {
                if ($(groupExisting).prop("checked")) {
                    $(groupExisting).trigger("click");
                } else {
                    $(groupNew).trigger("click");
                }
            }
        } else {
            if (contentTypeChanged) {
                $(groupNew).prop("disabled", true);
                $(groupExisting).prop("disabled", true);
                $(contentGroupNameNew).val("");
                $(contentGroupNameNew).prop("disabled", true);
                $(contentGroupNameExisting).val("");
                $(contentGroupNameExisting).prop("disabled", true);
                $(contentNumberInGroup).prop("disabled", true);
                $(".groups-container").hide();
            }
        }
    }

    function showGroupNamesForCertainContentType(contentType) {
        const type = constants.contentType;

        if (
            contentType == type.image ||
            contentType == type.sound ||
            contentType == type.music ||
            contentType == type.video
        ) {
            $("#content-number-in-group").val("");
        }

        $("#content-group-name-existing").val("");
        $(`.${type.comic}`).hide();
        $(`.${type.comicMini}`).hide();
        $(`.${type.videoSeries}`).hide();
        $(`.${type.story}`).hide();
        $(`.${type.storyAudio}`).hide();
        $(`.${type.storyInteractive}`).hide();
        $(`.${type.other}`).hide();

        $(`.${contentType}`).show();
    }

    function moveUploadIndicator(width) {
        uploadProgressBarIndicator.width(width + "%");
        uploadProgressBarIndicator.html(width + "%");
        uploadProgressBarValue.html(width + "%");
    }

    function moveProcessingIndicator(processed, total) {
        var width = Math.floor((parseInt(processed) / parseInt(total)) * 100);

        processingProgressBarIndicator.width(width + "%");
        processingProgressBarIndicator.html(width + "%");
        processingProgressBarValue.html(processed + " / " + total);
    }

    function finishedProcessing() {
        $(".upload-progress-bar-container").fadeOut(200, function () {
            $(".upload-progress-bar-indicator").width(0);
        });

        $(".processing-progress-bar-container").fadeOut(200, function () {
            $(".processing-progress-bar-indicator").width(0);
        });
    }
});
