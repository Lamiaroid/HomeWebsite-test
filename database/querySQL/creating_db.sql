CREATE DATABASE LibraryDatabase;
GO

USE LibraryDatabase;
GO

CREATE SCHEMA LibrarySchema;
GO

CREATE TABLE LibrarySchema.Groups (
	ID NVARCHAR(16) NOT NULL PRIMARY KEY,
	Name NVARCHAR(512) NOT NULL,
	AdditionDate DATETIME NOT NULL,
	Type NVARCHAR(50) NOT NULL,
	HasPreview BIT NOT NULL,
	FolderSequence NVARCHAR(12) NOT NULL
);

CREATE TABLE LibrarySchema.Content (
	ID NVARCHAR(16) NOT NULL PRIMARY KEY,
	Name NVARCHAR(512) NOT NULL,
	Extension NVARCHAR(10),
	SuggestedExtension NVARCHAR(10),
	CreationDate DATE,
	AdditionDate DATETIME NOT NULL,
	Type NVARCHAR(50) NOT NULL,
	GroupID NVARCHAR(16) REFERENCES LibrarySchema.Groups(ID),
	NumberInGroup INT,
	Height INT,
	Width INT,
	Duration REAL,
	Size BIGINT NOT NULL,
	HasPreview BIT NOT NULL,
	IsDeleted BIT NOT NULL,
	IsFavourite BIT NOT NULL,
	FolderSequence NVARCHAR(12) NOT NULL,
	OriginalName NVARCHAR(255) NOT NULL,
	LinkToOriginal NVARCHAR(400)
);

CREATE TABLE LibrarySchema.Authors (
	ID NVARCHAR(16) NOT NULL PRIMARY KEY,
	Name NVARCHAR(150) NOT NULL UNIQUE,
	AvatarLink NVARCHAR(400),
	HeaderImageLink NVARCHAR(400)
);

CREATE TABLE LibrarySchema.Tags (
	ID NVARCHAR(16) NOT NULL PRIMARY KEY,
	Name NVARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE LibrarySchema.AuthorsAndLinks (
	AuthorID NVARCHAR(16) REFERENCES LibrarySchema.Authors(ID) NOT NULL,
	Link NVARCHAR(400) NOT NULL
);

CREATE TABLE LibrarySchema.ContentAndAuthors (
	ContentID NVARCHAR(16) REFERENCES LibrarySchema.Content(ID) NOT NULL,
	AuthorID NVARCHAR(16) REFERENCES LibrarySchema.Authors(ID) NOT NULL
);

CREATE TABLE LibrarySchema.ContentAndTags (
	ContentID NVARCHAR(16) REFERENCES LibrarySchema.Content(ID) NOT NULL,
	TagID NVARCHAR(16) REFERENCES LibrarySchema.Tags(ID) NOT NULL
);

ALTER TABLE LibrarySchema.Groups
    ADD CONSTRAINT UQ_Groups UNIQUE (Name, Type)
GO

ALTER TABLE LibrarySchema.AuthorsAndLinks
    ADD CONSTRAINT PK_Authors_Links PRIMARY KEY (AuthorID, Link),
		CONSTRAINT FK_Authors_AuthorsAndLinks FOREIGN KEY (AuthorID) REFERENCES LibrarySchema.Authors(ID)
			ON UPDATE CASCADE
			ON DELETE CASCADE
GO

ALTER TABLE LibrarySchema.ContentAndAuthors
    ADD CONSTRAINT PK_Content_Authors PRIMARY KEY (ContentID, AuthorID),
		CONSTRAINT FK_Content_ContentAndAuthors FOREIGN KEY (ContentID) REFERENCES LibrarySchema.Content(ID)
			ON UPDATE CASCADE
			ON DELETE CASCADE,
		CONSTRAINT FK_Authors_ContentAndAuthors FOREIGN KEY (AuthorID) REFERENCES LibrarySchema.Authors(ID)
			ON UPDATE CASCADE
			ON DELETE CASCADE
GO

ALTER TABLE LibrarySchema.ContentAndTags
    ADD CONSTRAINT PK_Content_Tags PRIMARY KEY (ContentID, TagID),
		CONSTRAINT FK_Content_ContentAndTags FOREIGN KEY (ContentID) REFERENCES LibrarySchema.Content(ID)
			ON UPDATE CASCADE
			ON DELETE CASCADE,
		CONSTRAINT FK_Tags_ContentAndTags FOREIGN KEY (TagID) REFERENCES LibrarySchema.Tags(ID)
			ON UPDATE CASCADE
			ON DELETE CASCADE
GO
