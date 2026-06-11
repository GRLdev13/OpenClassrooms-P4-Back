-- 1. Create Base Tables (Tables without foreign keys)
CREATE TABLE Users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), PRIMARY KEY,
    Email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL
);

CREATE TABLE Tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), PRIMARY KEY,
    Name VARCHAR(255) NOT NULL
);

CREATE TABLE Type (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), PRIMARY KEY,
    Icon VARCHAR(255),
    Extension VARCHAR(255),
    IsAllowed BOOLEAN
);

CREATE TABLE File (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), PRIMARY KEY,
    Base64 TEXT,
    URL VARCHAR(255),
    Hosting VARCHAR(255),
    Expiration_Date TIMESTAMP,
    Upload_Date TIMESTAMP
);

-- 2. Create Junction/Linking Tables (Tables with foreign keys)
CREATE TABLE File_User (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), PRIMARY KEY,
    Id_File VARCHAR(255) NOT NULL,
    Id_User VARCHAR(255) NOT NULL,
    CONSTRAINT fk_file FOREIGN KEY (Id_File) REFERENCES File(GUID),
    CONSTRAINT fk_user FOREIGN KEY (Id_User) REFERENCES Users(GUID)
);

CREATE TABLE File_Tags (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), PRIMARY KEY,
    Id_Tags VARCHAR(255) NOT NULL,
    Id_File VARCHAR(255) NOT NULL,
    CONSTRAINT fk_file FOREIGN KEY (Id_File) REFERENCES File(GUID),
    CONSTRAINT fk_tags FOREIGN KEY (Id_Tags) REFERENCES Tags(GUID)
);

CREATE TABLE File_Type (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), PRIMARY KEY,
    Id_Type VARCHAR(255) NOT NULL,
    Id_File VARCHAR(255) NOT NULL,
    CONSTRAINT fk_type FOREIGN KEY (Id_Type) REFERENCES Type(GUID),
    CONSTRAINT fk_file FOREIGN KEY (Id_File) REFERENCES File(GUID)
);