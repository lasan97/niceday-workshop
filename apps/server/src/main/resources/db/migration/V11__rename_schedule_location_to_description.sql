ALTER TABLE workshop_schedule
    RENAME COLUMN location TO description;

ALTER TABLE workshop_schedule
    ALTER COLUMN description SET DATA TYPE VARCHAR(400);
