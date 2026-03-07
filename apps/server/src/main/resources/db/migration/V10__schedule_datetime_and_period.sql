CREATE TABLE workshop_schedule_period (
    id VARCHAR(32) PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

INSERT INTO workshop_schedule_period (id, start_date, end_date)
VALUES ('default', CURRENT_DATE, CURRENT_DATE + 1);

ALTER TABLE workshop_schedule
    ADD COLUMN starts_at_next VARCHAR(32);

ALTER TABLE workshop_schedule
    ADD COLUMN ends_at_next VARCHAR(32);

UPDATE workshop_schedule
SET starts_at_next = (
        CASE
            WHEN day_label = '2일차' THEN (SELECT CAST(start_date + 1 AS VARCHAR) FROM workshop_schedule_period WHERE id = 'default') || 'T'
            WHEN day_label = '3일차' THEN (SELECT CAST(start_date + 2 AS VARCHAR) FROM workshop_schedule_period WHERE id = 'default') || 'T'
            WHEN day_label = '4일차' THEN (SELECT CAST(start_date + 3 AS VARCHAR) FROM workshop_schedule_period WHERE id = 'default') || 'T'
            ELSE (SELECT CAST(start_date AS VARCHAR) FROM workshop_schedule_period WHERE id = 'default') || 'T'
        END
    ) || starts_at,
    ends_at_next = (
        CASE
            WHEN day_label = '2일차' THEN (SELECT CAST(start_date + 1 AS VARCHAR) FROM workshop_schedule_period WHERE id = 'default') || 'T'
            WHEN day_label = '3일차' THEN (SELECT CAST(start_date + 2 AS VARCHAR) FROM workshop_schedule_period WHERE id = 'default') || 'T'
            WHEN day_label = '4일차' THEN (SELECT CAST(start_date + 3 AS VARCHAR) FROM workshop_schedule_period WHERE id = 'default') || 'T'
            ELSE (SELECT CAST(start_date AS VARCHAR) FROM workshop_schedule_period WHERE id = 'default') || 'T'
        END
    ) || ends_at;

ALTER TABLE workshop_schedule
    DROP COLUMN day_label;

ALTER TABLE workshop_schedule
    DROP COLUMN starts_at;

ALTER TABLE workshop_schedule
    DROP COLUMN ends_at;

ALTER TABLE workshop_schedule
    RENAME COLUMN starts_at_next TO starts_at;

ALTER TABLE workshop_schedule
    RENAME COLUMN ends_at_next TO ends_at;

ALTER TABLE workshop_schedule
    ALTER COLUMN starts_at SET NOT NULL;

ALTER TABLE workshop_schedule
    ALTER COLUMN ends_at SET NOT NULL;
