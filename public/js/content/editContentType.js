$(function () {
    // test all info that goes to server again
    // test view when all is shown (comment hide actions) (cause there can be troubles in css or smth, need to debug this)

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

    $(
        "#comic-type, #comicMini-type, #videoSeries-type, #story-type, #storyAudio-type, #storyInteractive-type, #other-type, #image-type, #video-type, #music-type, #sound-type"
    ).on("click", function (wind) {
        showGroupNamesForCertainContentType($(this).attr("id").replace("-type", ""));
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
        showGroupNamesForCertainContentType("image-type");
        $(".groups-container").hide().removeClass("invisible");
        $(".content-number-in-group").hide();
    }

    function postInitialize() {
        $("select[name=contentType] :selected").trigger("click");
        $("select[name=contentGroupNameExisting]").val($("#current-group").val());
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
                $(contentNumberInGroup).prop("disabled", false);
                $(".content-number-in-group").show();
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

    $("#content-editing-type-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        var jjjj = window.location.href.match(/(\/library\/.*)$/i);
        formData.append("currentURL", jjjj[1]);

        // alert(jjjj);
        console.log(getFileID(jjjj[1]));
        formData.append("ID", getFileID(jjjj[1]));

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
        if (!$("select[name=contentGroupNameExisting]").prop("disabled")) {
            // а есть ли у нас проверки для пустого типа контента и автора???
            var contentGroupNameExisting = $("select[name=contentGroupNameExisting]").val();
            if (!contentGroupNameExisting) {
                contentGroupNameExisting = "";
            }
            formData.append("contentGroupNameExisting", contentGroupNameExisting);
        }

        if (!$("input[name=contentNumberInGroup]").prop("disabled")) {
            formData.append("contentNumberInGroup", $("input[name=contentNumberInGroup]").val());
        }

        $("#status-container").fadeOut(200);

        $.ajax({
            url: $(this).attr("action"),
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,

            complete: function (data) {
                if (data.status == 200) {
                    window.location.href = data.responseJSON.url;
                } else {
                    $("#status-container").fadeOut(200, function () {
                        $("#status-container").html(data.responseText).fadeIn(400);
                    });
                }
            },
        });
    });

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

    postInitialize();
});
