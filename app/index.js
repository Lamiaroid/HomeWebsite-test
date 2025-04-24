const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const express = require("express");

const { initializeLocalization } = require("./js/localizer.js");
const { initializeSettings } = require("./js/settings.js");
const { storages } = require("./js/storages.js");
const { logger, generateLogMessage } = require("./js/logger.js");
const { assemblePage, assemblePage404 } = require("./js/helpers/assemblePage.js");
const asyncWrap = require("./js/asyncWrap.js");
const constants = require("./js/constants.js");
const libraryRouter = require("./js/routers/libraryRouter.js");

const app = express();
const server = require("http").createServer(app);

const port = 3000;
const tokenLife = 18000;

app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(constants.library.dir.public));

// storages for content (can be somewhere you like)
for (let i = 0; i < storages.length; i++) {
    app.use(express.static(storages[i]));
}

app.get(
    constants.library.api.homepage,
    /*tokenChecker,*/ function (request, response) {
        response.redirect(constants.library.api.main);
    }
);

app.use(constants.library.api.main, /*tokenChecker,*/ libraryRouter);

app.get("/x", async function (request, response) {
    throw new Error("exit");
});

app.get(constants.library.api.any, async function (request, response) {
    response.status(404).send(await assemblePage404());
});

app.post(constants.library.api.any, async function (request, response) {
    response.status(404).send(await assemblePage404());
});

app.use(async function (err, request, response, next) {
    console.error("x", err.stack);
    logger.error(generateLogMessage(err.stack));
    const html = await assemblePage(
        constants.library.page.page500Head,
        constants.library.page.page500Body,
        false
    );
    response.status(500).send(html);
});

server.listen(port, async function () {
    await initializeLocalization();
    await initializeSettings();
});
