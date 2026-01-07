import type { Role, Boss, RoleDetails, Indicator } from './types';
import { Landmark, GraduationCap, Tractor, HandHelping, Megaphone, ShieldCheck, BookOpen, Heart, Users, Soup, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const roleDetails: Record<Role, RoleDetails> = {
  ministerOfEducation: { name: 'Ministro da Educação', description: 'Efeito dobrado em ações para Educação.', icon: GraduationCap },
  economyManager: { name: 'Gestor da Economia', description: 'Gera recursos mais facilmente.', icon: Landmark },
  agriculture: { name: 'Ministro da Agricultura', description: 'Reduz a Fome com mais eficiência.', icon: Tractor },
  religious: { name: 'Líder Religioso', description: 'Aumenta o Bem-Estar e Apoio Popular.', icon: HandHelping },
  influencer: { name: 'Influencer Digital', description: 'Manipula o Apoio Popular facilmente.', icon: Megaphone },
  militaryCommander: { name: 'Comandante Militar', description: 'Evita que indicadores caiam em crises.', icon: ShieldCheck },
  Presidente: { name: 'Presidente', description: 'O líder da nação, com grande responsabilidade.', icon: Landmark },
};

export const indicatorDetails: Record<string, { name: string; icon: LucideIcon; description: string }> = {
  economy: { name: 'Economia', icon: Landmark, description: "Dinheiro público para financiar projetos." },
  education: { name: 'Educação', icon: BookOpen, description: "O nível de consciência do povo." },
  wellbeing: { name: 'Bem-Estar', icon: Heart, description: "A qualidade de vida geral." },
  popular_support: { name: 'Apoio Popular', icon: Users, description: "O quanto o povo confia no governo." },
  hunger: { name: 'Fome (Inverso)', icon: Soup, description: "Não pode subir. Se chegar a 10, o jogo acaba." },
  military_religion: { name: 'Ordem e Coesão', icon: Shield, description: "Representam a ordem e a coesão social." },
};

// initialCards is now mostly for fallback or displaying static content if needed.
// The live card comes from the API.
export const initialCards: any[] = [];

export const initialBosses: Boss[] = [
  { id: 'boss1', name: 'Negacionismo', position: 5, requirement: { indicator: 'education', level: 5 } },
  { id: 'boss2', name: 'Corrupção Sistêmica', position: 12, requirement: { indicator: 'popular_support', level: 6 } },
  { id: 'boss3', name: 'Fake News', position: 10, requirement: { indicator: 'education', level: 7 } },
  { id: 'boss4', name: 'Desigualdade', position: 20, requirement: { indicator: 'wellbeing', level: 8 } },
];
