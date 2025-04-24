$(function () {
    initialize();

    $("#tag-name-selector").on("click", function (wind) {
        wind.preventDefault();

        if ($("#tag-name-selector").val()) {
            $("#tag-name").prop("disabled", false);
            $("#ready-to-change-button").prop("disabled", false);
            $("#delete-tag").prop("disabled", false);

            $(".change-tag-header").css("justify-content", "space-between");
            $("#update-tag-form, #delete-tag-form").show();

            $.post(
                "/library/get-tag-info",
                {
                    tagOriginalName: $("#tag-name-selector option:selected").text(),
                },
                function (data) {
                    $("#tag-name").val(data[0].Name);
                    $("#tag-secret").val(data[0].Name);
                }
            ).fail(function (xhr, status, error) {});
        }
    });

    $("#delete-tag-form").on("submit", function (wind) {
        wind.preventDefault();

        // localize??
        if (confirm("Вы уверены?")) {
            var formData = new FormData();

            formData.append("tagOriginalName", $("select[name=tagNameSelector]").val());

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

    $("#update-tag-form").on("submit", function (event) {
        event.preventDefault();

        var formData = new FormData();

        formData.append("tagName", $("input[name=tagName]").val());
        formData.append("tagOriginalName", $("input[name=tagOriginalName]").val());

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
        $("#update-tag-form, #delete-tag-form").hide();
    }
});
