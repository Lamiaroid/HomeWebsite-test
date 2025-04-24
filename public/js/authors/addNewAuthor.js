$(function () {
    var linksNow = 0;

    $("#need-more-links").on("click", function (wind) {
        linksNow++;
        $("#links-area").append(
            `<input id="author-link-${linksNow}" class="author-link" name="authorLink${linksNow}" />`
        );
    });

    $("#upload-author-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        formData.append("authorName", $("input[name=authorName]").val());
        formData.append("avatarLink", $("input[name=avatarLink]").val());
        formData.append("headerImageLink", $("input[name=headerImageLink]").val());

        var i = 1;
        while ($(`#author-link-${i}`).length) {
            formData.append(`authorLinks`, $(`input[name=authorLink${i}]`).val());
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
});
