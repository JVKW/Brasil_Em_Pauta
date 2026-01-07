import type { LucideIcon } from 'lucide-react';

export type Indicator = 'economy' | 'education' | 'wellbeing' | 'popular_support' | 'hunger' | 'military_religion';

export type Indicators = Record<Indicator, number>;

export type Role = 
  | 'Presidente'
  | 'Ministro' 
  | 'General'
  | 'Opositor'
  | 'Empresário'
  | 'Jornalista'
  | 'Cidadão';

export type Player = {
  id: string;
  session_id: string;
  user_uid: string;
  nickname: string;
  character_role: Role;
  capital: number | string;
  turn_order: number;
  avatar?: string;
  isOpportunist?: boolean;
};

export type DecisionEffect = Record<string, number>;

export type DecisionOption = {
  text: string;
  effect: DecisionEffect;
}

export type DecisionCard = {
  id?: string;
  title: string;
  dilemma: string;
  options: DecisionOption[];
  session_card_id?: string;
};

export type Boss = {
  id:string;
  name: string;
  position: number;
  requirement: {
    indicator: Indicator;
    level: number;
  };
};

export type RoleDetails = {
  name: string;
  description: string;
  icon: LucideIcon;
};

export type LogEntry = {
  id: number;
  turn: number;
  playerName: string;
  playerRole: string;
  decision: string;
  effects: string;
};

// Represents the entire state of a game session from GET /game/:gameCode
export type GameSession = {
  id: string;
  game_code: string;
  status: 'waiting' | 'in_progress' | 'finished';
  creator_user_uid: string;
  current_turn: number;
  current_player_index: number;
  end_reason?: string;
  
  // Nation state properties are now at the top level
  economy: number;
  education: number;
  wellbeing: number;
  popular_support: number;
  hunger: number;
  military_religion: number;
  board_position: number;
  
  // Nested data from the API
  players: Player[];
  currentCard: DecisionCard | null;
  logs?: LogEntry[]; 
  gameOverMessage?: string;
};
