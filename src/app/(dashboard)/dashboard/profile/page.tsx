'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Save } from 'lucide-react'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      setEmail(user.email || '')
      setName(user.user_metadata?.full_name || user.user_metadata?.name || '')
      setLoading(false)
    }
    
    loadUser()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccess('')
    
    const { error } = await supabase.auth.updateUser({
      data: { name: name, full_name: name }
    })
    
    if (!error) {
      setSuccess('Perfil atualizado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink font-serif">
          Meu Perfil
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie suas informações pessoais.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#f4c5a8] to-[#d4bde8] flex items-center justify-center text-ink text-xl font-bold shadow-sm">
            {name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?')}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{name || 'Anfitrião'}</h2>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">E-mail</label>
            <input 
              type="text" 
              value={email}
              disabled
              className="w-full bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3 rounded-xl text-sm"
            />
            <p className="text-xs text-gray-400 mt-1.5">O e-mail não pode ser alterado por aqui.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Nome de Exibição</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink transition-all"
            />
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-ink text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            {success && <p className="text-sm text-emerald-600 font-medium">{success}</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
