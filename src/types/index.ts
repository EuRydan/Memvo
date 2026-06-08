export type Event = {
  id: string
  created_at: string
  owner_id: string
  name: string
  date: string
  end_date?: string
  cover_url?: string
  slug: string
  active: boolean
  event_type?: string
  time?: string
  location?: string
  additional_info?: string
}

export type Media = {
  id: string
  created_at: string
  event_id: string
  storage_path: string
  uploader_name: string | null
  type: 'photo' | 'video'
  challenge_id: string | null
  guest_id?: string
}

export type Challenge = {
  id: string
  created_at: string
  event_id: string
  title: string
  order_index: number
}

