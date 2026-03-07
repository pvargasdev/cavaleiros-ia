/**
 * gerarMapa.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Gera o arquivo mapa.csv com a matriz 42×42 das 12 Casas do Zodíaco.
 *
 * Layout: as casas seguem uma ROTA SERPENTINA de baixo para cima,
 * garantindo que o caminho 1→2→...→12 seja eficiente (sem grandes desvios).
 *
 *   Start  [40, 20]  (entrada do santuário — região vermelha)
 *   Goal   [ 1, 20]  (casa do Grande Mestre — região verde)
 *
 *   Casas em serpentina:
 *    1:[37, 8]   2:[37,20]   3:[31,20]   4:[31, 8]
 *    5:[25, 8]   6:[25,20]   7:[19,20]   8:[19, 8]
 *    9:[13, 8]  10:[13,20]  11:[ 7,20]  12:[ 7, 8]
 *
 * Legenda do CSV:
 *   M = Montanhoso (+200 min)   R = Rochoso (+5 min)   P = Plano (+1 min)
 *   S = Início   G = Objetivo   1-12 = Casa do Zodíaco
 *
 * Para editar o mapa:
 *   1. Altere CASAS_DO_ZODIACO ou os blocos de terreno abaixo
 *   2. Execute: node gerarMapa.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs = require('fs');

const LINHAS  = 42;
const COLUNAS = 42;

// ── Inicializa tudo como Rochoso (fundo padrão das zonas) ─────────────────────
const grade = Array.from({ length: LINHAS }, () => Array(COLUNAS).fill('R'));

// ── Funções auxiliares ────────────────────────────────────────────────────────
const setTerreno = (l, c, t) => { grade[l][c] = t; };

function preencherLinha(l, cIni, cFim, t) {
  for (let c = cIni; c <= cFim; c++) grade[l][c] = t;
}
function preencherColuna(c, lIni, lFim, t) {
  for (let l = lIni; l <= lFim; l++) grade[l][c] = t;
}
function preencherRetangulo(lIni, cIni, lFim, cFim, t) {
  for (let l = lIni; l <= lFim; l++)
    for (let c = cIni; c <= cFim; c++) grade[l][c] = t;
}

// ── BORDAS externas: todas Montanhosas ───────────────────────────────────────
for (let l = 0; l < LINHAS; l++) {
  for (let c = 0; c < COLUNAS; c++) {
    if (l === 0 || l === LINHAS-1 || c === 0 || c === COLUNAS-1) {
      grade[l][c] = 'M';
    }
  }
}

// ── PAREDES HORIZONTAIS (separam as 3 zonas de batalha) ──────────────────────
// Zona inferior (casas 1-4): linhas 34-41
// Zona intermediária (casas 5-8): linhas 16-33
// Zona superior (casas 9-12): linhas 1-15
for (const linhaParede of [16, 17, 33, 34]) {
  preencherLinha(linhaParede, 1, 40, 'M');
}

// ── PAREDES VERTICAIS (dividem esquerda e direita em cada zona) ───────────────
for (const colunaParede of [14, 15]) {
  preencherColuna(colunaParede, 1,  15, 'M');
  preencherColuna(colunaParede, 18, 32, 'M');
  preencherColuna(colunaParede, 35, 40, 'M');
}

// ── CORREDORES DE PASSAGEM nos gaps das paredes ───────────────────────────────
// Gaps nas paredes horizontais — permitem passar entre zonas
for (const linhaParede of [16, 17, 33, 34]) {
  // Gap esquerdo (coluna 8): corredor da serpentina
  grade[linhaParede][7]  = 'P';
  grade[linhaParede][8]  = 'P';
  grade[linhaParede][9]  = 'P';
  // Gap direito (coluna 20): corredor da serpentina
  grade[linhaParede][19] = 'P';
  grade[linhaParede][20] = 'P';
  grade[linhaParede][21] = 'P';
}

// Gaps nas paredes verticais — permitem passar entre esquerda e direita
for (const colunaParede of [14, 15]) {
  // Zona inferior
  grade[37][colunaParede] = 'P';
  grade[38][colunaParede] = 'P';
  // Zona intermediária
  grade[22][colunaParede] = 'P';
  grade[23][colunaParede] = 'P';
  // Zona superior
  grade[10][colunaParede] = 'P';
  grade[11][colunaParede] = 'P';
}

// ── CORREDORES PLANOS principais (caminhos da serpentina) ─────────────────────
// Corredor vertical esquerdo: coluna 8 (conecta todas as zonas)
preencherColuna(8,  1, 40, 'P');

// Corredor vertical direito: coluna 20 (conecta todas as zonas)
preencherColuna(20, 1, 40, 'P');

// Corredores horizontais entre casas em cada zona
preencherLinha(37, 8, 20, 'P');  // C1 ↔ C2 (zona inferior)
preencherLinha(31, 8, 20, 'P');  // C3 ↔ C4 (zona intermediária inferior)
preencherLinha(25, 8, 20, 'P');  // C5 ↔ C6 (zona intermediária)
preencherLinha(19, 8, 20, 'P');  // C7 ↔ C8 (zona intermediária superior)
preencherLinha(13, 8, 20, 'P');  // C9 ↔ C10 (zona superior inferior)
preencherLinha(7,  8, 20, 'P');  // C11 ↔ C12 (zona superior)

// Corredor de chegada (Start → coluna 8)
preencherLinha(40, 8, 20, 'P');

// Corredor final (coluna 8 → Goal)
preencherLinha(1, 8, 20, 'P');

// ── ÁREAS PLANAS ao redor das casas (facilita acesso) ─────────────────────────
// Zona inferior: área central plana
preencherRetangulo(36, 3, 39, 12, 'P');  // ao redor de casa 1
preencherRetangulo(36, 16, 39, 25, 'P'); // ao redor de casa 2

// Zona intermediária inferior
preencherRetangulo(29, 3, 32, 12, 'P');  // ao redor de casa 3
preencherRetangulo(29, 16, 32, 25, 'P'); // ao redor de casa 4

// Zona intermediária
preencherRetangulo(23, 3, 26, 12, 'P');  // ao redor de casa 5
preencherRetangulo(23, 16, 26, 25, 'P'); // ao redor de casa 6

// Zona intermediária superior
preencherRetangulo(17, 3, 21, 12, 'P');  // ao redor de casa 7
preencherRetangulo(17, 16, 21, 25, 'P'); // ao redor de casa 8

// Zona superior inferior
preencherRetangulo(11, 3, 14, 12, 'P');  // ao redor de casa 9
preencherRetangulo(11, 16, 14, 25, 'P'); // ao redor de casa 10

// Zona superior
preencherRetangulo(5, 3, 8, 12, 'P');   // ao redor de casa 11
preencherRetangulo(5, 16, 8, 25, 'P');  // ao redor de casa 12

// ── ÁREAS MONTANHOSAS decorativas (fora das zonas de passagem) ───────────────
preencherRetangulo(2,  22, 8,  40, 'M');  // canto superior direito
preencherRetangulo(2,  1,  8,  2,  'M');  // canto superior esquerdo extremo
preencherRetangulo(35, 22, 41, 40, 'M'); // canto inferior direito
preencherRetangulo(18, 22, 32, 40, 'M'); // lado direito central

// ── ÁREAS ROCHOSAS (zonas de travessia mais difíceis, mas passáveis) ──────────
preencherRetangulo(2,  3,  4,  7,  'R');
preencherRetangulo(2,  21, 4,  21, 'R');
preencherRetangulo(35, 3,  36, 7,  'R');
preencherRetangulo(35, 21, 36, 21, 'R');

// ── 12 CASAS DO ZODÍACO ───────────────────────────────────────────────────────
// Posicionadas em ORDEM SERPENTINA de baixo para cima:
//   C1 e C2 na zona inferior (linhas ~37)
//   C3 e C4 na zona intermediária inferior (linhas ~31)
//   C5 e C6 na zona intermediária (linhas ~25)
//   C7 e C8 na zona intermediária superior (linhas ~19)
//   C9 e C10 na zona superior inferior (linhas ~13)
//   C11 e C12 na zona superior (linhas ~7)
//
// Para alterar posições, edite as coordenadas aqui:
const CASAS_DO_ZODIACO = {
  1:  [37,  8],  // Áries        — zona inferior esquerda
  2:  [37, 20],  // Touro        — zona inferior direita
  3:  [31, 20],  // Gêmeos       — zona interm. inferior direita
  4:  [31,  8],  // Câncer       — zona interm. inferior esquerda
  5:  [25,  8],  // Leão         — zona intermediária esquerda
  6:  [25, 20],  // Virgem       — zona intermediária direita
  7:  [19, 20],  // Libra        — zona interm. superior direita
  8:  [19,  8],  // Escorpião    — zona interm. superior esquerda
  9:  [13,  8],  // Sagitário    — zona superior inferior esquerda
  10: [13, 20],  // Capricórnio  — zona superior inferior direita
  11: [ 7, 20],  // Aquário      — zona superior direita
  12: [ 7,  8],  // Peixes       — zona superior esquerda
};

for (const [num, [l, c]] of Object.entries(CASAS_DO_ZODIACO)) {
  grade[l][c] = String(num);
}

// ── INÍCIO e OBJETIVO ─────────────────────────────────────────────────────────
grade[40][20] = 'S'; // Entrada do santuário (região vermelha)
grade[1][20]  = 'G'; // Casa do Grande Mestre (região verde)

// ── Salva como CSV ────────────────────────────────────────────────────────────
const conteudoCsv = grade.map(l => l.join(',')).join('\n');
fs.writeFileSync('mapa.csv', conteudoCsv, 'utf-8');

console.log('Mapa gerado: mapa.csv (42x42)');
console.log('  Inicio  : [40, 20]');
console.log('  Objetivo: [ 1, 20]');
console.log('  Rota serpentina: Entrada -> ' +
  Object.entries(CASAS_DO_ZODIACO).map(([n,[l,c]])=>`C${n}[${l},${c}]`).join(' -> ') +
  ' -> Objetivo'
);