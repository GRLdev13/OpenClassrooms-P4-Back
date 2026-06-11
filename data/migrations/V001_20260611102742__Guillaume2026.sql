-- If we want to reset:
-- DROP SCHEMA IF EXISTS datashare CASCADE;

-- 1. Create Base Tables
CREATE TABLE datashare.Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL
);

CREATE TABLE datashare.Tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE datashare.Type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Icon VARCHAR(255),
    Extension VARCHAR(255),
    IsAllowed BOOLEAN
);

CREATE TABLE datashare.File (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Base64 TEXT,
    URL VARCHAR(255),
    Hosting VARCHAR(255),
    Expiration_Date TIMESTAMP,
    Upload_Date TIMESTAMP
);

-- 2. Create Junction/Linking Tables
CREATE TABLE datashare.File_User (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Id_File UUID NOT NULL,
    Id_User UUID NOT NULL,
    CONSTRAINT fk_file FOREIGN KEY (Id_File) REFERENCES File(id),
    CONSTRAINT fk_user FOREIGN KEY (Id_User) REFERENCES Users(id)
);

CREATE TABLE datashare.File_Tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Id_Tags UUID NOT NULL,
    Id_File UUID NOT NULL,
    CONSTRAINT fk_file FOREIGN KEY (Id_File) REFERENCES File(id),
    CONSTRAINT fk_tags FOREIGN KEY (Id_Tags) REFERENCES Tags(id)
);

CREATE TABLE datashare.File_Type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    Id_Type UUID NOT NULL,
    Id_File UUID NOT NULL,
    CONSTRAINT fk_type FOREIGN KEY (Id_Type) REFERENCES Type(id),
    CONSTRAINT fk_file FOREIGN KEY (Id_File) REFERENCES File(id)
);