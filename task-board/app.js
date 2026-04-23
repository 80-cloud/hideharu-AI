// =============================================
// カスタマイズガイド
// - 列を増やしたい → COLUMNS に追加するだけ
// - 優先度ラベルを変えたい → PRIORITY_LABELS を編集
// - 日付フォーマットを変えたい → formatDate() を編集
// =============================================

// ===== 設定（ここを変えるとアプリ全体に反映される） =====
const COLUMNS = [
  { status: 'todo',  label: 'やること' },
  { status: 'doing', label: '進行中' },
  { status: 'done',  label: '完了' },
];

const PRIORITY_LABELS = {
  high:   '高',
  medium: '中',
  low:    '低',
};

const STORAGE_KEY = 'task_board_data';


// ===== データ管理 =====

// localStorageからタスク一覧を読み込む（なければ空配列）
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// タスク一覧をlocalStorageに保存する
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}


// ===== 日付ユーティリティ =====

// 今日の日付を「2025年4月23日（水）」形式で返す
function formatToday() {
  const d = new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
}

// "2025-04-23" → "4/23" に変換して返す
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
}

// 期限切れかどうかを判定する
function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}


// ===== 画面描画 =====

// ボード全体を再描画する
function renderBoard() {
  const tasks = loadTasks();

  COLUMNS.forEach(({ status }) => {
    const list = document.getElementById(`list-${status}`);
    const count = document.getElementById(`count-${status}`);
    const columnTasks = tasks.filter(t => t.status === status);

    list.innerHTML = '';
    columnTasks.forEach(task => {
      list.appendChild(createCardElement(task));
    });
    count.textContent = columnTasks.length;
  });
}

// 1枚のカードのHTML要素を作って返す
function createCardElement(task) {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('draggable', true);
  card.dataset.id = task.id;
  card.dataset.priority = task.priority;

  // 期限の表示（期限切れなら赤くする）
  let dueHtml = '';
  if (task.dueDate) {
    const overdue = isOverdue(task.dueDate);
    const label = overdue
      ? `⚠ 期限切れ ${formatDate(task.dueDate)}`
      : `期限：${formatDate(task.dueDate)}`;
    dueHtml = `<span class="card-due ${overdue ? 'overdue' : ''}">${label}</span>`;
  }

  card.innerHTML = `
    <div class="card-title">${escapeHtml(task.title)}</div>
    ${task.desc ? `<div class="card-desc">${escapeHtml(task.desc)}</div>` : ''}
    <div class="card-meta">
      <span class="badge-priority ${task.priority}">${PRIORITY_LABELS[task.priority]}</span>
      ${dueHtml}
    </div>
    <div class="card-actions">
      <button class="btn-edit"  data-id="${task.id}">編集</button>
      <button class="btn-delete" data-id="${task.id}">削除</button>
    </div>
  `;

  // ドラッグ開始
  card.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', task.id);
    card.classList.add('dragging');
  });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));

  // 編集ボタン
  card.querySelector('.btn-edit').addEventListener('click', () => openModal(task.status, task.id));

  // 削除ボタン
  card.querySelector('.btn-delete').addEventListener('click', () => {
    if (confirm(`「${task.title}」を削除しますか？`)) {
      deleteTask(task.id);
    }
  });

  return card;
}

// XSS対策：特殊文字をエスケープする
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// ===== タスクのCRUD操作 =====

// タスクを追加する
function addTask(taskData) {
  const tasks = loadTasks();
  tasks.push({
    id: crypto.randomUUID(),  // ユニークなIDを自動生成
    ...taskData,
    createdAt: new Date().toISOString(),
  });
  saveTasks(tasks);
  renderBoard();
}

// タスクを更新する
function updateTask(id, taskData) {
  const tasks = loadTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx] = { ...tasks[idx], ...taskData };
  saveTasks(tasks);
  renderBoard();
}

// タスクを削除する
function deleteTask(id) {
  const tasks = loadTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderBoard();
}


// ===== モーダル（フォーム）制御 =====

let currentStatus = 'todo';  // 追加先の列
let editingId = null;        // 編集中のタスクID（nullなら新規追加）

function openModal(status, taskId = null) {
  currentStatus = status;
  editingId = taskId;

  const heading = document.getElementById('modal-heading');
  const form = document.getElementById('task-form');

  if (taskId) {
    // 編集モード：既存データをフォームに入れる
    const task = loadTasks().find(t => t.id === taskId);
    heading.textContent = 'タスクを編集';
    document.getElementById('input-title').value    = task.title;
    document.getElementById('input-desc').value     = task.desc;
    document.getElementById('input-priority').value = task.priority;
    document.getElementById('input-due').value      = task.dueDate;
  } else {
    // 新規追加モード：フォームをリセット
    heading.textContent = 'タスクを追加';
    form.reset();
  }

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('input-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  editingId = null;
}


// ===== ドラッグ＆ドロップ =====

function setupDragAndDrop() {
  document.querySelectorAll('.card-list').forEach(list => {
    list.addEventListener('dragover', e => {
      e.preventDefault();
      list.classList.add('drag-over');
    });

    list.addEventListener('dragleave', () => {
      list.classList.remove('drag-over');
    });

    list.addEventListener('drop', e => {
      e.preventDefault();
      list.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const newStatus = list.closest('.column').dataset.status;
      updateTask(id, { status: newStatus });
    });
  });
}


// ===== 初期化 =====

function init() {
  // 今日の日付を表示
  document.getElementById('today-date').textContent = formatToday();

  // ボードを描画
  renderBoard();

  // ドラッグ＆ドロップを有効化
  setupDragAndDrop();

  // 「＋ タスクを追加」ボタン
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.status));
  });

  // フォームの保存ボタン
  document.getElementById('task-form').addEventListener('submit', e => {
    e.preventDefault();
    const taskData = {
      title:    document.getElementById('input-title').value.trim(),
      desc:     document.getElementById('input-desc').value.trim(),
      priority: document.getElementById('input-priority').value,
      dueDate:  document.getElementById('input-due').value,
      status:   currentStatus,
    };

    if (editingId) {
      updateTask(editingId, taskData);
    } else {
      addTask(taskData);
    }
    closeModal();
  });

  // キャンセルボタン・背景クリックでモーダルを閉じる
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', init);
