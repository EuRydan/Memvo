'use client'

import React, { useState, useEffect } from 'react'

export default function ParceirosDashboard() {
  const [vouchers, setVouchers] = useState<any[]>([
    { id: '1', code: 'me_3542-5193', status: 'available', plan_type: 'classic', created_at: '2026-06-05T10:00:00Z' },
    { id: '2', code: 'me_8291-4402', status: 'redeemed', plan_type: 'classic', created_at: '2026-06-05T10:00:00Z', redeemed_at: '2026-06-06T14:30:00Z' },
    { id: '3', code: 'me_1955-7384', status: 'available', plan_type: 'classic', created_at: '2026-06-05T10:00:00Z' },
  ]) // Mock data for now until Supabase is fully linked

  const availableCount = vouchers.filter(v => v.status === 'available').length
  const redeemedCount = vouchers.filter(v => v.status === 'redeemed').length

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`Código ${code} copiado!`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-2 tracking-tight">Painel do Parceiro</h1>
          <p className="text-[#676f7b]">Gerencie seus lotes de ativação e acompanhe os casamentos.</p>
        </div>
        <button className="bg-[#0a0a0a] text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity">
          Comprar Novo Lote
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">🎟️</div>
            <h3 className="font-semibold text-[#676f7b]">Total Adquirido</h3>
          </div>
          <p className="text-3xl font-bold text-[#0a0a0a]">{vouchers.length}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">✅</div>
            <h3 className="font-semibold text-[#676f7b]">Disponíveis p/ Uso</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{availableCount}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[#676f7b]">🔒</div>
            <h3 className="font-semibold text-[#676f7b]">Já Resgatados</h3>
          </div>
          <p className="text-3xl font-bold text-[#0a0a0a]">{redeemedCount}</p>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0a0a0a]">Seus Vouchers</h2>
          <span className="text-sm font-medium bg-stone-100 text-[#676f7b] px-3 py-1 rounded-full">Lote Clássico</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-[#676f7b] font-semibold border-b border-stone-100">
              <tr>
                <th className="px-6 py-4">Código Único</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Gerado em</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {vouchers.map(v => (
                <tr key={v.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold tracking-widest text-[#0a0a0a] bg-stone-100 px-3 py-1.5 rounded-md">
                      {v.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize text-[#676f7b] font-medium">{v.plan_type}</td>
                  <td className="px-6 py-4">
                    {v.status === 'available' ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Disponível
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-stone-100 text-[#676f7b] px-2.5 py-1 rounded-full text-xs font-semibold border border-stone-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span> Resgatado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#676f7b]">
                    {new Date(v.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {v.status === 'available' ? (
                      <button 
                        onClick={() => handleCopy(v.code)}
                        className="text-sm font-semibold text-[#0a0a0a] underline decoration-stone-300 hover:decoration-[#0a0a0a]"
                      >
                        Copiar
                      </button>
                    ) : (
                      <span className="text-xs text-[#939393]">Usado em {new Date(v.redeemed_at).toLocaleDateString('pt-BR')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
