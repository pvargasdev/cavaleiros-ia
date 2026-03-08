/**
 * index.js  —  Ponto de Integração
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Este arquivo é o ponto de encontro entre os dois módulos:
 *
 *   Desenvolvedor 1 (navegador.js)  →  encontra o caminho pelo mapa
 *   Desenvolvedor 2 (estrategista.js) →  planeja as batalhas nas casas
 *
 * Fluxo:
 *   1. Navegador roda o A* e retorna o tempo gasto na caminhada
 *   2. Este arquivo subtrai do limite de 720 minutos (12 horas)
 *   3. Estrategista recebe o tempo restante e planeja as batalhas
 *   4. Resultado final é exibido e salvo em resultado.json
 *
 * Para executar:  node index.js
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs');
const { navegar } = require('./navegador');

const { planejarBatalhas } = require('./estrategista');

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTE GLOBAL — limite máximo de tempo (12 horas = 720 minutos)
// ─────────────────────────────────────────────────────────────────────────────
const TEMPO_MAXIMO_MINUTOS = 720;

// ─────────────────────────────────────────────────────────────────────────────
// PASSO 1 — NAVEGAÇÃO (Desenvolvedor 1)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log('  CAVALEIROS DE BRONZE — MISSÃO: SALVAR ATENA');
console.log('='.repeat(60));

const resultadoDaNavegacao = navegar('src/assets/mapa.csv');

if (!resultadoDaNavegacao) {
  console.error('\nERRO: Navegacao falhou. Encerrando programa.');
  process.exit(1);
}

// Compatível com navegador.js (tempoDePercurso / casasEmOrdem)
const caminho          = resultadoDaNavegacao.caminho;
const tempoDeCaminhada = resultadoDaNavegacao.tempoDeCaminhada ?? resultadoDaNavegacao.tempoDePercurso;
const casas            = resultadoDaNavegacao.casas;
const ordemDasCasas    = resultadoDaNavegacao.ordemDasCasas ?? resultadoDaNavegacao.casasEmOrdem;

// ─────────────────────────────────────────────────────────────────────────────
// PASSO 2 — CÁLCULO DO TEMPO RESTANTE PARA AS BATALHAS
// ─────────────────────────────────────────────────────────────────────────────
const tempoRestanteParaBatalhas = TEMPO_MAXIMO_MINUTOS - tempoDeCaminhada;

console.log('\n' + '='.repeat(60));
console.log('  BALANCO DE TEMPO');
console.log('='.repeat(60));
console.log(`  Limite total          : ${TEMPO_MAXIMO_MINUTOS} minutos (12 horas)`);
console.log(`  Tempo de caminhada    : ${tempoDeCaminhada} minutos`);
console.log(`  Restante p/ batalhas  : ${tempoRestanteParaBatalhas} minutos`);

if (tempoRestanteParaBatalhas <= 0) {
  console.error('\nERRO: Tempo esgotado so na caminhada! Atena nao pode ser salva.');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSO 3 — BATALHAS (Desenvolvedor 2)
// ─────────────────────────────────────────────────────────────────────────────

// Estrutura que o Dev 2 deve preencher no módulo estrategista.js:
//
// planejarBatalhas(ordemDasCasas, tempoRestanteParaBatalhas)
//
// Deve retornar:
// {
//   escalacoes: [
//     {
//       casa               : 1,
//       nomeDaCasa         : 'Casa de Aries',
//       cavaleirosEscalados: ['Seiya', 'Shiryu'],
//       tempoDaBatalha     : 23.8
//     },
//     ...
//   ],
//   tempoTotalDeBatalhas: number
// }

const resultadoDasBatalhas = planejarBatalhas(ordemDasCasas, tempoRestanteParaBatalhas);

// ─────────────────────────────────────────────────────────────────────────────
// PASSO 4 — RESULTADO FINAL
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(60));
console.log('  RESULTADO FINAL');
console.log('='.repeat(60));

const tempoTotalDaBatalhas = resultadoDasBatalhas
  ? resultadoDasBatalhas.tempoTotalDeBatalhas
  : 0;

const tempoTotalGeral = tempoDeCaminhada + tempoTotalDaBatalhas;

console.log(`  Tempo de caminhada   : ${tempoDeCaminhada} min`);
console.log(`  Tempo de batalhas    : ${tempoTotalDaBatalhas.toFixed(2)} min`);
console.log(`  TEMPO TOTAL          : ${tempoTotalGeral.toFixed(2)} min`);
console.log(`  Limite               : ${TEMPO_MAXIMO_MINUTOS} min`);
console.log(`  Atena sera salva?    : ${tempoTotalGeral <= TEMPO_MAXIMO_MINUTOS ? 'SIM ✓' : 'NAO ✗'}`);

if (resultadoDasBatalhas) {
  console.log(`\n  Cavaleiros vivos     : ${resultadoDasBatalhas.cavaleirosVivos.join(', ') || 'nenhum'}`);
  console.log(`  Cavaleiros mortos    : ${resultadoDasBatalhas.cavaleirosQueMorreram.join(', ') || 'nenhum'}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSO 5 — SALVA O RESULTADO EM JSON (para o front-end React ler)
// ─────────────────────────────────────────────────────────────────────────────
const resultadoFinal = {
  navegacao: {
    caminho,
    tempoDeCaminhada,
    quantidadeDePassos: caminho.length,
    casas,
    ordemDasCasas,
  },
  batalhas: resultadoDasBatalhas ?? {
    escalacoes: [],
    tempoTotalDeBatalhas: 0,
    aviso: 'Modulo estrategista.js ainda nao integrado',
  },
  resumo: {
    tempoDeCaminhada,
    tempoTotalDeBatalhas: tempoTotalDaBatalhas,
    tempoTotalGeral,
    tempoMaximo: TEMPO_MAXIMO_MINUTOS,
    atenaSalva: tempoTotalGeral <= TEMPO_MAXIMO_MINUTOS,
  },
};

fs.writeFileSync('resultado.json', JSON.stringify(resultadoFinal, null, 2), 'utf-8');
console.log('\nResultado salvo em resultado.json');