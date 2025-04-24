const { prepareStringForSqlQuery } = require("../helpers/commonHelpers.js");
const { uploadAuthorChecker, generateCheckedId } = require("../helpers/checker.js");
const { sqlRequest } = require("../sql.js");
const constants = require("../constants.js");

exports.getAuthorInfo = async function (needLinks, authorName = "") {
    var sqlQuery = "";
    if (authorName) {
        sqlQuery = `WHERE Name = ${prepareStringForSqlQuery(authorName)}`;
    }

    var data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Authors 
            ${sqlQuery} 
            ORDER BY Name ASC`
    );
    // после каждого  селекта же должны быть проверки, верно?

    var authors = data.recordset;
    if (needLinks) {
        var links = [];
        var authorLinks;
        for (var i = 0; i < authors.length; i++) {
            data = await sqlRequest(
                `SELECT Link 
                    FROM LibrarySchema.AuthorsAndLinks 
                    WHERE AuthorID = '${authors[i].ID}'`
            );

            authorLinks = data.recordset;

            var authorLinksSet = [];
            for (var j = 0; j < authorLinks.length; j++) {
                authorLinksSet.push(authorLinks[j].Link);
            }

            links.push(authorLinksSet);
        }

        return { authors, links };
    }

    return authors;
};

exports.deleteAuthor = async function (authorName) {
    await sqlRequest(
        `DELETE 
            FROM LibrarySchema.Authors 
            WHERE Name = ${prepareStringForSqlQuery(authorName)}`
    );

    return constants.library.status.FINE;
};

exports.addNewAuthor = async function (authorName, links, avatarLink, headerImageLink) {
    const checkResult = await uploadAuthorChecker(authorName, links);

    if (checkResult !== constants.library.status.FINE) {
        return checkResult;
    }

    const id = await generateCheckedId(constants.library.id.type.author, "Authors");

    await sqlRequest(
        `INSERT 
            INTO LibrarySchema.Authors 
                (ID, Name, AvatarLink, HeaderImageLink) 
            VALUES 
                ('${id}', ${prepareStringForSqlQuery(authorName)}, 
                ${prepareStringForSqlQuery(avatarLink)}, 
                ${prepareStringForSqlQuery(headerImageLink)})`
    );

    links = removeDuplicates(links);

    for (var i = 0; i < links.length; i++) {
        if (links[i]) {
            await sqlRequest(
                `INSERT 
                    INTO LibrarySchema.AuthorsAndLinks 
                        (AuthorID, Link) 
                    VALUES 
                        ('${id}', ${prepareStringForSqlQuery(links[i])})`
            );
        }
    }

    return constants.library.status.FINE;
};

exports.changeAuthorInfo = async function (
    authorName,
    authorOriginalName,
    links,
    originalLinks,
    avatarLink,
    headerImageLink
) {
    const checkResult = await uploadAuthorChecker(authorName, links, authorOriginalName);
    if (checkResult !== constants.library.status.FINE) {
        return checkResult;
    }

    const data = await sqlRequest(
        `SELECT ID 
            FROM LibrarySchema.Authors 
            WHERE Name = ${prepareStringForSqlQuery(authorOriginalName)}`
    );

    if (!data.recordset || !data.recordset.length) {
        return constants.library.status.NOT_FOUND;
    }

    const authorID = data.recordset[0].ID;

    await sqlRequest(
        `UPDATE LibrarySchema.Authors 
            SET Name = ${prepareStringForSqlQuery(authorName)}, 
                AvatarLink = ${prepareStringForSqlQuery(avatarLink)}, 
                headerImageLink = ${prepareStringForSqlQuery(headerImageLink)}
            WHERE Name = ${prepareStringForSqlQuery(authorOriginalName)}`
    );

    links = removeDuplicates(links);

    var i = 0;
    var sqlQuery;
    while (i < originalLinks.length) {
        if (links[i]) {
            sqlQuery = `UPDATE LibrarySchema.AuthorsAndLinks 
                            SET Link = ${prepareStringForSqlQuery(links[i])} 
                            WHERE Link = ${prepareStringForSqlQuery(originalLinks[i])} 
                            AND AuthorID = '${authorID}'`;
        } else {
            sqlQuery = `DELETE 
                            FROM LibrarySchema.AuthorsAndLinks 
                            WHERE Link = ${prepareStringForSqlQuery(originalLinks[i])} 
                            AND AuthorID = '${authorID}'`;
        }

        await sqlRequest(sqlQuery);

        i++;
    }

    while (i < links.length) {
        if (links[i]) {
            await sqlRequest(
                `INSERT 
                    INTO LibrarySchema.AuthorsAndLinks 
                        (AuthorID, Link) 
                    VALUES 
                        ('${authorID}', ${prepareStringForSqlQuery(links[i])})`
            );
        }
        i++;
    }

    return constants.library.status.FINE;
};

function removeDuplicates(arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var j = i + 1; j < arr.length; j++) {
            if (arr[i] && arr[j] && arr[i] === arr[j]) {
                arr[j] = "";
            }
        }
    }

    return arr;
}
