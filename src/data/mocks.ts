import { MaterialCommunityIcons } from '@expo/vector-icons';

// 1. Defina o tipo para uma única especialidade.
// A mágica está aqui: dizemos que 'icon' DEVE ser um nome de ícone válido.
export type Specialty = {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

// 2. Aplique o tipo ao nosso array de dados.
// Agora, TypeScript sabe que este é um array de objetos 'Specialty'.
export const specialties: Specialty[] = [
  {
    id: '1',
    name: 'Cardiologista',
    icon: 'heart-outline',
  },
  {
    id: '2',
    name: 'Psicólogo',
    icon: 'brain',
  },
  {
    id: '3',
    name: 'Dermatologista',
    icon: 'content-cut', // Ícone genérico, pode ser trocado
  },
  {
    id: '4',
    name: 'Neurologista',
    icon: 'head-cog-outline',
  },
  {
    id: '5',
    name: 'Clínico Geral',
    icon: 'doctor',
  },
  {
    id: '6',
    name: 'Pediatra',
    icon: 'baby-face-outline',
  },
  // Adicionando mais dados para a rolagem
  {
    id: '7',
    name: 'Oftalmologista',
    icon: 'eye-outline',
  },
  {
    id: '8',
    name: 'Ginecologista',
    icon: 'gender-female',
  },
  {
    id: '9',
    name: 'Ortopedista',
    icon: 'bone',
  },
  // Novas especialidades adicionadas
  {
    id: '10',
    name: 'Urologista',
    icon: 'human-male-board',
  },
  {
    id: '11',
    name: 'Endocrinologista',
    icon: 'diabetes',
  },
  {
    id: '12',
    name: 'Psiquiatra',
    icon: 'head-question-outline',
  },
];

