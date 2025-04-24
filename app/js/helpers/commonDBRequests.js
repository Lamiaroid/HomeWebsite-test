const {
    getFileSavingPath,
    readFileDescription,
    parseFolderSequence,
    prepareStringForSqlQuery,
} = require("./commonHelpers.js");
const { getSetting } = require("../settings.js");
const { sqlRequest } = require("../sql.js");
const constants = require("../constants.js");

// вот здесь должны быть все вызовы бд

async function getALLDATA(requestBodyId) {
    // to separate function
    var data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Content 
            WHERE ID = '${requestBodyId}'`
    );

    if (!data.recordset || !data.recordset.length) {
        return constants.library.status.NOT_FOUND;
    }

    var content = data.recordset[0];

    data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Groups 
            WHERE ID = '${content.GroupID}'`
    );

    var group = null;
    if (data.recordset && data.recordset.length) {
        group = data.recordset[0];
    }

    data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Authors 
            WHERE ID = (
                        SELECT AuthorID 
                            FROM LibrarySchema.ContentAndAuthors 
                            WHERE ContentID = '${content.ID}'
                        )`
    );
    var author = data.recordset[0];

    var data2 = await sqlRequest(
        `SELECT TagID 
            FROM LibrarySchema.ContentAndTags 
            WHERE ContentID = '${content.ID}'`
    );

    // can happen recordset is empty
    var contentIDS = data2.recordset;

    var queryOr = "";
    if (contentIDS[0]) {
        queryOr = `ID = '${contentIDS[0].TagID}' `;
    }
    for (var x = 1; contentIDS[x]; x++) {
        queryOr += `OR ID = '${contentIDS[x].TagID}' `;
    }

    var tags = [];
    if (queryOr) {
        data = await sqlRequest(
            `SELECT * 
                FROM LibrarySchema.Tags 
                WHERE (${queryOr}) 
                ORDER BY Name`
        );
        tags = data.recordset;
    }

    var newDirName = "";
    var numberInGroupForAddition = "";
    if (group) {
        newDirName = parseFolderSequence(group.FolderSequence) + `/${group.ID}`;
        numberInGroupForAddition = content.NumberInGroup;
    }

    var descr = await readFileDescription(
        getFileSavingPath(
            content.ID,
            constants.library.description.extension,
            content.Type,
            parseFolderSequence(content.FolderSequence),
            constants.library.content.extraInfo.description,
            newDirName,
            numberInGroupForAddition
        )
    );

    return { content, group, author, tags, descr };
}

async function getMaxNumberInGroupForCertainGroup(groupID) {
    // to separate function
    const data = await sqlRequest(
        `SELECT TOP 1 NumberInGroup
            FROM LibrarySchema.Content 
            WHERE GroupID = '${groupID}'
            ORDER BY NumberInGroup DESC`
    );

    return data.recordset[0].NumberInGroup;
}

async function getTotalNumberInGroup(groupID) {
    // to separate function
    const data = await sqlRequest(
        `SELECT COUNT(NumberInGroup)
            AS TotalNumber 
            FROM LibrarySchema.Content 
            WHERE GroupID = '${groupID}'`
    );

    return data.recordset[0].TotalNumber;
}

async function getGroupType(groupID) {
    // to separate function
    const data = await sqlRequest(
        `SELECT Type
            FROM LibrarySchema.Groups 
            WHERE ID = '${groupID}'`
    );

    return data.recordset[0].Type;
}

async function getTotalContentCount(contentType) {
    // to separate function
    var data = await sqlRequest(
        `SELECT COUNT(ID) 
            AS TotalCount 
            FROM LibrarySchema.Content 
            WHERE Type = '${contentType}'`
    );

    return data.recordset[0].TotalCount;
}

async function getTotalGroupCount(groupType) {
    // to separate function
    var data = await sqlRequest(
        `SELECT COUNT(ID) 
            AS TotalCount 
            FROM LibrarySchema.Groups 
            WHERE Type = '${groupType}'`
    );

    return data.recordset[0].TotalCount;
}

async function getAllContentData(extraObject, contentType, groupname) {
    if (groupname) {
        groupname = `AND GroupID = ${prepareStringForSqlQuery(groupname)}`;
    }

    if (contentType) {
        contentType = `AND Type = '${contentType}'`;
    }

    console.log("debug ", extraObject, contentType, groupname);
    // нужно придумать что-то для групп, потому что у них немного другие данные

    // такого быть не должно, всё должно передаваться в параметрах, нужно вообще всё пересмотреть и поразмещать по разным файлам, работа с бд в одном файле должна быть, вспомогательные функции в другом, работа с контетом в третьем и т.д.
    var orderBy = getSetting("sortPostsBy");
    var orderDirection = getSetting("sortPostsOrder");

    // order by addition date from new to old in order if first state has same results (etc image_nameX and image_nameX)
    // везде использует этот принцип по дате он нового к старому
    var orderByIfThereAreTwoEquals = "";
    if (orderBy !== "AdditionDate") {
        orderByIfThereAreTwoEquals = ", AdditionDate DESC";
    }

    if (extraObject) {
        if (extraObject.type === "favourite") {
            const data = await sqlRequest(
                `SELECT * 
                    FROM LibrarySchema.Content 
                    WHERE IsFavourite = 1 
                    ${contentType} 
                    ${groupname} 
                    ORDER BY ${orderBy} ${orderDirection}${orderByIfThereAreTwoEquals}`
            );

            return data.recordset;
        } else if (extraObject.type === "deleted") {
            const data = await sqlRequest(
                `SELECT * 
                    FROM LibrarySchema.Content 
                    WHERE IsDeleted = 1 
                    ${contentType} 
                    ${groupname} 
                    ORDER BY ${orderBy} ${orderDirection}${orderByIfThereAreTwoEquals}`
            );

            return data.recordset;
        } else {
            var table = "";
            var where = "";
            switch (extraObject.type) {
                case "author":
                    where = "AuthorID";
                    table = "Authors";
                    break;

                case "tag":
                    where = "TagID";
                    table = "Tags";
                    break;
            }

            const testCheck = await sqlRequest(
                `SELECT * 
                    FROM LibrarySchema.${table} 
                    WHERE ID = '${extraObject.value}'`
            );

            if (!testCheck.recordset || !testCheck.recordset.length) {
                return constants.library.status.NOT_FOUND;
            }

            const ids = await sqlRequest(
                `SELECT ContentID 
                    FROM LibrarySchema.ContentAnd${table} 
                    WHERE ${where} = '${extraObject.value}'`
            );

            var allIds = ids.recordset;
            if (allIds && allIds.length) {
                var whereStatement = `ID = '${allIds[0].ContentID}' `;
                for (var i = 1; allIds[i]; i++) {
                    whereStatement += `OR ID = '${allIds[i].ContentID}' `;
                }

                const data = await sqlRequest(
                    `SELECT * 
                        FROM LibrarySchema.Content 
                        WHERE (${whereStatement}) 
                        AND IsDeleted = 0 
                        ${contentType} 
                        ${groupname} 
                        ORDER BY ${orderBy} ${orderDirection}${orderByIfThereAreTwoEquals}`
                );

                return data.recordset;
            } else {
                return [];
            }
        }
    } else {
        const data = await sqlRequest(
            `SELECT * 
                FROM LibrarySchema.Content 
                WHERE IsDeleted = 0 
                ${contentType} 
                ${groupname} 
                ORDER BY ${orderBy} ${orderDirection}${orderByIfThereAreTwoEquals}`
        );

        return data.recordset;
    }
}

async function getCertainGroupInfo(groupId) {
    const data = await sqlRequest(
        `SELECT * 
            FROM LibrarySchema.Groups 
            WHERE ID = '${groupId}'`
    );

    return data.recordset[0];
}

async function getGroupnames(extraObject, contentType, allFilenames) {
    var orderBy = getSetting("sortGroupsBy");
    var orderDirection = getSetting("sortGroupsOrder");

    var orderByIfThereAreTwoEquals = "";
    if (orderBy !== "AdditionDate") {
        orderByIfThereAreTwoEquals = ", AdditionDate DESC";
    }

    if (extraObject) {
        var whereContentId = `WHERE ID = '${allFilenames[0].ID}'`;
        for (var i = 1; allFilenames[i]; i++) {
            whereContentId += ` OR ID = '${allFilenames[i].ID}'`;
        }

        var data2;
        switch (orderBy) {
            case "TotalNumberInGroup":
                data2 = await sqlRequest(
                    `SELECT *
                        FROM LibrarySchema.Groups 
                            JOIN (
                                    SELECT COUNT(NumberInGroup) AS TotalNumberInGroup, GroupID
                                        FROM LibrarySchema.Content 
                                        ${whereContentId} 
                                        GROUP BY GroupID
                                ) AS ModifiedGroups 
                            ON ModifiedGroups.GroupID = LibrarySchema.Groups.ID
                        ORDER BY ModifiedGroups.TotalNumberInGroup ${orderDirection}`
                );
                break;

            case "TotalSize":
                data2 = await sqlRequest(
                    `SELECT *
                        FROM LibrarySchema.Groups 
                            JOIN (
                                    SELECT SUM(Size) AS TotalSize, GroupID
                                        FROM LibrarySchema.Content 
                                        ${whereContentId} 
                                        GROUP BY GroupID
                                ) AS ModifiedGroups 
                            ON ModifiedGroups.GroupID = LibrarySchema.Groups.ID
                        ORDER BY ModifiedGroups.TotalSize ${orderDirection}`
                );
                break;

            default:
                var data = await sqlRequest(
                    `SELECT DISTINCT GroupID 
                        FROM LibrarySchema.Content 
                        ${whereContentId}`
                );

                var whereGroupId = `WHERE ID = '${data.recordset[0].GroupID}'`;
                for (var i = 1; i < data.recordset.length; i++) {
                    whereGroupId += ` OR ID = '${data.recordset[i].GroupID}'`;
                }

                data2 = await sqlRequest(
                    `SELECT * 
                        FROM LibrarySchema.Groups 
                        ${whereGroupId} 
                        ORDER BY ${orderBy} ${orderDirection}${orderByIfThereAreTwoEquals}`
                );
                break;
        }

        return data2.recordset;
    } else {
        var data;
        switch (orderBy) {
            case "TotalNumberInGroup":
                data = await sqlRequest(
                    `SELECT *
                        FROM LibrarySchema.Groups 
                            JOIN (
                                    SELECT COUNT(NumberInGroup) AS TotalNumberInGroup, GroupID
                                        FROM LibrarySchema.Content 
                                        WHERE Type = '${contentType}'
                                        GROUP BY GroupID
                                ) AS ModifiedGroups 
                            ON ModifiedGroups.GroupID = LibrarySchema.Groups.ID
                        ORDER BY ModifiedGroups.TotalNumberInGroup ${orderDirection}`
                );
                break;

            case "TotalSize":
                data = await sqlRequest(
                    `SELECT *
                        FROM LibrarySchema.Groups 
                            JOIN (
                                    SELECT COUNT(NumberInGroup) AS TotalSize, GroupID
                                        FROM LibrarySchema.Content 
                                        WHERE Type = '${contentType}'
                                        GROUP BY GroupID
                                ) AS ModifiedGroups 
                            ON ModifiedGroups.GroupID = LibrarySchema.Groups.ID
                        ORDER BY ModifiedGroups.TotalSize ${orderDirection}`
                );
                break;

            default:
                data = await sqlRequest(
                    `SELECT *
                        FROM LibrarySchema.Groups 
                        WHERE Type = '${contentType}'
                        ORDER BY ${orderBy} ${orderDirection}${orderByIfThereAreTwoEquals}`
                );
                break;
        }

        return data.recordset;
    }
}

module.exports = {
    getMaxNumberInGroupForCertainGroup,
    getALLDATA,
    getGroupType,
    getTotalNumberInGroup,
    getTotalContentCount,
    getTotalGroupCount,
    getAllContentData,
    getGroupnames,
    getCertainGroupInfo,
};
