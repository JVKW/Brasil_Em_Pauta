import type { LucideIcon } from 'lucide-react';

export type Indicator = 'economy' | 'education' | 'wellBeing' | 'popularSupport' | 'hunger' | 'militaryReligion';

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
  name: string;
  role: Role;
  isOpportunist: boolean;
  capital: number;
  avatar: string;
};

export type Effect = {
  indicator: Indicator;
  change: number;
} | {
  capital: 'player';
  change: number;
} | {
  board: 'player';
  change: number;
};

export type DecisionOption = {
  id: string;
  name: string;
  description: string;
  effects: Effect[];
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
};

export type DecisionCard = {
  id: string;
  title: string;
  dilemma: string;
  options: DecisionOption[];
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

// Represents the entire state of a game session stored in Firestore
export type GameSession = {
  id: string; // Document ID
  gameCode: string;
  creatorId: string;
  status: 'waiting' | 'in_progress' | 'completed';
  createdAt: any; // Firestore Timestamp
  
  // Game state
  indicators: Indicators;
  boardPosition: number;
  
  // Player state
  players: Record<string, Player>; // Map of uid to Player object
  
  // Turn management
  turn: number;
  currentPlayerIndex: number;
  currentCardId: string;
  
  // History
  logs: LogEntry[];
};

export type GameState = Omit<GameSession, 'id' | 'gameCode' | 'creatorId' | 'status' | 'createdAt' | 'players' | 'turn' | 'currentPlayerIndex' | 'currentCardId' | 'logs'>;
