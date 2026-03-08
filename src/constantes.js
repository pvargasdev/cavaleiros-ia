export const TEMPO_MAXIMO_MINUTOS = 720;
export const ENERGIA_INICIAL = 5;
export const ENERGIA_POR_BATALHA = 1;

export const TERRENOS = {
  INICIO: { id: 0, custo: 1, nome: 'Inicio' },
  FIM: { id: 13, custo: 1, nome: 'Grande Mestre' },
  MONTANHOSO: { id: 14, custo: 200, nome: 'Montanhoso' },
  PLANO: { id: 15, custo: 1, nome: 'Plano' },
  ROCHOSO: { id: 16, custo: 5, nome: 'Rochoso' },
  CUSTO_MOVIMENTO_CASA: 1
};

export const PADRAO_CAVALEIROS = [
  { nome: 'Seiya', poderCosmico: 1.5 },
  { nome: 'Shiryu', poderCosmico: 1.4 },
  { nome: 'Hyoga', poderCosmico: 1.3 },
  { nome: 'Shun', poderCosmico: 1.2 },
  { nome: 'Ikki', poderCosmico: 1.1 }
];

export const PADRAO_CASAS = {
  1: { nome: 'Casa de Áries', dificuldade: 50 },
  2: { nome: 'Casa de Touro', dificuldade: 55 },
  3: { nome: 'Casa de Gêmeos', dificuldade: 60 },
  4: { nome: 'Casa de Câncer', dificuldade: 70 },
  5: { nome: 'Casa de Leão', dificuldade: 75 },
  6: { nome: 'Casa de Virgem', dificuldade: 80 },
  7: { nome: 'Casa de Libra', dificuldade: 85 },
  8: { nome: 'Casa de Escorpião', dificuldade: 90 },
  9: { nome: 'Casa de Sagitário', dificuldade: 95 },
  10: { nome: 'Casa de Capricórnio', dificuldade: 100 },
  11: { nome: 'Casa de Aquário', dificuldade: 110 },
  12: { nome: 'Casa de Peixes', dificuldade: 120 }
};