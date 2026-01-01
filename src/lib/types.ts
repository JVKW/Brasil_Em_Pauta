import type { LucideIcon } from 'lucide-react';

export type Indicator = 'economy' | 'education' | 'wellBeing' | 'popularSupport' | 'hunger' | 'militaryReligion';

export type GameState = {
  indicators: Record<Indicator, number>;
  boardPosition: number;
};

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
  id: string;
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
