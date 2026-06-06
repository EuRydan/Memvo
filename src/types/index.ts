export type Event = {
  id: string
  created_at: string
  owner_id: string
  name: string
  date: string
  end_date?: string
  slug: string
  active: boolean
}

export type Media = {
  id: string
  created_at: string
  event_id: string
  storage_path: string
  uploader_name: string | null
  type: 'photo' | 'video'
  challenge_id: string | null
}

export type Challenge = {
  id: string
  created_at: string
  event_id: string
  title: string
  order_index: number
}

