import type { LucideIcon } from 'lucide-react';

export type Indicator = 'economy' | 'education' | 'wellbeing' | 'popular_support' | 'hunger' | 'military_religion';

export type Indicators = Record<Indicator, number>;

export type Role = 
  | 'ministerOfEducation' 
  | 'economyManager'
  | 'agriculture'
  | 'religious'
  | 'influencer'
  | 'militaryCommander';

export type Player = {
  id: string;
  game_session_id: string;
  user_uid: string;
  name: string;
  character_role: Role;
  capital: number;
  avatar: string; // Assuming avatar is a string reference
  isOpportunist?: boolean; // The API doesn't seem to have this, but keeping it for now
};

export type DecisionEffect = Record<string, number>;

export type DecisionCard = {
  id: string;
  title: string;
  dilemma: string;
  ethical_choice_effect: DecisionEffect;
  corrupt_choice_effect: DecisionEffect;
};

// This is a placeholder as the API doesn't detail it yet.
// We'll use the static initialBosses from game-data for now.
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

export type NationState = {
    id: string;
    game_session_id: string;
    economy: number;
    education: number;
    wellbeing: number;
    popular_support: number;
    hunger: number;
    military_religion: number;
    board_position: number;
}

// Represents the entire state of a game session from GET /game/:gameCode
export type GameSession = {
  id: string;
  game_code: string;
  status: 'waiting' | 'in_progress' | 'finished';
  created_at: string; // ISO String
  creator_user_uid: string;
  current_turn: number;
  current_player_index: number;
  
  // Nested data from the API
  players: Player[];
  nation_state: NationState;
  current_card: DecisionCard | null;
  logs: LogEntry[]; // Assuming logs are part of the payload
  gameOverMessage?: string;
};

// Kept for compatibility with some components that might use it
export type GameState = Omit<GameSession, 'id' | 'game_code' | 'creator_user_uid' | 'status' | 'created_at' | 'players' | 'current_turn' | 'current_player_index' | 'current_card' | 'logs'>;
export type DecisionOption = { id: string; name: string, description: string; effects: DecisionEffect[]; variant: string; };

