$(function () {
    $("#upload-tag-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        formData.append("tagName", $("input[name=tagName]").val());

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
