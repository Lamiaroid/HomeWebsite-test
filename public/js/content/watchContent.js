$(function () {
    var initializationStorage = window.localStorage;
    var timeoutid;
    var haveHelperArea = false;

    var libraryItemHeight = $(".library-watch-item").height();
    var libraryItemWidth = $(".library-watch-item").width();
    var helperAreaHeight = 100;
    var helperAreaWidth = 450;

    $(".watch-item-test").on("mouseenter", function (event) {
        var that = $(this);

        if (initializationStorage.getItem("shouldShowTooltip") === "true") {
            timeoutid = setTimeout(function () {
                if (!haveHelperArea) {
                    var position = that[0].getBoundingClientRect();
                    console.log(position);

                    var myTop = -helperAreaHeight;
                    if (position.top + myTop < 0) {
                        myTop = libraryItemHeight;
                    }

                    var myLeft = (libraryItemWidth - helperAreaWidth) / 2;
                    if (position.left + myLeft < 0) {
                        myLeft = 0;
                    }
                    if (position.right - myLeft > window.innerWidth) {
                        myLeft = libraryItemWidth - helperAreaWidth;
                    }
                    $(getHelperArea())
                        .css({
                            top: myTop, //,
                            left: myLeft,
                            //width: $(".watch-item-test").width(),
                        })
                        .hide()
                        .appendTo(that.parent())
                        .fadeIn(300);
                    haveHelperArea = true;
                }
            }, 500);
        }
    });

    $(".library-watch-item").on("mouseleave", function (event) {
        $(".helper-area").fadeOut(300, function () {
            $(this).remove();
            haveHelperArea = false;

            //created = false;
        });
        clearTimeout(timeoutid);
    });

    function getHelperArea() {
        var html = `<div class="helper-area">Hello</div>`;

        return html;
    }
});
