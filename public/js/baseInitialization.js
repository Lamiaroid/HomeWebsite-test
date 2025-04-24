$(function () {
    // check all with cookie deleted
    baseInitialization();

    function baseInitialization() {
        var initializationStorage = window.localStorage;

        // gear-settings
        if (!initializationStorage.getItem("shouldShowTooltip")) {
            initializationStorage.setItem("shouldShowTooltip", true);
        }
        if (!initializationStorage.getItem("shouldRepeat")) {
            initializationStorage.setItem("shouldRepeat", false);
        }
        if (!initializationStorage.getItem("shouldPinBanner")) {
            initializationStorage.setItem("shouldPinBanner", false);
        }
        if (!initializationStorage.getItem("shouldAutoplay")) {
            initializationStorage.setItem("shouldAutoplay", false);
        }
        if (!initializationStorage.getItem("descriptionLineWidth")) {
            initializationStorage.setItem("descriptionLineWidth", 94);
        }
        if (!initializationStorage.getItem("descriptionFontSize")) {
            initializationStorage.setItem("descriptionFontSize", 20);
        }
        if (!initializationStorage.getItem("descriptionLineHeight")) {
            initializationStorage.setItem("descriptionLineHeight", 23);
        }
        if (!initializationStorage.getItem("descriptionLineIndent")) {
            initializationStorage.setItem("descriptionLineIndent", 0);
        }
        if (!initializationStorage.getItem("descriptionTextPosition")) {
            initializationStorage.setItem("descriptionTextPosition", 0);
        }
        if (!initializationStorage.getItem("descriptionWordSpacing")) {
            initializationStorage.setItem("descriptionWordSpacing", 0);
        }
        //gear settings

        //editor settings
        if (!initializationStorage.getItem("showContentEditorTools")) {
            initializationStorage.setItem("showContentEditorTools", true);
        }
        if (!initializationStorage.getItem("showContentEditorLight")) {
            initializationStorage.setItem("showContentEditorLight", true);
        }
        if (!initializationStorage.getItem("showContentEditorPreviewScroll")) {
            initializationStorage.setItem("showContentEditorPreviewScroll", false);
        }
        //editor settings

        //panel and menu settings
        if (!initializationStorage.getItem("needLeftPanel")) {
            initializationStorage.setItem("needLeftPanel", false);
        }
        if (!initializationStorage.getItem("needLeftMenu")) {
            initializationStorage.setItem("needLeftMenu", true);
        }
        if (!initializationStorage.getItem("currentSelectedContentTypeForTagsAuthorsSearch")) {
            initializationStorage.setItem("currentSelectedContentTypeForTagsAuthorsSearch", "all");
        }
        if (!initializationStorage.getItem("currentActiveItem")) {
            initializationStorage.setItem("currentActiveItem", "menu-navigation-item-1");
        }
        //panel and menu settings
    }
});
