$(function () {
    // test all info that goes to server again

    $("#content-editing-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        formData.append("contentName", $("input[name=contentName]").val());

        // а есть ли у нас проверки для пустого типа контента и автора???
        var contentAuthor = $("select[name=contentAuthor]").val();
        if (!contentAuthor) {
            contentAuthor = "";
        }
        formData.append("contentAuthor", contentAuthor);

        formData.append("contentCreationDate", $("input[name=contentCreationDate]").val());
        formData.append("contentDescription", $("textarea[name=contentDescription]").val());
        formData.append("contentLinkToOriginal", $("input[name=contentLinkToOriginal]").val());

        var jjjj = window.location.href.match(/(\/library\/.*)$/i);
        formData.append("currentURL", jjjj[1]);

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
