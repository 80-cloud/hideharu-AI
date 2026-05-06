-- タスクの並び順を永続化するためのカラムを追加する
ALTER TABLE tasks
    ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- 既存タスクには id 順で初期並び順を採番する（ステータスごとに 0, 1, 2, ...）
WITH numbered AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY status ORDER BY id) - 1 AS rn
    FROM tasks
)
UPDATE tasks
SET sort_order = numbered.rn
FROM numbered
WHERE tasks.id = numbered.id;

-- ステータス + 並び順での取得を高速化するための複合インデックス
CREATE INDEX IF NOT EXISTS idx_tasks_status_sort_order
    ON tasks (status, sort_order);
