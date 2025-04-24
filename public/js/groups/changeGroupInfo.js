$(function () {
    initialize();

    $("#delete-group-preview").on("click", function (wind) {
        // localize??
        // just create localization file for client side
        // send this text from the beggining to page, then read it from initialize here, put in variable and than delete that element for localization?
        if (confirm("Вы уверены?")) {
            var formData = new FormData();

            formData.append("groupName", $("#group-name-selector option:selected").text());
            formData.append("contentType", $("#group-name-selector option:selected").attr("class"));

            fetch("/library/delete-group-preview", { method: "POST", body: formData })
                .then((data) => {
                    if (data.redirected) {
                        window.location.href = data.url;

                        return;
                    }
                })
                .catch((reason) => {
                    alert(reason);
                });
        } else {
            return false;
        }
    });

    $("#group-name-selector").on("click", function (wind) {
        wind.preventDefault();

        // bug when clicking on select and there is no selected option (upd: этот иф фиксит баг?)
        // receive action from server?
        if ($("#group-name-selector").val()) {
            $.post(
                "/library/get-group-info",
                {
                    contentType: $("#group-name-selector option:selected").attr("class"),
                    groupOriginalName: $("#group-name-selector option:selected").text(),
                },
                function (data) {
                    // need to work with select as whichis better select val or option selected???
                    $("#group-name").val($("#group-name-selector option:selected").text());

                    $("#group-name").prop("disabled", false);
                    $("#group-preview").prop("disabled", false);
                    $("#ready-to-change-button").prop("disabled", false);
                    $(".next-container-item, .group-name-info-for-view").show();

                    if (data.hasPreview) {
                        $("#delete-group-preview").prop("disabled", false);
                        $(".no-preview-title").hide();
                        $("#delete-group-preview").show();
                    } else {
                        $("#delete-group-preview").prop("disabled", true);
                        $(".no-preview-title").show();
                        $("#delete-group-preview").hide();
                    }

                    $("#groupPreviewImage").attr("src", data.groupPreviewPath);

                    $("#contentType").text(data.localizedContentType);
                }
            ).fail(function (xhr, status, error) {});
        }
    });

    $("#update-group-info-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        formData.append("groupName", $("input[name=groupName]").val());
        formData.append("groupNameOriginal", $("#group-name-selector option:selected").text());
        formData.append("contentType", $("#group-name-selector option:selected").attr("class"));

        if ($("#group-preview").prop("files")[0]) {
            formData.append("groupPreview", $("#group-preview").prop("files")[0]);
        }

        fetch($(this).attr("action"), { method: "POST", body: formData })
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

    function initialize() {
        $(".next-container-item, .group-name-info-for-view").hide();
    }
});
