/**
 * src/logica/estrategista.js
 */
'use strict';
const { PADRAO_CAVALEIROS, PADRAO_CASAS, ENERGIA_INICIAL, ENERGIA_POR_BATALHA } = require('../constantes');

function gerarChaveMemo(indiceCasa, energias) {
  return indiceCasa + '|' + energias.join(',');
}

function mascaraValida(mascara, energias, numCavaleiros) {
  for (let bit = 0; bit < numCavaleiros; bit++) {
    if ((mascara & (1 << bit)) && energias[bit] === 0) return false;
  }
  return true;
}

function dfs(ordemDasCasas, indiceCasa, energias, memo, dadosCasas, dadosCavaleiros, preCalculoPoder) {
  if (indiceCasa === ordemDasCasas.length) {
    const alguemFicouVivo = energias.some(e => e > 0);
    return alguemFicouVivo ? 0 : Infinity;
  }

  const chave = gerarChaveMemo(indiceCasa, energias);
  if (memo.has(chave)) return memo.get(chave);

  const numeroDaCasa = ordemDasCasas[indiceCasa];
  const dificuldade = dadosCasas[numeroDaCasa].dificuldade;

  let melhorTempo = Infinity;
  const totalSubconjuntos = preCalculoPoder.length - 1;
  const numCavs = dadosCavaleiros.length;

  for (let mascara = 1; mascara <= totalSubconjuntos; mascara++) {
    if (!mascaraValida(mascara, energias, numCavs)) continue;

    const tempoBatalha = dificuldade / preCalculoPoder[mascara];
    const novasEnergias = [...energias];
    
    for (let bit = 0; bit < numCavs; bit++) {
      if (mascara & (1 << bit)) novasEnergias[bit] -= ENERGIA_POR_BATALHA;
    }

    const tempoRestante = dfs(ordemDasCasas, indiceCasa + 1, novasEnergias, memo, dadosCasas, dadosCavaleiros, preCalculoPoder);

    if (tempoRestante !== Infinity) {
      const total = tempoBatalha + tempoRestante;
      if (total < melhorTempo) melhorTempo = total;
    }
  }

  memo.set(chave, melhorTempo);
  return melhorTempo;
}

function reconstruir(ordemDasCasas, energiasIniciais, memo, dadosCasas, dadosCavaleiros, preCalculoPoder) {
  const escalacoes = [];
  let energias = [...energiasIniciais];
  const totalSubconjuntos = preCalculoPoder.length - 1;
  const numCavs = dadosCavaleiros.length;

  for (let i = 0; i < ordemDasCasas.length; i++) {
    const numCasa = ordemDasCasas[i];
    const dificuldade = dadosCasas[numCasa].dificuldade;
    let melhorMascara = -1;
    let melhorTempoLocal = Infinity;

    for (let mascara = 1; mascara <= totalSubconjuntos; mascara++) {
      if (!mascaraValida(mascara, energias, numCavs)) continue;

      const tempoBatalha = dificuldade / preCalculoPoder[mascara];
      const novasEnergias = [...energias];
      for (let bit = 0; bit < numCavs; bit++) {
        if (mascara & (1 << bit)) novasEnergias[bit] -= ENERGIA_POR_BATALHA;
      }

      const chaveProx = gerarChaveMemo(i + 1, novasEnergias);
      let tempoFuturo = memo.get(chaveProx);
      
      if (i + 1 === ordemDasCasas.length) {
         tempoFuturo = novasEnergias.some(e => e > 0) ? 0 : Infinity;
      }

      if (tempoBatalha + tempoFuturo < melhorTempoLocal) {
        melhorTempoLocal = tempoBatalha + tempoFuturo;
        melhorMascara = mascara;
      }
    }

    const escalados = [];
    const novasEnergias = [...energias];
    for (let bit = 0; bit < numCavs; bit++) {
      if (melhorMascara & (1 << bit)) {
        escalados.push(dadosCavaleiros[bit].nome);
        novasEnergias[bit] -= ENERGIA_POR_BATALHA;
      }
    }

    escalacoes.push({
      numeroDaCasa: numCasa,
      nomeDaCasa: dadosCasas[numCasa].nome,
      dificuldade: dificuldade,
      cavaleirosEscalados: escalados,
      tempoDaBatalha: dificuldade / preCalculoPoder[melhorMascara]
    });
    energias = novasEnergias;
  }

  return { escalacoes, energiaFinal: energias };
}

function planejarBatalhas(ordemDasCasas, tempoDisp, configs = {}) {
  const cavaleiros = configs.cavaleiros || PADRAO_CAVALEIROS;
  const casas = configs.casas || PADRAO_CASAS;

  const numCavs = cavaleiros.length;
  const totalSub = (1 << numCavs) - 1;

  const poderes = new Array(totalSub + 1).fill(0);
  for (let m = 1; m <= totalSub; m++) {
    for (let bit = 0; bit < numCavs; bit++) {
      if (m & (1 << bit)) poderes[m] += Number(cavaleiros[bit].poderCosmico);
    }
  }

  const energiasIniciais = cavaleiros.map(() => ENERGIA_INICIAL);
  const memo = new Map();

  const tempoTotal = dfs(ordemDasCasas, 0, energiasIniciais, memo, casas, cavaleiros, poderes);

  if (tempoTotal === Infinity) return null;

  const { escalacoes, energiaFinal } = reconstruir(ordemDasCasas, energiasIniciais, memo, casas, cavaleiros, poderes);
  
  const vivos = [], mortos = [];
  cavaleiros.forEach((c, i) => {
    if (energiaFinal[i] > 0) vivos.push(c.nome);
    else mortos.push(c.nome);
  });

  return {
    escalacoes,
    tempoTotalDeBatalhas: tempoTotal,
    cavaleirosVivos: vivos,
    cavaleirosQueMorreram: mortos,
    dentroDoLimite: tempoTotal <= tempoDisp
  };
}

module.exports = { planejarBatalhas, PADRAO_CAVALEIROS, PADRAO_CASAS };