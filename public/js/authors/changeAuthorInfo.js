$(function () {
    var linksNow = 0;

    initialize();

    $("#need-more-links").on("click", function (wind) {
        linksNow++;
        $("#links-area").append(
            `<input id="author-link-${linksNow}" class="author-link" name="authorLink${linksNow}" />`
        );
    });

    $("#author-name-selector").on("click", function (wind) {
        wind.preventDefault();

        if ($("#author-name-selector").val()) {
            $("#author-name").prop("disabled", false);
            $("#ready-to-change-button").prop("disabled", false);
            $("#need-more-links").prop("disabled", false);
            $("#delete-author").prop("disabled", false);
            $("#author-avatar-link").prop("disabled", false);
            $("#author-header-image-link").prop("disabled", false);

            $(".change-author-header").css("justify-content", "space-between");
            $("#update-author-form, #need-more-links, #delete-author-form").show();

            $.post(
                "/library/get-author-info",
                {
                    authorOriginalName: $("#author-name-selector option:selected").text(),
                },
                function (data) {
                    $("#author-name").val(data.authors[0].Name);
                    $("#author-secret").val(data.authors[0].Name);

                    $("#author-avatar-link").val(data.authors[0].AvatarLink);
                    $("#author-header-image-link").val(data.authors[0].HeaderImageLink);

                    for (var i = 0; i <= linksNow; i++) {
                        $(`#author-link-${i}`).remove();
                        $(`#author-secret-link-${i}`).remove();
                    }
                    linksNow = 0;

                    for (var i = 0; i < data.links[0].length; i++) {
                        linksNow++;
                        $("#links-area").append(
                            `<input id="author-link-${linksNow}" class="author-link" name="authorLink${linksNow}" />`
                        );
                        $(`#author-link-${linksNow}`).val(data.links[0][i]);

                        $("#links-secret-area").append(
                            `<input class="secret" id="author-secret-link-${linksNow}" name="authorOriginalLink${linksNow}" />`
                        );
                        $(`#author-secret-link-${linksNow}`).val(data.links[0][i]);
                    }
                }
            ).fail(function (xhr, status, error) {});
        }
    });

    $("#delete-author-form").on("submit", function (wind) {
        wind.preventDefault();

        // localize??
        if (confirm("Вы уверены?")) {
            var formData = new FormData();

            formData.append("authorOriginalName", $("select[name=authorNameSelector]").val());

            fetch($(this).attr("action"), { method: "POST", body: formData })
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

    $("#update-author-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        formData.append("authorName", $("input[name=authorName]").val());
        formData.append("authorOriginalName", $("input[name=authorOriginalName]").val());
        formData.append("authorAvatarLink", $("input[name=authorAvatarLink]").val());
        formData.append("authorHeaderImageLink", $("input[name=authorHeaderImageLink]").val());

        var i = 1;
        while ($(`#author-link-${i}`).length) {
            formData.append(`authorLinks`, $(`input[name=authorLink${i}]`).val());
            i++;
        }

        i = 1;
        while ($(`#author-secret-link-${i}`).length) {
            formData.append(`authorOriginalLinks`, $(`input[name=authorOriginalLink${i}]`).val());
            i++;
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
        $("#update-author-form, #need-more-links, #delete-author-form").hide();
    }
});
