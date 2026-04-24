CREATE TABLE tasks (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description TEXT,
    priority    VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    due_date    DATE,
    status      VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
