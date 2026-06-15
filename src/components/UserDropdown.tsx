'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Icon } from "@iconify/react"

import { useTranslation } from '@/contexts/I18nContext'
import { useTheme } from 'next-themes'
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface UserDropdownProps {
  email: string
  name: string
  plan?: string
}

export function UserDropdown({ email, name, plan = 'Free' }: UserDropdownProps) {
  const router = useRouter()
  const supabase = createClient()

  // Use global context for i18n and themes
  const { t, locale, setLocale } = useTranslation()
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch on themes/locales
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const initial = name ? name.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?')

  const user = {
    name: name || t('userMenu.defaultUser'),
    username: email,
    initials: initial,
  }

  const MENU_ITEMS = {
    profile: [
      { icon: "solar:settings-line-duotone", label: t('userMenu.settings'), action: () => navigateTo('/dashboard/settings') },
      { icon: "solar:folder-with-files-line-duotone", label: t('userMenu.folders'), action: () => navigateTo('/dashboard/folders') }
    ],
    premium: [
      { 
        icon: "solar:star-bold", 
        label: t('userMenu.getPlan'), 
        action: () => navigateTo('/pricing'),
        iconClass: "text-amber-600 dark:text-amber-500"
      },
      { 
        icon: "solar:card-bold-duotone", 
        label: t('userMenu.billing'), 
        action: () => navigateTo('/dashboard/billing'),
        badge: { text: plan, className: "bg-ink/5 dark:bg-white/10 text-ink dark:text-white text-[11px] font-bold border border-ink/10 dark:border-white/20" }
      }
    ],
    support: [
      { 
        icon: "solar:plus-circle-bold-duotone", 
        label: t('userMenu.createEvent'), 
        action: () => navigateTo('/dashboard/events/new')
      },
      { 
        icon: "solar:question-circle-line-duotone", 
        label: t('userMenu.help'), 
        action: () => navigateTo('/help'),
      }
    ],
    account: [
      { icon: "solar:logout-2-bold-duotone", label: t('userMenu.logout'), action: handleSignOut, danger: true }
    ]
  };

  const renderMenuItem = (item: any, index: number) => (
    <DropdownMenuItem 
      key={index}
      className={cn(item.badge ? "justify-between" : "", "p-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10")}
      onClick={item.action}
    >
      <span className={cn("flex items-center gap-2 font-medium text-[14px]", item.danger ? "text-red-600 dark:text-red-500" : "text-slate dark:text-gray-300")}>
        <Icon
          icon={item.icon}
          className={`size-[18px] ${item.danger ? "text-red-600 dark:text-red-500" : item.iconClass || "text-gray-500 dark:text-gray-400"}`}
        />
        <span className={item.danger ? "" : "text-ink"}>{item.label}</span>
      </span>
      {item.badge && (
        <Badge className={item.badge.className} variant="outline">
          {item.badge.text}
        </Badge>
      )}
    </DropdownMenuItem>
  );

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-canvas to-canvas-warm border border-ink/10 shadow-sm flex items-center justify-center text-ink font-bold animate-pulse">
        {initial}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-10 h-10 rounded-full bg-gradient-to-br from-canvas to-canvas-warm border border-ink/10 shadow-sm flex items-center justify-center text-ink font-bold hover:ring-2 hover:ring-ink/5 transition-all outline-none">
          {initial}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[310px] rounded-2xl bg-canvas dark:bg-canvas-warm p-0 border border-hairline shadow-xl font-sans mr-4" align="end">
        <section className="bg-canvas dark:bg-[#151515] rounded-2xl p-1 shadow-sm border border-transparent">
          <div className="flex items-center p-3 mb-1 bg-black/5 dark:bg-white/5 rounded-xl mx-1 mt-1">
            <div className="flex-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-canvas to-canvas-warm border border-ink/10 shadow-inner flex items-center justify-center text-ink font-bold text-[18px] flex-shrink-0">
                {initial}
              </div>
              <div className="overflow-hidden flex flex-col">
                <h3 className="font-bold text-[15px] text-ink truncate leading-tight">{user.name}</h3>
                <p className="text-slate text-[13px] truncate mt-[2px]">{user.username}</p>
              </div>
            </div>
          </div>

          <div className="px-1 py-1">
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 transition-colors">
                  <span className="flex items-center gap-2 font-medium text-[14px] text-ink">
                    <Icon icon="solar:moon-sleep-line-duotone" className="size-[18px] text-gray-500 dark:text-gray-400" />
                    {t('userMenu.theme')}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-canvas dark:bg-[#1a1a1a] border-hairline shadow-lg rounded-xl p-1 min-w-[140px]">
                    <DropdownMenuRadioGroup value={theme || 'system'} onValueChange={setTheme}>
                      <DropdownMenuRadioItem value="system" className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 rounded-md py-2">
                        <span className="text-ink font-medium text-[13px]">{t('themes.system')}</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="light" className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 rounded-md py-2">
                        <span className="text-ink font-medium text-[13px]">{t('themes.light')}</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark" className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 rounded-md py-2">
                        <span className="text-ink font-medium text-[13px]">{t('themes.dark')}</span>
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 transition-colors mt-0.5">
                  <span className="flex items-center gap-2 font-medium text-[14px] text-ink">
                    <Icon icon="solar:globe-line-duotone" className="size-[18px] text-gray-500 dark:text-gray-400" />
                    {t('userMenu.language')}
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-canvas dark:bg-[#1a1a1a] border-hairline shadow-lg rounded-xl p-1 min-w-[140px]">
                    <DropdownMenuRadioGroup value={locale} onValueChange={(val) => setLocale(val as any)}>
                      <DropdownMenuRadioItem value="pt" className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 rounded-md py-2">
                        <span className="text-ink font-medium text-[13px]">{t('languages.pt')}</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="en" className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 rounded-md py-2">
                        <span className="text-ink font-medium text-[13px]">{t('languages.en')}</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="es" className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 rounded-md py-2">
                        <span className="text-ink font-medium text-[13px]">{t('languages.es')}</span>
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </div>

          <DropdownMenuSeparator className="bg-hairline mx-2" />
          
          <div className="px-1 py-1">
            <DropdownMenuGroup>
              {MENU_ITEMS.profile.map(renderMenuItem)}
            </DropdownMenuGroup>
          </div>

          <DropdownMenuSeparator className="bg-hairline mx-2" />
          
          <div className="px-1 py-1">
            <DropdownMenuGroup>
              {MENU_ITEMS.premium.map(renderMenuItem)}
            </DropdownMenuGroup>
          </div>

          <DropdownMenuSeparator className="bg-hairline mx-2" />
          
          <div className="px-1 py-1">
            <DropdownMenuGroup>
              {MENU_ITEMS.support.map(renderMenuItem)}
            </DropdownMenuGroup>
          </div>
        </section>

        <section className="p-2 border-t border-hairline bg-canvas-warm dark:bg-[#111111] rounded-b-2xl">
          <DropdownMenuGroup>
            {MENU_ITEMS.account.map(renderMenuItem)}
          </DropdownMenuGroup>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
