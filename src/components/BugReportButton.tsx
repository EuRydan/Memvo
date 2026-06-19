'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export function BugReportButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleScreenshot(file: File | null) {
    if (!file) return
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  function handleClose() {
    setOpen(false)
    // reset after animation
    setTimeout(() => {
      setName(''); setEmail(''); setMessage('')
      setScreenshot(null); setScreenshotPreview(null)
      setSent(false); setError(null)
    }, 300)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('email', email.trim())
      fd.append('message', message.trim())
      fd.append('page_url', window.location.href)
      if (screenshot) fd.append('screenshot', screenshot)

      const res = await fetch('/api/bug-report', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar')
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar o relatório.')
    } finally {
      setSubmitting(false)
    }
  }

  const modal = open ? (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-canvas rounded-t-3xl sm:rounded-3xl shadow-2xl border border-hairline overflow-hidden animate-in slide-in-from-bottom-4 sm:fade-in duration-300 transition-colors">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">Beta</span>
            <h2 className="text-base font-bold text-ink">Reportar um Bug</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate hover:bg-ink/5 hover:text-ink transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center gap-4">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
              <svg width="28" height="28" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-ink mb-1">Relatório enviado!</p>
              <p className="text-sm text-slate">Obrigado por nos ajudar a melhorar. Analisaremos em breve.</p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 px-6 py-2.5 bg-ink text-canvas text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
            <p className="text-[13px] text-slate leading-relaxed -mt-1">
              Encontrou algo errado? Nos conte — sua ajuda torna o Memvor melhor para todos.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate uppercase tracking-wide">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-ink bg-canvas-warm border border-hairline focus:outline-none focus:ring-1 focus:ring-ink transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate uppercase tracking-wide">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-ink bg-canvas-warm border border-hairline focus:outline-none focus:ring-1 focus:ring-ink transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate uppercase tracking-wide">Descrição do bug</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Descreva o que aconteceu, o que você esperava e onde ocorreu..."
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm text-ink bg-canvas-warm border border-hairline focus:outline-none focus:ring-1 focus:ring-ink transition-colors resize-none"
              />
            </div>

            {/* Screenshot upload */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate uppercase tracking-wide">
                Print do bug <span className="font-normal normal-case text-stone">(opcional)</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleScreenshot(e.target.files?.[0] ?? null)}
              />
              {screenshotPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-hairline">
                  <img src={screenshotPreview} alt="Preview" className="w-full max-h-36 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setScreenshot(null); setScreenshotPreview(null) }}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-hairline bg-canvas-warm hover:border-ink/30 hover:bg-ink/5 transition-colors text-slate text-sm"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  Adicionar imagem
                </button>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !name.trim() || !email.trim() || !message.trim()}
              className="w-full bg-ink text-canvas py-3.5 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
            >
              {submitting ? 'Enviando...' : 'Enviar Relatório'}
            </button>
          </form>
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[9000] flex items-center gap-2 bg-canvas border border-hairline text-ink text-[12px] font-semibold px-3.5 py-2 rounded-full shadow-elevated hover:shadow-float hover:-translate-y-0.5 active:scale-95 transition-all duration-200 group"
      >
        <span className="text-[9px] font-bold tracking-widest uppercase bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full">Beta</span>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-slate group-hover:text-ink transition-colors">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <span className="hidden sm:inline">Reportar Bug</span>
      </button>

      {/* Portal — renders outside any stacking context */}
      {typeof document !== 'undefined' && modal
        ? createPortal(modal, document.body)
        : null}
    </>
  )
}
