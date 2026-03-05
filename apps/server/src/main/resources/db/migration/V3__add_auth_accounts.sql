CREATE TABLE auth_account (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    role VARCHAR(32) NOT NULL
);

INSERT INTO auth_account (id, username, password, role) VALUES
('acc-1', 'admin', 'admin1234', 'ADMIN'),
('acc-2', 'user01', 'user1234', 'PARTICIPANT');
