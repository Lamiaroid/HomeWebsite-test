$(function () {
    $(".author-more-info-button").on("click", function () {
        $(this).parent().parent().css("transform", "rotateY(180deg)");
    });

    $(".author-less-info-button").on("click", function () {
        $(this).parent().parent().css("transform", "rotateY(0deg)");
    });

    $(".author-links-container").each(function () {
        if ($(this).get(0).scrollWidth > $(this).innerWidth()) {
            $(this).css("justify-content", "unset");
        }
    });
});
