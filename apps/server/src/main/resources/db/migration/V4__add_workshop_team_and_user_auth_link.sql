CREATE TABLE workshop_team (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE
);

INSERT INTO workshop_team (id, name) VALUES
('team-alpha', '알파팀'),
('team-beta', '베타팀'),
('team-gamma', '감마팀');

ALTER TABLE workshop_user ADD COLUMN username VARCHAR(64);
ALTER TABLE workshop_user ADD COLUMN workshop_team_id VARCHAR(64);

UPDATE workshop_user
SET username = CASE id
    WHEN 'usr-1' THEN 'user01'
    WHEN 'usr-2' THEN 'user02'
    WHEN 'usr-3' THEN 'user03'
    WHEN 'usr-4' THEN 'admin'
    ELSE id
END;

UPDATE workshop_user
SET workshop_team_id = CASE team
    WHEN '알파팀' THEN 'team-alpha'
    WHEN '베타팀' THEN 'team-beta'
    WHEN '감마팀' THEN 'team-gamma'
    ELSE NULL
END;

ALTER TABLE workshop_user ALTER COLUMN username SET NOT NULL;
ALTER TABLE workshop_user ADD CONSTRAINT uq_workshop_user_username UNIQUE (username);
ALTER TABLE workshop_user
    ADD CONSTRAINT fk_workshop_user_workshop_team
    FOREIGN KEY (workshop_team_id) REFERENCES workshop_team(id);

ALTER TABLE auth_account ADD COLUMN user_id VARCHAR(64);
ALTER TABLE auth_account ADD CONSTRAINT uq_auth_account_user_id UNIQUE (user_id);

UPDATE auth_account a
SET user_id = u.id
FROM workshop_user u
WHERE a.username = u.username;

INSERT INTO auth_account (id, username, password, role, user_id)
SELECT 'acc-u-' || replace(u.id, 'usr-', ''), u.username, '1111', u.role, u.id
FROM workshop_user u
LEFT JOIN auth_account a ON a.user_id = u.id
WHERE a.id IS NULL;
