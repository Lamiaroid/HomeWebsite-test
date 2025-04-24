const fileType = require("file-type");

exports.checkIfExtensionPasses = async function (extension, fileBuffer, dictionary, filePath = "") {
    if (dictionary == -1) {
        return true;
    }

    console.log("this is dictionary ", dictionary);

    if (this.checkIfExtensionPassesWithExtension(extension, dictionary)) {
        return true;
    }

    return await this.checkIfExtensionPassesWithFileTypeLibrary(fileBuffer, dictionary, filePath);
};

exports.checkIfExtensionPassesWithExtension = function (extension, dictionary) {
    console.log(dictionary);
    if (extension && extension.length) {
        if (dictionary[extension.toLowerCase()]) {
            return true;
        }
    }
    return false;
};

exports.checkIfExtensionPassesWithFileTypeLibrary = async function (
    fileBuffer,
    dictionary,
    filePath = ""
) {
    var fileInfo;
    if (!filePath) {
        fileInfo = await fileType.fromBuffer(fileBuffer);
    } else {
        fileInfo = await fileType.fromFile(filePath);
    }

    if (!fileInfo || !fileInfo.ext) {
        return false;
    }

    console.log("program filex ext ", fileInfo.ext);

    return this.checkIfExtensionPassesWithExtension(fileInfo.ext, dictionary);
};

exports.generateString = function (dictionary) {
    var text = "";
    for (const [key, value] of Object.entries(dictionary)) {
        text += `${value}, `;
    }

    var tmp = text.split("");
    tmp.splice(text.length - 2, 2);
    return tmp.join("");
};

// need to write text that image is not supported by google, same for wmv etc
// guide how to open if not opens in chrome
exports.image = JSON.parse(
    JSON.stringify({
        bmp: "bmp",
        gif: "gif",
        ico: "ico",
        jpg: "jpg",
        png: "png",
        psd: "psd",
        svg: "svg",
        tif: "tif",
        webp: "webp",
    })
);

exports.comic = JSON.parse(
    JSON.stringify({
        bmp: "bmp",
        gif: "gif",
        ico: "ico",
        jpg: "jpg",
        png: "png",
        psd: "psd",
        svg: "svg",
        tif: "tif",
        webp: "webp",

        cbr: "cbr",
        djvu: "djvu",
        pdf: "pdf",
    })
);

exports.video = JSON.parse(
    JSON.stringify({
        "3gp": "3gp",
        avi: "avi",
        bik: "bik",
        bk2: "bk2",
        mkv: "mkv",
        mov: "mov",
        mp4: "mp4",
        mpg: "mpg",
        ogv: "ogv",
        webm: "webm",
        wmv: "wmv",
    })
);

exports.audio = JSON.parse(
    JSON.stringify({ aac: "aac", flac: "flac", mp3: "mp3", ogg: "ogg", wav: "wav", wma: "wma" })
);

exports.text = JSON.parse(
    JSON.stringify({ doc: "doc", docx: "docx", pdf: "pdf", rtf: "rtf", txt: "txt" })
);

exports.storyInteractive = JSON.parse(JSON.stringify({ txt: "txt" }));

exports.other = JSON.parse(
    JSON.stringify({
        "7z": "7z",
        csv: "csv",
        eml: "eml",
        exe: "exe",
        jps: "jps",
        msi: "msi",
        pps: "pps",
        ppt: "ppt",
        pptx: "pptx",
        rar: "rar",
        swf: "swf",
        vsd: "vsd",
        vsdx: "vsdx",
        xls: "xls",
        xlsx: "xlsx",
        zip: "zip",
    })
);

exports.preview = JSON.parse(
    JSON.stringify({
        gif: "gif",
        // shouldn't we add jpeg and so on??? we must have exactly same type that filepreview returns but other types are also accepted
        jpg: "jpg",
        png: "png",
        webp: "webp",
    })
);

exports.imageDiv = this.image;

exports.videoDiv = this.video;

exports.audioDiv = this.audio;

exports.textDiv = JSON.parse(JSON.stringify({ txt: "txt" }));

exports.iframeDiv = JSON.parse(
    JSON.stringify({
        cbr: "cbr",
        djvu: "djvu",
        pdf: "pdf",
        doc: "doc",
        docx: "docx",
        pdf: "pdf",
        rtf: "rtf",

        csv: "csv",
        eml: "eml",

        jps: "jps",

        pps: "pps",
        ppt: "ppt",
        pptx: "pptx",

        swf: "swf",
        vsd: "vsd",
        vsdx: "vsdx",
        xls: "xls",
        xlsx: "xlsx",
    })
);
