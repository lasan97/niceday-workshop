ALTER TABLE workshop_session ADD COLUMN workshop_team_id VARCHAR(64);
ALTER TABLE workshop_session ADD COLUMN description VARCHAR(400) NOT NULL DEFAULT '';
ALTER TABLE workshop_session ADD COLUMN running_minutes INT NOT NULL DEFAULT 60;
ALTER TABLE workshop_session ADD COLUMN display_order INT NOT NULL DEFAULT 0;

UPDATE workshop_session
SET workshop_team_id = CASE team
    WHEN '알파팀' THEN 'team-alpha'
    WHEN '베타팀' THEN 'team-beta'
    WHEN '감마팀' THEN 'team-gamma'
    ELSE NULL
END,
    description = CONCAT('발표자: ', speaker, ' · 장소: ', room),
    running_minutes = 60,
    display_order = CASE id
        WHEN 'ses-1' THEN 1
        WHEN 'ses-2' THEN 2
        WHEN 'ses-3' THEN 3
        ELSE 100
    END;

ALTER TABLE workshop_session
    ADD CONSTRAINT fk_workshop_session_workshop_team
    FOREIGN KEY (workshop_team_id) REFERENCES workshop_team(id);
