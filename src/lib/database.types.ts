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
          is_admin: boolean;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'is_admin' | 'is_suspended'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']> & { is_suspended?: boolean };
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
      cards: {
        Row: {
          id: string;
          user_id: string;
          type: 'virtual' | 'physical';
          number: string;
          expiry: string;
          cvv: string;
          holder_name: string;
          balance: number;
          spent: number;
          card_limit: number;
          frozen: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cards']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['cards']['Insert']>;
        Relationships: [];
      };
      market_prices: {
        Row: {
          symbol: string;
          name: string;
          price: number;
          change_24h: number;
          color: string;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['market_prices']['Row'];
        Update: Partial<Database['public']['Tables']['market_prices']['Row']>;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          type: 'info' | 'warning' | 'maintenance';
          active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
        Relationships: [];
      };
      admin_settings: {
        Row: {
          id: number;
          spot_fee_pct: number;
          withdrawal_fee_pct: number;
          staking_fee_pct: number;
          daily_withdraw_limit: number;
          kyc_level1_limit: number;
          kyc_level2_limit: number;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['admin_settings']['Row'];
        Update: Partial<Database['public']['Tables']['admin_settings']['Row']>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      send_funds: {
        Args: { p_wallet_id: string; p_amount: number; p_to_address: string };
        Returns: Database['public']['Tables']['transactions']['Row'];
      };
      swap_assets: {
        Args: { p_from_symbol: string; p_to_symbol: string; p_from_amount: number };
        Returns: Database['public']['Tables']['transactions']['Row'];
      };
      create_stake: {
        Args: { p_symbol: string; p_amount: number; p_apy: number; p_lock_period_days: number };
        Returns: Database['public']['Tables']['stakes']['Row'];
      };
      unstake_position: {
        Args: { p_stake_id: string };
        Returns: Database['public']['Tables']['stakes']['Row'];
      };
      toggle_card_freeze: {
        Args: { p_card_id: string };
        Returns: Database['public']['Tables']['cards']['Row'];
      };
      topup_card: {
        Args: { p_card_id: string; p_wallet_id: string; p_usd_amount: number };
        Returns: Database['public']['Tables']['cards']['Row'];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
