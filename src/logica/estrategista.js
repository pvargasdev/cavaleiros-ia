/**
 * estrategista.js  —  Desenvolvedor 2: O Estrategista
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Responsabilidades:
 *   • Banco de dados das 12 Casas (dificuldade) e 5 Cavaleiros (poder cósmico)
 *   • Gestão dos 5 pontos de energia de cada cavaleiro (-1 por batalha, morre em 0)
 *   • Fórmula: Tempo = Dificuldade da Casa / Σ Poder Cósmico dos participantes
 *   • DFS com Backtracking + Memoização para encontrar a escalação ÓTIMA
 *
 * Por que Memoização?
 *   O estado do problema é (índice da casa atual + energia de cada cavaleiro).
 *   Duas ramificações diferentes podem chegar ao mesmo estado, por isso
 *   armazenamos o resultado ótimo já calculado e evitamos recomputação.
 *   Estados possíveis: 12 casas × 6^5 energias = ~93.000 (gerenciável).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  INTERFACE PÚBLICA para o index.js:
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   const { planejarBatalhas } = require('./estrategista');
 *   const resultado = planejarBatalhas(ordemDasCasas, tempoDisponivel);
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// BANCO DE DADOS — CAVALEIROS DE BRONZE
// Para alterar o poder cósmico, edite os valores abaixo.
// ─────────────────────────────────────────────────────────────────────────────
const CAVALEIROS = [
  { nome: 'Seiya',  poderCosmico: 1.5 },
  { nome: 'Shiryu', poderCosmico: 1.4 },
  { nome: 'Hyoga',  poderCosmico: 1.3 },
  { nome: 'Shun',   poderCosmico: 1.2 },
  { nome: 'Ikki',   poderCosmico: 1.1 },
];

const ENERGIA_INICIAL     = 5; // pontos de energia de cada cavaleiro
const ENERGIA_POR_BATALHA = 1; // energia perdida ao participar de uma batalha

// ─────────────────────────────────────────────────────────────────────────────
// BANCO DE DADOS — 12 CASAS DO ZODÍACO
// Para alterar a dificuldade, edite os valores abaixo.
// ─────────────────────────────────────────────────────────────────────────────
const CASAS_DO_ZODIACO = {
  1:  { nome: 'Casa de Aries',       dificuldade: 50  },
  2:  { nome: 'Casa de Touro',       dificuldade: 55  },
  3:  { nome: 'Casa de Gemeos',      dificuldade: 60  },
  4:  { nome: 'Casa de Cancer',      dificuldade: 70  },
  5:  { nome: 'Casa de Leao',        dificuldade: 75  },
  6:  { nome: 'Casa de Virgem',      dificuldade: 80  },
  7:  { nome: 'Casa de Libra',       dificuldade: 85  },
  8:  { nome: 'Casa de Escorpiao',   dificuldade: 90  },
  9:  { nome: 'Casa de Sagitario',   dificuldade: 95  },
  10: { nome: 'Casa de Capricornio', dificuldade: 100 },
  11: { nome: 'Casa de Aquario',     dificuldade: 110 },
  12: { nome: 'Casa de Peixes',      dificuldade: 120 },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRÉ-COMPUTAÇÃO: todos os subconjuntos não-vazios de 5 cavaleiros (31 ao todo)
// Indexados por máscara de bits: bit 0 = Seiya, bit 1 = Shiryu, ...
// ─────────────────────────────────────────────────────────────────────────────

const TOTAL_CAVALEIROS   = CAVALEIROS.length;
const TOTAL_SUBCONJUNTOS = (1 << TOTAL_CAVALEIROS) - 1; // 31

// Para cada máscara, pré-computa a soma do poder cósmico
const PODER_DA_MASCARA = new Array(TOTAL_SUBCONJUNTOS + 1).fill(0);
for (let mascara = 1; mascara <= TOTAL_SUBCONJUNTOS; mascara++) {
  for (let bit = 0; bit < TOTAL_CAVALEIROS; bit++) {
    if (mascara & (1 << bit)) PODER_DA_MASCARA[mascara] += CAVALEIROS[bit].poderCosmico;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAVE DE MEMOIZAÇÃO
// Codifica (indice da casa, array de energias) como string única
// ─────────────────────────────────────────────────────────────────────────────
function gerarChaveMemo(indiceCasa, energias) {
  return indiceCasa + '|' + energias.join(',');
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICA SE UMA MÁSCARA É VÁLIDA para um estado de energias
// Todos os cavaleiros na máscara precisam ter energia > 0
// ─────────────────────────────────────────────────────────────────────────────
function mascaraValida(mascara, energias) {
  for (let bit = 0; bit < TOTAL_CAVALEIROS; bit++) {
    if ((mascara & (1 << bit)) && energias[bit] === 0) return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// DFS COM BACKTRACKING + MEMOIZAÇÃO
//
// Retorna o menor tempo possível a partir do estado atual,
// ou Infinity se não for possível completar todas as casas.
// Armazena em memo[chave] o resultado ótimo para não recomputar.
// ─────────────────────────────────────────────────────────────────────────────
function dfs(ordemDasCasas, indiceCasa, energias, memo) {
  // Caso base: todas as casas foram resolvidas
  if (indiceCasa === ordemDasCasas.length) {
    // Pelo menos 1 cavaleiro TEM que estar vivo (> 0) para andar até o final
    const alguemFicouVivo = energias.some(energia => energia > 0);
    return alguemFicouVivo ? 0 : Infinity; // Se todo mundo morreu, poda essa ramificação (Infinity)
  }

  const chave = gerarChaveMemo(indiceCasa, energias);
  if (memo.has(chave)) return memo.get(chave);

  const numeroDaCasa = ordemDasCasas[indiceCasa];
  const dificuldade  = CASAS_DO_ZODIACO[numeroDaCasa].dificuldade;

  let melhorTempoDaqui = Infinity;

  // Testa todas as máscaras (subconjuntos não-vazios de cavaleiros vivos)
  for (let mascara = 1; mascara <= TOTAL_SUBCONJUNTOS; mascara++) {
    if (!mascaraValida(mascara, energias)) continue;

    const tempoBatalha = dificuldade / PODER_DA_MASCARA[mascara];

    // Aplica a batalha: desconta energia dos cavaleiros escalados
    const novasEnergias = [...energias];
    for (let bit = 0; bit < TOTAL_CAVALEIROS; bit++) {
      if (mascara & (1 << bit)) novasEnergias[bit] -= ENERGIA_POR_BATALHA;
    }

    // Recursa para a próxima casa
    const tempoRestante = dfs(ordemDasCasas, indiceCasa + 1, novasEnergias, memo);

    if (tempoRestante !== Infinity) {
      const tempoTotal = tempoBatalha + tempoRestante;
      if (tempoTotal < melhorTempoDaqui) {
        melhorTempoDaqui = tempoTotal;
      }
    }
  }

  memo.set(chave, melhorTempoDaqui);
  return melhorTempoDaqui;
}

// ─────────────────────────────────────────────────────────────────────────────
// RECONSTRUÇÃO DO CAMINHO ÓTIMO
// Após o DFS encontrar o custo ótimo, percorre novamente para registrar
// qual máscara foi escolhida em cada casa.
// ─────────────────────────────────────────────────────────────────────────────

function reconstruirEscalacoes(ordemDasCasas, energiasIniciais, memo) {
  const escalacoes = [];
  let energias = [...energiasIniciais];

  for (let indiceCasa = 0; indiceCasa < ordemDasCasas.length; indiceCasa++) {
    const numeroDaCasa = ordemDasCasas[indiceCasa];
    const dificuldade  = CASAS_DO_ZODIACO[numeroDaCasa].dificuldade;

    let melhorMascara    = -1;
    let melhorTempoLocal = Infinity;

    for (let mascara = 1; mascara <= TOTAL_SUBCONJUNTOS; mascara++) {
      if (!mascaraValida(mascara, energias)) continue;

      const tempoBatalha  = dificuldade / PODER_DA_MASCARA[mascara];
      const novasEnergias = [...energias];
      for (let bit = 0; bit < TOTAL_CAVALEIROS; bit++) {
        if (mascara & (1 << bit)) novasEnergias[bit] -= ENERGIA_POR_BATALHA;
      }

      const chaveProxima = gerarChaveMemo(indiceCasa + 1, novasEnergias);
      let tempoFuturo = memo.get(chaveProxima);
      
      // Se for a última casa, aplica a mesma regra do Kamikaze aqui
      if (indiceCasa + 1 === ordemDasCasas.length) {
        const alguemFicouVivo = novasEnergias.some(energia => energia > 0);
        tempoFuturo = alguemFicouVivo ? 0 : Infinity;
      }
      const tempoTotal    = tempoBatalha + tempoFuturo;

      if (tempoTotal < melhorTempoLocal) {
        melhorTempoLocal = tempoTotal;
        melhorMascara    = mascara;
      }
    }

    // Registra a escalação desta casa
    const cavaleirosEscalados = [];
    const novasEnergias = [...energias];
    for (let bit = 0; bit < TOTAL_CAVALEIROS; bit++) {
      if (melhorMascara & (1 << bit)) {
        cavaleirosEscalados.push(CAVALEIROS[bit].nome);
        novasEnergias[bit] -= ENERGIA_POR_BATALHA;
      }
    }

    escalacoes.push({
      numeroDaCasa,
      nomeDaCasa         : CASAS_DO_ZODIACO[numeroDaCasa].nome,
      dificuldade,
      cavaleirosEscalados,
      poderTotal         : PODER_DA_MASCARA[melhorMascara],
      tempoDaBatalha     : dificuldade / PODER_DA_MASCARA[melhorMascara],
      energiaAposBatalha : Object.fromEntries(
        CAVALEIROS.map((c, i) => [c.nome, novasEnergias[i]])
      ),
    });

    energias = novasEnergias;
  }

  return { escalacoes, energiaFinal: energias };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNÇÃO PRINCIPAL — interface pública para o index.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Planeja as batalhas de todas as casas usando DFS + Backtracking + Memoização.
 *
 * @param {number[]} ordemDasCasas          Sequência de casas (vem do Dev 1)
 * @param {number}   tempoDisponivelMinutos  Limite de tempo para batalhas
 * @returns {Object} Resultado completo com escalações e tempos
 */
function planejarBatalhas(ordemDasCasas, tempoDisponivelMinutos) {
  console.log('='.repeat(62));
  console.log('  ESTRATEGISTA  -  Cavaleiros de Bronze  (DFS + Backtracking)');
  console.log('='.repeat(62));
  console.log(`\nTempo disponivel para batalhas: ${tempoDisponivelMinutos.toFixed(1)} minutos`);
  console.log(`Casas a enfrentar             : ${ordemDasCasas.join(' -> ')}`);

  const energiasIniciais = CAVALEIROS.map(() => ENERGIA_INICIAL);
  const memo             = new Map();

  // ── Fase 1: DFS encontra o custo mínimo ──────────────────────────────────
  const tempoInicio          = Date.now();
  const tempoTotalDeBatalhas = dfs(ordemDasCasas, 0, energiasIniciais, memo);
  const tempoDeExecucao      = Date.now() - tempoInicio;

  if (tempoTotalDeBatalhas === Infinity) {
    console.error('\nERRO: Impossivel derrotar todos os Cavaleiros de Ouro.');
    console.error('      Verifique a quantidade de energia e de cavaleiros.');
    return null;
  }

  // ── Fase 2: Reconstrói as escalações ótimas ───────────────────────────────
  const { escalacoes, energiaFinal } = reconstruirEscalacoes(
    ordemDasCasas, energiasIniciais, memo
  );

  const cavaleirosVivos       = [];
  const cavaleirosQueMorreram = [];
  CAVALEIROS.forEach((c, i) => {
    if (energiaFinal[i] > 0) cavaleirosVivos.push(c.nome);
    else                     cavaleirosQueMorreram.push(c.nome);
  });

  // ── Exibe resultado no console ────────────────────────────────────────────
  console.log(`\nDFS + Memoizacao concluido em ${tempoDeExecucao} ms`);
  console.log(`Estados explorados na memo   : ${memo.size}`);
  console.log(`Tempo total das batalhas     : ${tempoTotalDeBatalhas.toFixed(2)} minutos\n`);

  console.log('-'.repeat(80));
  console.log(
    'Casa'.padEnd(5) +
    'Nome'.padEnd(24) +
    'Dific.'.padEnd(8) +
    'Equipe escalada'.padEnd(32) +
    'Tempo (min)'
  );
  console.log('-'.repeat(80));

  for (const esc of escalacoes) {
    const equipe = '[' + esc.cavaleirosEscalados.join(', ') + ']';
    console.log(
      String(esc.numeroDaCasa).padEnd(5) +
      esc.nomeDaCasa.padEnd(24) +
      String(esc.dificuldade).padEnd(8) +
      equipe.padEnd(32) +
      esc.tempoDaBatalha.toFixed(2)
    );
  }

  console.log('-'.repeat(80));
  console.log(' '.repeat(69) + tempoTotalDeBatalhas.toFixed(2));

  console.log('\nEnergia final dos cavaleiros:');
  CAVALEIROS.forEach((c, i) => {
    const energia = energiaFinal[i];
    const cheios  = '█'.repeat(energia);
    const vazios  = '░'.repeat(ENERGIA_INICIAL - energia);
    const status  = energia > 0 ? 'vivo' : 'MORTO';
    console.log(`  ${c.nome.padEnd(8)} [${cheios}${vazios}] ${energia}/${ENERGIA_INICIAL}  (${status})`);
  });

  if (cavaleirosQueMorreram.length > 0) {
    console.log(`\nCavaleiros que morreram: ${cavaleirosQueMorreram.join(', ')}`);
  } else {
    console.log('\nTodos os cavaleiros sobreviveram!');
  }

  const dentroDoLimite = tempoTotalDeBatalhas <= tempoDisponivelMinutos;
  if (dentroDoLimite) {
    console.log(`\nBatalhas concluidas dentro do prazo! (${tempoTotalDeBatalhas.toFixed(2)} / ${tempoDisponivelMinutos.toFixed(1)} min)`);
  } else {
    console.log(`\nAVISO: Tempo de batalhas (${tempoTotalDeBatalhas.toFixed(2)} min) excede o disponivel (${tempoDisponivelMinutos.toFixed(1)} min)!`);
  }

  return {
    escalacoes,
    tempoTotalDeBatalhas,
    cavaleirosVivos,
    cavaleirosQueMorreram,
    energiaFinal: Object.fromEntries(CAVALEIROS.map((c, i) => [c.nome, energiaFinal[i]])),
    dentroDoLimite,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAÇÕES
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  planejarBatalhas,
  CAVALEIROS,
  CASAS_DO_ZODIACO,
  ENERGIA_INICIAL,
};

// Executa direto se chamado como: node estrategista.js
if (require.main === module) {
  const ordemPadrao = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  planejarBatalhas(ordemPadrao, 203);
}