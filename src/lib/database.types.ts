export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          plan: 'starter' | 'pro' | 'institutional';
          kyc_status: 'pending' | 'verified' | 'rejected';
          two_fa_enabled: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          chain: string;
          symbol: string;
          address: string;
          balance: number;
          usd_value: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wallets']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['wallets']['Insert']>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'earn';
          asset: string;
          amount: number;
          usd_value: number;
          status: 'completed' | 'pending' | 'failed';
          from_address: string | null;
          to_address: string | null;
          tx_hash: string | null;
          fee: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
        Relationships: [];
      };
      stakes: {
        Row: {
          id: string;
          user_id: string;
          asset: string;
          amount: number;
          apy: number;
          earned: number;
          status: 'active' | 'unlocking' | 'unstaked';
          lock_period_days: number;
          started_at: string;
          unlock_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stakes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['stakes']['Insert']>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
