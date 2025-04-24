/*INSERT INTO LibrarySchema.Content (ID, SavedName, OriginalName, Extension, CreationDate, AdditionDate, ContentType, ContentTypeOriginalName, Height, Width, Duration, Size, HasPreview, ContentItemNumber) 
                VALUES ('${li6b3t4rm26e}', '${librOriginalName}', '${librDisplayName}', 'later', '2021-12-26', '2021-26-12 14:59:25.023', 'image', 'later', 1, 1, 1, 1, 0, 1)*/

/*UPDATE LibrarySchema.Content
SET OriginalName = '3' WHERE ID = ''*/

/*INSERT INTO LibrarySchema.Authors (ID, OriginalName) 
			VALUES ('${id}', '${authorName}')*/

/*INSERT INTO LibrarySchema.AuthorsAndLinks (AuthorID, Link) 
			VALUES ('${id}', '${author2Name}')*/

/*UPDATE LibrarySchema.Authors SET OriginalName = '${request.body.originalName}' WHERE OriginalName = 'asd'*/

/*INSERT INTO LibrarySchema.Content (ID, Name, TransliteratedName, Extension, CreationDate, AdditionDate, Type, GroupName, GroupTransliteratedName, NumberInGroup, Height, Width, Duration, Size, HasPreview)
                VALUES ('fffff1DsJobOR2', '111111111', '111111111', 'jpg', null, '2021-30-12 25:59:49.283', 'comic', null, null, 1, 1200, 900, null, 475541, 1)*/

/*SELECT * FROM LibrarySchema.Groups

SELECT *
	FROM LibrarySchema.Groups 
		JOIN (
				SELECT COUNT(NumberInGroup) AS TotalNumberInGroup, GroupID
					FROM LibrarySchema.Content 
					WHERE Type = 'comicMini'
					GROUP BY GroupID
			) AS ModifiedGroups 
		ON ModifiedGroups.GroupID = LibrarySchema.Groups.ID
	ORDER BY ModifiedGroups.TotalNumberInGroup DESC

SELECT *
	FROM LibrarySchema.Groups 
		JOIN (
				SELECT SUM(Size) AS TotalSize, GroupID
					FROM LibrarySchema.Content 
					WHERE Type = 'comicMini'
					GROUP BY GroupID
			) AS ModifiedGroups 
		ON ModifiedGroups.GroupID = LibrarySchema.Groups.ID
	ORDER BY ModifiedGroups.TotalSize DESC*/