CREATE TABLE workshop_schedule (
    id VARCHAR(64) PRIMARY KEY,
    day_label VARCHAR(32) NOT NULL,
    starts_at VARCHAR(16) NOT NULL,
    ends_at VARCHAR(16) NOT NULL,
    title VARCHAR(120) NOT NULL,
    location VARCHAR(120) NOT NULL
);

CREATE TABLE workshop_mission (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    points INT NOT NULL,
    active BOOLEAN NOT NULL,
    pending_approvals INT NOT NULL
);

CREATE TABLE workshop_session (
    id VARCHAR(64) PRIMARY KEY,
    team VARCHAR(64) NOT NULL,
    title VARCHAR(120) NOT NULL,
    speaker VARCHAR(64) NOT NULL,
    room VARCHAR(64) NOT NULL,
    live_qa BOOLEAN NOT NULL,
    pending_questions INT NOT NULL
);

CREATE TABLE workshop_user (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    team VARCHAR(64) NOT NULL,
    department VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL
);
