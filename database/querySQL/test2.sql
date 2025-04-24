
SELECT *  FROM LibrarySchema.Content

SELECT *  FROM LibrarySchema.Groups

SELECT *
            FROM LibrarySchema.Groups
            WHERE Type = 'comic'
            AND Name = N'SSSSSSSS'

			SELECT *
            FROM LibrarySchema.Groups
            WHERE Name = N'SXC'

SELECT FolderSequence
            FROM LibrarySchema.Content
            WHERE FolderSequence = 
                                    '000100010001'
						
						SELECT *
            FROM LibrarySchema.Content
            WHERE GroupID = 
                                    'GNP2IESBJUOPJ85Q'

									 SELECT ID  
                                FROM LibrarySchema.Groups 
                                WHERE Name =  N'GGGGGGGGGG'
                                AND Type = 'comic'

			SELECT * 
                FROM LibrarySchema.Content 
                WHERE ID = 'GNP2IESBJUOPJ85Q'
                

	SELECT NumberInGroup 
                FROM LibrarySchema.Content 
                WHERE GroupID = (
                            SELECT ID  
                                FROM LibrarySchema.Groups 
                                WHERE Name =  N'GGGGGGGGGG'
                                AND Type = 'comic'
                            )
                AND NumberInGroup = 11
                                    
            

SELECT * FROM LibrarySchema.Authors
SELECT * FROM LibrarySchema.AuthorsAndLinks
SELECT * FROM LibrarySchema.AuthorsAndLinks WHERE Link = 'undefined' AND AuthorID = 'AN7odub6FKF2IqdF'
SELECT * FROM LibrarySchema.ContentAndAuthors

SELECT Name FROM LibrarySchema.Authors WHERE ID = (SELECT AuthorID FROM LibrarySchema.ContentAndAuthors WHERE ContentID = 'AYlUuCDTBMJNRmIt')

SELECT * FROM LibrarySchema.ContentAndAuthors

SELECT ContentID From LibrarySchema.ContentAndAuthors WHERE AuthorID = 'Ab2iiEs5fWOvgWDV'

SELECT * From LibrarySchema.Content WHERE (ID = 'F14nOpfrxc2bDgoI' OR ID = 'F16gmUh1zQJOtyWb') ORDER By Size DESC
SELECT * from librarySchema.Tags
SELECT * From librarySchema.ContentAndTags

