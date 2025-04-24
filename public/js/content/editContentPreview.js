$(function () {
    // test all info that goes to server again
    // test view when all is shown (comment hide actions) (cause there can be troubles in css or smth, need to debug this)

    $("#content-editing-preview-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        if ($("#content-preview").prop("files")[0]) {
            formData.append("contentPreview", $("#content-preview").prop("files")[0]);
        }

        var jjjj = window.location.href.match(/(\/library\/.*)$/i);
        formData.append("currentURL", jjjj[1]);

        // alert(jjjj);
        console.log(getFileID(jjjj[1]));
        formData.append("ID", getFileID(jjjj[1]));

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

    $("#delete-content-preview").on("click", function (wind) {
        // localize??
        // just create localization file for client side
        // send this text from the beggining to page, then read it from initialize here, put in variable and than delete that element for localization?
        if (confirm("Вы уверены?")) {
            var formData = new FormData();

            var jjjj = window.location.href.match(/(\/library\/.*)$/i);
            formData.append("currentURL", jjjj[1]);

            // alert(jjjj);
            console.log(getFileID(jjjj[1]));
            formData.append("ID", getFileID(jjjj[1]));

            $.ajax({
                url: "/library/delete-content-preview",
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
        } else {
            return false;
        }
    });

    $("#default-content-preview").on("click", function (wind) {
        // localize??
        // just create localization file for client side
        if (confirm("Вы уверены?")) {
            var formData = new FormData();

            var jjjj = window.location.href.match(/(\/library\/.*)$/i);
            formData.append("currentURL", jjjj[1]);

            // alert(jjjj);
            console.log(getFileID(jjjj[1]));
            formData.append("ID", getFileID(jjjj[1]));

            formData.append("customTimestamp", $("input[name=contentPreviewFromMoment]").val());

            $.ajax({
                url: "/library/default-content-preview",
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
        } else {
            return false;
        }
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
});
