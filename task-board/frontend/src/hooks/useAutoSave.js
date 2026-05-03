import { useState, useEffect, useRef } from 'react'

const DRAFT_KEY = 'taskboard_draft'

export function useAutoSave(form, isEdit, taskId, saveFn, delay = 1500) {
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const timerRef = useRef(null)
  const isFirstRender = useRef(true)

  // localStorageに下書き保存
  function saveDraft(data) {
    try {
      const key = isEdit ? `${DRAFT_KEY}_${taskId}` : `${DRAFT_KEY}_new`
      localStorage.setItem(key, JSON.stringify(data))
    } catch {
      // localStorage が使えない環境では無視
    }
  }

  // 下書きを削除（保存成功後）
  function clearDraft() {
    try {
      const key = isEdit ? `${DRAFT_KEY}_${taskId}` : `${DRAFT_KEY}_new`
      localStorage.removeItem(key)
    } catch {}
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!form.title.trim()) return

    // 常にlocalStorageに下書き保存（ネットワーク失敗時のバックアップ）
    saveDraft(form)
    setSaveStatus('idle')

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await saveFn(form)
        setSaveStatus('saved')
        clearDraft()
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
      }
    }, delay)

    return () => clearTimeout(timerRef.current)
  }, [form])  // eslint-disable-line react-hooks/exhaustive-deps

  // 下書き読み込み
  function loadDraft() {
    try {
      const key = isEdit ? `${DRAFT_KEY}_${taskId}` : `${DRAFT_KEY}_new`
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  return { saveStatus, loadDraft, clearDraft }
}
