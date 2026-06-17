"use client"

import { useState } from "react"
import { Calculator } from "lucide-react"
import { PLAN_PRICES } from "@/lib/prices"

export function EarningsCalculator() {
  const [eventsPerMonth, setEventsPerMonth] = useState(5)
  const [selectedPlan, setSelectedPlan] = useState<'essential' | 'classic' | 'premium'>('classic')

  const plans = {
    essential: { name: 'Essencial', price: PLAN_PRICES.essential },
    classic: { name: 'Clássico', price: PLAN_PRICES.classic },
    premium: { name: 'Premium', price: PLAN_PRICES.premium }
  }

  const baseTicket = plans[selectedPlan].price
  const commissionRate = 0.25 // 25%
  
  const earningsPerEvent = baseTicket * commissionRate
  const monthlyEarnings = eventsPerMonth * earningsPerEvent
  const yearlyEarnings = monthlyEarnings * 12

  return (
    <section className="relative w-full py-24 bg-white z-10 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-[#0a0a0a] rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl">
          {/* Decorative Background */}
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#f4c5a8]/20 to-[#c8b8e0]/20 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left side: Calculator controls */}
            <div>
              <div className="flex items-center gap-3 mb-6 text-[#f4c5a8]">
                <Calculator className="w-6 h-6" />
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase">Simule seus ganhos</span>
              </div>
              
              <h2 style={{ fontFamily: 'var(--font-raleway), Georgia, serif' }}
                className="text-[2rem] md:text-[2.5rem] font-bold tracking-[-0.02em] leading-tight mb-4">
                Quanto você pode faturar?
              </h2>
              
              <p className="text-white/70 text-sm mb-10 leading-relaxed">
                Descubra o potencial de ganhos mensais e anuais indicando o Memvor para seus clientes.
              </p>

              <div className="mb-8">
                <p className="text-sm font-semibold mb-3">Qual plano você costuma indicar?</p>
                <div className="flex bg-white/10 p-1 rounded-xl">
                  {Object.entries(plans).map(([key, plan]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlan(key as 'essential' | 'classic' | 'premium')}
                      className={`flex-1 text-xs md:text-sm font-medium py-2 rounded-lg transition-all ${
                        selectedPlan === key 
                          ? 'bg-white text-[#0a0a0a] shadow-md' 
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {plan.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm font-semibold mb-4">
                  <span>Eventos por mês</span>
                  <span className="text-[#f4c5a8]">{eventsPerMonth} {eventsPerMonth === 1 ? 'evento' : 'eventos'}</span>
                </div>
                
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={eventsPerMonth} 
                  onChange={(e) => setEventsPerMonth(Number(e.target.value))}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#f4c5a8]"
                />
                
                <div className="flex justify-between text-xs text-white/50 mt-2 mb-2">
                  <span>1</span>
                  <span>20+</span>
                </div>
                <p className="text-xs text-white/40 italic text-center">
                  *Alguns parceiros com equipes maiores conseguem mais.
                </p>
              </div>
            </div>

            {/* Right side: Results */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />
              
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Comissão por evento</p>
                <p className="text-2xl font-medium">
                  R$ {earningsPerEvent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Estimativa Mensal</p>
                <p className="text-4xl md:text-5xl font-bold text-[#f4c5a8]">
                  R$ {monthlyEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Projeção Anual</p>
                <p className="text-xl font-medium">
                  R$ {yearlyEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
