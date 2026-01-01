import type { Player, Role, DecisionCard, Boss, GameState, RoleDetails } from './types';
import { Landmark, GraduationCap, Tractor, HandHelping, Megaphone, ShieldCheck, BookOpen, Heart, Users, Soup, Shield, Star, Scale } from 'lucide-react';

export const roleDetails: Record<Role, RoleDetails> = {
  ministerOfEducation: { name: 'Ministro da Educação', description: 'Efeito dobrado em ações para Educação.', icon: GraduationCap },
  economyManager: { name: 'Gestor da Economia', description: 'Gera recursos mais facilmente.', icon: Landmark },
  agriculture: { name: 'Agricultura', description: 'Reduz a Fome com menos custo.', icon: Tractor },
  religious: { name: 'Líder Religioso', description: 'Aumenta o Bem-Estar e Apoio Popular.', icon: HandHelping },
  influencer: { name: 'Influencer', description: 'Manipula o Apoio Popular facilmente.', icon: Megaphone },
  militaryCommander: { name: 'Comandante Militar', description: 'Evita que indicadores caiam em crises.', icon: ShieldCheck },
};

export const indicatorDetails = {
  economy: { name: 'Economia', icon: Landmark, description: "Dinheiro público para financiar projetos." },
  education: { name: 'Educação', icon: BookOpen, description: "O nível de consciência do povo." },
  wellBeing: { name: 'Bem-Estar', icon: Heart, description: "A qualidade de vida geral." },
  popularSupport: { name: 'Apoio Popular', icon: Users, description: "O quanto o povo confia no governo." },
  hunger: { name: 'Fome (Inverso)', icon: Soup, description: "Não pode subir. Se chegar a 10, o jogo acaba." },
  militaryReligion: { name: 'Ordem e Coesão', icon: Shield, description: "Representam a ordem e a coesão social." },
};

export const initialPlayers: Player[] = [
  { id: 'p1', name: 'Player 1', role: 'ministerOfEducation', isOpportunist: false, capital: 5, avatar: '1' },
  { id: 'p2', name: 'Player 2', role: 'economyManager', isOpportunist: true, capital: 5, avatar: '2' },
  { id: 'p3', name: 'Player 3', role: 'influencer', isOpportunist: false, capital: 5, avatar: '3' },
  { id: 'p4', name: 'Player 4', role: 'agriculture', isOpportunist: false, capital: 5, avatar: '4' },
];

export const initialCards: DecisionCard[] = [
  {
    id: 'card1',
    title: 'Crise nas Escolas',
    dilema: 'Faltam professores em áreas rurais, mas há pressão da mídia para investir em propaganda do governo.',
    options: [
      { id: 'c1o1', name: 'Transformadora', description: 'Contratar e treinar novos professores com foco em EDH.', effects: [{ indicator: 'education', change: 2 }, { indicator: 'economy', change: -3 }, { board: 'player', change: 2 }], variant: 'default' },
      { id: 'c1o2', name: 'Pragmática', description: 'Lançar um programa paliativo com voluntários.', effects: [{ indicator: 'education', change: 1 }, { indicator: 'economy', change: -1 }, { board: 'player', change: 1 }], variant: 'secondary' },
      { id: 'c1o3', name: 'Neutra', description: 'Criar um comitê para "estudar a situação".', effects: [], variant: 'ghost' },
      { id: 'c1o4', name: 'Oportunista', description: 'Desviar verba da educação para uma "consultoria" de um amigo.', effects: [{ indicator: 'education', change: -2 }, { indicator: 'popularSupport', change: -1 }, { capital: 'player', change: 15 }], variant: 'outline' },
      { id: 'c1o5', name: 'Autoritária', description: 'Investir em propaganda massiva para melhorar a imagem do governo.', effects: [{ indicator: 'popularSupport', change: 2 }, { indicator: 'education', change: -2 }, { indicator: 'economy', change: -2 }], variant: 'destructive' },
    ]
  },
  {
    id: 'card2',
    title: 'Protestos por Alimentos',
    dilema: 'A população protesta por conta da alta no preço dos alimentos. A oposição culpa o governo.',
    options: [
        { id: 'c2o1', name: 'Transformadora', description: 'Criar fazendas urbanas e subsidiar pequenos agricultores.', effects: [{ indicator: 'hunger', change: -2 }, { indicator: 'economy', change: -3 }, { indicator: 'wellBeing', change: 1 }, { board: 'player', change: 2 }], variant: 'default' },
        { id: 'c2o2', name: 'Pragmática', description: 'Importar alimentos mais baratos temporariamente.', effects: [{ indicator: 'hunger', change: -1 }, { indicator: 'economy', change: -2 }, { board: 'player', change: 1 }], variant: 'secondary' },
        { id: 'c2o3', name: 'Neutra', description: 'Dizer que a culpa é da "crise internacional".', effects: [{ indicator: 'popularSupport', change: -1 }], variant: 'ghost' },
        { id: 'c2o4', name: 'Oportunista', description: 'Aceitar suborno de grandes corporações de alimentos para manter os preços altos.', effects: [{ indicator: 'hunger', change: 2 }, { indicator: 'wellBeing', change: -2 }, { capital: 'player', change: 20 }], variant: 'outline' },
        { id: 'c2o5', name: 'Autoritária', description: 'Usar a força policial para reprimir os protestos violentamente.', effects: [{ indicator: 'militaryReligion', change: 2 }, { indicator: 'popularSupport', change: -3 }, { indicator: 'wellBeing', change: -2 }], variant: 'destructive' },
    ]
  }
];

export const initialBosses: Boss[] = [
  { id: 'boss1', name: 'Negacionismo', position: 5, requirement: { indicator: 'education', level: 5 } },
  { id: 'boss2', name: 'Corrupção Sistêmica', position: 12, requirement: { indicator: 'popularSupport', level: 6 } },
  { id: 'boss3', name: 'Fake News', position: 10, requirement: { indicator: 'education', level: 7 } },
  { id: 'boss4', name: 'Desigualdade', position: 20, requirement: { indicator: 'wellBeing', level: 8 } },
];

export const initialGameState: GameState = {
  indicators: {
    economy: 7,
    education: 4,
    wellBeing: 5,
    popularSupport: 5,
    hunger: 2,
    militaryReligion: 4,
  },
  boardPosition: 1,
};
