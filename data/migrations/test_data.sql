CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO datashare.Users (id, Email, Password)
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@admin.com', 'P@$$w0rd');

INSERT INTO datashare.Type (GUID, Icon, Extension, IsAllowed) VALUES 
('11111111-1111-1111-1111-111111111111', 'image_icon', '.jpg', true),
('22222222-2222-2222-2222-222222222222', 'image_icon', '.png', true),
('33333333-3333-3333-3333-333333333333', 'pdf_icon', '.pdf', true),
('44444444-4444-4444-4444-444444444444', 'doc_icon', '.docx', true),
('55555555-5555-5555-5555-555555555555', 'spreadsheet_icon', '.xlsx', true),
('66666666-6666-6666-6666-666666666666', 'archive_icon', '.zip', true),
('77777777-7777-7777-7777-777777777777', 'text_icon', '.txt', true),
('88888888-8888-8888-8888-888888888888', 'video_icon', '.mp4', true);

INSERT INTO datashare.File (id, Base64, URL, Hosting, Expiration_Date, Upload_Date) VALUES 
('f001-0001-0001-0001', 'base64_data_1', 'https://example.com/file1.pdf', 'CloudStorage', '2027-01-01', '2026-06-11'),
('f002-0002-0002-0002', 'base64_data_2', 'https://example.com/image2.png', 'LocalServer', '2027-06-01', '2026-06-11'),
('f003-0003-0003-0003', 'base64_data_3', 'https://example.com/notes3.txt', 'AWS_S3', '2026-12-31', '2026-06-11');

INSERT INTO File_Type (id, Id_File, Id_Type) VALUES 
-- Linking File 1 to PDF (using type guid from previous step)
('link-001', 'f001-0001-0001-0001', '33333333-3333-3333-3333-333333333333'),
-- Linking File 2 to PNG
('link-002', 'f002-0002-0002-0002', '22222222-2222-2222-2222-222222222222'),
-- Linking File 3 to TXT
('link-003', 'f003-0003-0003-0003', '77777777-7777-7777-7777-777777777777');

INSERT INTO File_User (id, Id_File, Id_User) VALUES 
('link-user-001', 'f001-0001-0001-0001', '00000000-0000-0000-0000-000000000000'),
('link-user-002', 'f002-0002-0002-0002', '00000000-0000-0000-0000-000000000000'),
('link-user-003', 'f003-0003-0003-0003', '00000000-0000-0000-0000-000000000000');