CREATE TABLE workshop_session_question (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    question VARCHAR(600) NOT NULL,
    answer VARCHAR(600),
    created_at BIGINT NOT NULL
);

CREATE INDEX idx_workshop_session_question_session_id ON workshop_session_question(session_id);
