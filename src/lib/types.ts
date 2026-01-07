import type { LucideIcon } from 'lucide-react';

export type Indicator = 'economy' | 'education' | 'wellbeing' | 'popular_support' | 'hunger' | 'military_religion';

export type Indicators = Record<Indicator, number>;

export type Role = 
  | 'ministerOfEducation' 
  | 'economyManager'
  | 'agriculture'
  | 'religious'
  | 'influencer'
  | 'militaryCommander'
  | 'Presidente'; // Added from API data

export type Player = {
  id: string;
  game_session_id?: string; // This is not in the player object from API
  user_uid: string;
  name: string;
  character_role: Role;
  capital: number | string; // API returns string "50.00"
  avatar?: string;
  isOpportunist?: boolean;
};

export type DecisionEffect = Record<string, number>;

export type DecisionCard = {
  id: string; // or session_card_id from API
  title: string;
  dilemma: string;
  ethical_choice_effect: DecisionEffect;
  corrupt_choice_effect: DecisionEffect;
  session_card_id?: string; // From API
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
// This is now a flattened structure based on the new API.
export type GameSession = {
  session_id: string;
  game_code: string;
  status: 'waiting' | 'in_progress' | 'finished';
  creator_user_uid: string;
  current_turn: number;
  current_player_index: number;
  
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
  currentCard: DecisionCard | null; // Renamed from current_card
  logs?: LogEntry[]; 
  gameOverMessage?: string;
};

// Kept for compatibility with some components that might use it
export type GameState = Omit<GameSession, 'session_id' | 'game_code' | 'creator_user_uid' | 'status' | 'players' | 'current_turn' | 'current_player_index' | 'currentCard' | 'logs'>;
export type DecisionOption = { id: string; name: string, description: string; effects: DecisionEffect[]; variant: string; };