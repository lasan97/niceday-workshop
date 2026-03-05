ALTER TABLE workshop_session ALTER COLUMN team SET DEFAULT '';
ALTER TABLE workshop_session ALTER COLUMN speaker SET DEFAULT '';
ALTER TABLE workshop_session ALTER COLUMN room SET DEFAULT '';
ALTER TABLE workshop_session ALTER COLUMN live_qa SET DEFAULT FALSE;
ALTER TABLE workshop_session ALTER COLUMN pending_questions SET DEFAULT 0;
