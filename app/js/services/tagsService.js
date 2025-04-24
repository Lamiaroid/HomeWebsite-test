const { prepareStringForSqlQuery } = require("../helpers/commonHelpers.js");
const { sqlRequest } = require("../sql.js");
const { uploadTagChecker, generateCheckedId } = require("../helpers/checker.js");
const constants = require("../constants.js");

exports.getTagInfo = async function (tagOriginalName = "") {
    var orName = "";
    if (tagOriginalName) {
        orName = `WHERE Name = ${prepareStringForSqlQuery(tagOriginalName)}`;
    }

    const data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Tags 
            ${orName}`
    );

    return data.recordset;
};

exports.deleteTag = async function (tagName) {
    await sqlRequest(
        `DELETE 
            FROM LibrarySchema.Tags 
            WHERE Name = ${prepareStringForSqlQuery(tagName)}`
    );

    return constants.library.status.FINE;
};

exports.addNewTag = async function (tagName) {
    const checkResult = await uploadTagChecker(tagName);

    if (checkResult !== constants.library.status.FINE) {
        return checkResult;
    }

    const id = await generateCheckedId(constants.library.id.type.tag, "Tags");

    await sqlRequest(
        `INSERT 
            INTO LibrarySchema.Tags 
                (ID, Name) 
            VALUES 
                ('${id}', ${prepareStringForSqlQuery(tagName)})`
    );

    return constants.library.status.FINE;
};

exports.changeTagInfo = async function (tagName, tagOriginalName) {
    const checkResult = await uploadTagChecker(tagName, tagOriginalName);

    if (checkResult !== constants.library.status.FINE) {
        return checkResult;
    }

    const data = await sqlRequest(
        `SELECT ID 
            FROM LibrarySchema.Tags 
            WHERE Name = ${prepareStringForSqlQuery(tagOriginalName)}`
    );

    if (!data.recordset || !data.recordset.length) {
        return constants.library.status.NOT_FOUND;
    }

    await sqlRequest(
        `UPDATE LibrarySchema.Tags 
            SET Name = ${prepareStringForSqlQuery(tagName)} 
            WHERE Name = ${prepareStringForSqlQuery(tagOriginalName)}`
    );

    return constants.library.status.FINE;
};
