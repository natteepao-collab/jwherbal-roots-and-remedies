export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      about_mission_items: {
        Row: {
          created_at: string
          description_en: string
          description_th: string
          description_zh: string
          id: string
          is_active: boolean
          sort_order: number
          title_en: string
          title_th: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_th: string
          description_zh?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title_en?: string
          title_th: string
          title_zh?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      about_settings: {
        Row: {
          achievement_customers: string
          achievement_customers_label_en: string
          achievement_customers_label_th: string
          achievement_customers_label_zh: string
          achievement_products: string
          achievement_products_label_en: string
          achievement_products_label_th: string
          achievement_products_label_zh: string
          achievement_satisfaction: string
          achievement_satisfaction_label_en: string
          achievement_satisfaction_label_th: string
          achievement_satisfaction_label_zh: string
          achievement_years: string
          achievement_years_label_en: string
          achievement_years_label_th: string
          achievement_years_label_zh: string
          id: string
          story_paragraph1_en: string
          story_paragraph1_th: string
          story_paragraph1_zh: string
          story_paragraph2_en: string
          story_paragraph2_th: string
          story_paragraph2_zh: string
          story_paragraph3_en: string
          story_paragraph3_th: string
          story_paragraph3_zh: string
          story_title_en: string
          story_title_th: string
          story_title_zh: string
          updated_at: string
          vision_image_url: string | null
          vision_quote_en: string
          vision_quote_th: string
          vision_quote_zh: string
          vision_subtitle_en: string
          vision_subtitle_th: string
          vision_subtitle_zh: string
          vision_title_en: string
          vision_title_th: string
          vision_title_zh: string
        }
        Insert: {
          achievement_customers?: string
          achievement_customers_label_en?: string
          achievement_customers_label_th?: string
          achievement_customers_label_zh?: string
          achievement_products?: string
          achievement_products_label_en?: string
          achievement_products_label_th?: string
          achievement_products_label_zh?: string
          achievement_satisfaction?: string
          achievement_satisfaction_label_en?: string
          achievement_satisfaction_label_th?: string
          achievement_satisfaction_label_zh?: string
          achievement_years?: string
          achievement_years_label_en?: string
          achievement_years_label_th?: string
          achievement_years_label_zh?: string
          id?: string
          story_paragraph1_en?: string
          story_paragraph1_th?: string
          story_paragraph1_zh?: string
          story_paragraph2_en?: string
          story_paragraph2_th?: string
          story_paragraph2_zh?: string
          story_paragraph3_en?: string
          story_paragraph3_th?: string
          story_paragraph3_zh?: string
          story_title_en?: string
          story_title_th?: string
          story_title_zh?: string
          updated_at?: string
          vision_image_url?: string | null
          vision_quote_en?: string
          vision_quote_th?: string
          vision_quote_zh?: string
          vision_subtitle_en?: string
          vision_subtitle_th?: string
          vision_subtitle_zh?: string
          vision_title_en?: string
          vision_title_th?: string
          vision_title_zh?: string
        }
        Update: {
          achievement_customers?: string
          achievement_customers_label_en?: string
          achievement_customers_label_th?: string
          achievement_customers_label_zh?: string
          achievement_products?: string
          achievement_products_label_en?: string
          achievement_products_label_th?: string
          achievement_products_label_zh?: string
          achievement_satisfaction?: string
          achievement_satisfaction_label_en?: string
          achievement_satisfaction_label_th?: string
          achievement_satisfaction_label_zh?: string
          achievement_years?: string
          achievement_years_label_en?: string
          achievement_years_label_th?: string
          achievement_years_label_zh?: string
          id?: string
          story_paragraph1_en?: string
          story_paragraph1_th?: string
          story_paragraph1_zh?: string
          story_paragraph2_en?: string
          story_paragraph2_th?: string
          story_paragraph2_zh?: string
          story_paragraph3_en?: string
          story_paragraph3_th?: string
          story_paragraph3_zh?: string
          story_title_en?: string
          story_title_th?: string
          story_title_zh?: string
          updated_at?: string
          vision_image_url?: string | null
          vision_quote_en?: string
          vision_quote_th?: string
          vision_quote_zh?: string
          vision_subtitle_en?: string
          vision_subtitle_th?: string
          vision_subtitle_zh?: string
          vision_title_en?: string
          vision_title_th?: string
          vision_title_zh?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string
          category: string
          content_en: string
          content_th: string
          content_zh: string
          created_at: string | null
          excerpt_en: string
          excerpt_th: string
          excerpt_zh: string
          id: string
          image_url: string
          likes: number | null
          published_date: string | null
          slug: string
          title_en: string
          title_th: string
          title_zh: string
          updated_at: string | null
        }
        Insert: {
          author: string
          category: string
          content_en: string
          content_th: string
          content_zh: string
          created_at?: string | null
          excerpt_en: string
          excerpt_th: string
          excerpt_zh: string
          id?: string
          image_url: string
          likes?: number | null
          published_date?: string | null
          slug: string
          title_en: string
          title_th: string
          title_zh: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          category?: string
          content_en?: string
          content_th?: string
          content_zh?: string
          created_at?: string | null
          excerpt_en?: string
          excerpt_th?: string
          excerpt_zh?: string
          id?: string
          image_url?: string
          likes?: number | null
          published_date?: string | null
          slug?: string
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_story: {
        Row: {
          description_en: string
          description_th: string
          description_zh: string
          id: string
          image_url: string | null
          title_en: string
          title_th: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          image_url?: string | null
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string
        }
        Update: {
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          image_url?: string | null
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      brand_story_gallery: {
        Row: {
          created_at: string
          description_en: string
          description_th: string
          description_zh: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          title_en: string
          title_th: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_avatar: string
          author_name: string
          category: string
          comments_count: number | null
          content_en: string
          content_th: string
          content_zh: string
          created_at: string | null
          id: string
          preview_en: string
          preview_th: string
          preview_zh: string
          thumbnail: string
          title_en: string
          title_th: string
          title_zh: string
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          author_avatar: string
          author_name: string
          category: string
          comments_count?: number | null
          content_en: string
          content_th: string
          content_zh: string
          created_at?: string | null
          id?: string
          preview_en: string
          preview_th: string
          preview_zh: string
          thumbnail: string
          title_en: string
          title_th: string
          title_zh: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          author_avatar?: string
          author_name?: string
          category?: string
          comments_count?: number | null
          content_en?: string
          content_th?: string
          content_zh?: string
          created_at?: string | null
          id?: string
          preview_en?: string
          preview_th?: string
          preview_zh?: string
          thumbnail?: string
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: []
      }
      community_replies: {
        Row: {
          author_avatar: string
          author_name: string
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          author_avatar: string
          author_name: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          author_avatar?: string
          author_name?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_settings: {
        Row: {
          address: string
          email: string
          facebook_url: string
          id: string
          instagram_url: string
          line_id: string
          line_url: string
          phone: string
          phone_hours: string
          updated_at: string
          weekday_hours: string
          weekend_hours: string
        }
        Insert: {
          address?: string
          email?: string
          facebook_url?: string
          id?: string
          instagram_url?: string
          line_id?: string
          line_url?: string
          phone?: string
          phone_hours?: string
          updated_at?: string
          weekday_hours?: string
          weekend_hours?: string
        }
        Update: {
          address?: string
          email?: string
          facebook_url?: string
          id?: string
          instagram_url?: string
          line_id?: string
          line_url?: string
          phone?: string
          phone_hours?: string
          updated_at?: string
          weekday_hours?: string
          weekend_hours?: string
        }
        Relationships: []
      }
      faq_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          sort_order: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer_en: string
          answer_th: string
          answer_zh: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          question_en: string
          question_th: string
          question_zh: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer_en?: string
          answer_th: string
          answer_zh?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question_en?: string
          question_th: string
          question_zh?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer_en?: string
          answer_th?: string
          answer_zh?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question_en?: string
          question_th?: string
          question_zh?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          payment_method: string
          payment_status: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          payment_method?: string
          payment_status?: string
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          payment_method?: string
          payment_status?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          bank_account_name: string
          bank_account_number: string
          bank_name: string
          id: string
          is_bank_transfer_enabled: boolean
          is_promptpay_enabled: boolean
          promptpay_name: string
          promptpay_number: string
          updated_at: string
        }
        Insert: {
          bank_account_name?: string
          bank_account_number?: string
          bank_name?: string
          id?: string
          is_bank_transfer_enabled?: boolean
          is_promptpay_enabled?: boolean
          promptpay_name?: string
          promptpay_number?: string
          updated_at?: string
        }
        Update: {
          bank_account_name?: string
          bank_account_number?: string
          bank_name?: string
          id?: string
          is_bank_transfer_enabled?: boolean
          is_promptpay_enabled?: boolean
          promptpay_name?: string
          promptpay_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description_en: string
          description_th: string
          description_zh: string
          id: string
          image_url: string
          is_active: boolean | null
          name_en: string
          name_th: string
          name_zh: string
          price: number
          rating: number | null
          stock: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description_en: string
          description_th: string
          description_zh: string
          id?: string
          image_url: string
          is_active?: boolean | null
          name_en: string
          name_th: string
          name_zh: string
          price: number
          rating?: number | null
          stock?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          name_en?: string
          name_th?: string
          name_zh?: string
          price?: number
          rating?: number | null
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      review_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          sort_order: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      review_likes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_likes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          admin_reply: string | null
          admin_reply_at: string | null
          admin_reply_by: string | null
          author_avatar: string | null
          author_name: string
          comment: string
          created_at: string
          id: string
          is_approved: boolean | null
          likes_count: number | null
          product_id: string | null
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          admin_reply_at?: string | null
          admin_reply_by?: string | null
          author_avatar?: string | null
          author_name: string
          comment: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          likes_count?: number | null
          product_id?: string | null
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          admin_reply_at?: string | null
          admin_reply_by?: string | null
          author_avatar?: string | null
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          likes_count?: number | null
          product_id?: string | null
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          site_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          site_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          site_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trust_certifications: {
        Row: {
          created_at: string
          description_en: string
          description_th: string
          description_zh: string
          icon: string
          id: string
          is_active: boolean
          sort_order: number
          title_en: string
          title_th: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en: string
          description_th: string
          description_zh: string
          icon?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title_en: string
          title_th: string
          title_zh: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_th?: string
          description_zh?: string
          icon?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      trust_expert: {
        Row: {
          description_en: string
          description_th: string
          description_zh: string
          id: string
          image_url: string | null
          title_en: string
          title_th: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          image_url?: string | null
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string
        }
        Update: {
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          image_url?: string | null
          title_en?: string
          title_th?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      trust_ingredients: {
        Row: {
          created_at: string
          description_en: string
          description_th: string
          description_zh: string
          id: string
          is_active: boolean
          name_en: string
          name_th: string
          name_zh: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en: string
          description_th: string
          description_zh: string
          id?: string
          is_active?: boolean
          name_en: string
          name_th: string
          name_zh: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_th?: string
          description_zh?: string
          id?: string
          is_active?: boolean
          name_en?: string
          name_th?: string
          name_zh?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      trust_section_settings: {
        Row: {
          id: string
          ingredients_image_url: string | null
          ingredients_title_en: string
          ingredients_title_th: string
          ingredients_title_zh: string
          section_subtitle_en: string
          section_subtitle_th: string
          section_subtitle_zh: string
          section_title_en: string
          section_title_th: string
          section_title_zh: string
          updated_at: string
        }
        Insert: {
          id?: string
          ingredients_image_url?: string | null
          ingredients_title_en?: string
          ingredients_title_th?: string
          ingredients_title_zh?: string
          section_subtitle_en?: string
          section_subtitle_th?: string
          section_subtitle_zh?: string
          section_title_en?: string
          section_title_th?: string
          section_title_zh?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ingredients_image_url?: string | null
          ingredients_title_en?: string
          ingredients_title_th?: string
          ingredients_title_zh?: string
          section_subtitle_en?: string
          section_subtitle_th?: string
          section_subtitle_zh?: string
          section_title_en?: string
          section_title_th?: string
          section_title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_questions: {
        Row: {
          admin_reply: string | null
          created_at: string
          email: string | null
          id: string
          question: string
          replied_at: string | null
          replied_by: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          email?: string | null
          id?: string
          question: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          email?: string | null
          id?: string
          question?: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
