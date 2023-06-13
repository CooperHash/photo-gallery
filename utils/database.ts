export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

  export interface Database {
    public: {
      Tables: {
        profiles: {
          Row: {
            avatar_url: string | null
            full_name: string | null
            id: string
            updated_at: string | null
            username: string | null
          }
          Insert: {
            avatar_url?: string | null
            full_name?: string | null
            id: string
            updated_at?: string | null
            username?: string | null
          }
          Update: {
            avatar_url?: string | null
            full_name?: string | null
            id?: string
            updated_at?: string | null
            username?: string | null
          }
        },
        galleries: {
          Row: {
            id: string
            name: string
            category: string
          }
          Insert: {
            id: string
            name: string
            category: string
          }
          Update: {
            id?: string
            name?: string
            category?: string
          }
        },
        user_galleries: {
          Row: {
            user_id: string
            gallery_id: string
          }
          Insert: {
            user_id: string
            gallery_id: string
          }
          Update: {
            user_id?: string
            gallery_id?: string
          }
        },
        images: {
          Row: {
            id: string
            gallery_id: string
            url: string
          }
          Insert: {
            id: string
            gallery_id: string
            url: string
          }
          Update: {
            id?: string
            gallery_id?: string
            url?: string
          }
        }
      }
      Views: {
        [_ in never]: never
      }
      Functions: {
        [_ in never]: never
      }
      Enums: {
        [_ in never]: never
      }
      CompositeTypes: {
        [_ in never]: never
      }
    }
  }
  