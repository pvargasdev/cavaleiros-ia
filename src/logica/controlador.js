/**
 * src/logica/controlador.js
 */
const { navegar } = require('./navegador');
const { planejarBatalhas } = require('./estrategista');
const { TEMPO_MAXIMO_MINUTOS } = require('../constantes')

function processarDadosDoJogo(csvConteudo, configs = {}) {
  const resultadoNavegacao = navegar(csvConteudo);
  if (!resultadoNavegacao) throw new Error("Caminho não encontrado.");

  const tempoRestante = TEMPO_MAXIMO_MINUTOS - resultadoNavegacao.tempoDePercurso;
  
  let resultadoBatalhas = null;
  if (tempoRestante > 0) {
    resultadoBatalhas = planejarBatalhas(
      resultadoNavegacao.casasEmOrdem, 
      tempoRestante,
      configs
    );
  }

  return {
    sucesso: resultadoBatalhas ? resultadoBatalhas.dentroDoLimite : false,
    tempo_total: parseFloat((resultadoNavegacao.tempoDePercurso + (resultadoBatalhas?.tempoTotalDeBatalhas || 0)).toFixed(2)),
    caminho: resultadoNavegacao.caminho,
    
    batalhas: resultadoBatalhas ? resultadoBatalhas.escalacoes.map(b => ({
      local: b.nomeDaCasa,
      dificuldade: b.dificuldade,
      venceu: true,
      cavaleiros_escolhidos: b.cavaleirosEscalados,
      tempo_batalha: parseFloat(b.tempoDaBatalha.toFixed(2))
    })) : [],

    detalhes: {
      tempo_caminhada: resultadoNavegacao.tempoDePercurso,
      cavaleiros_vivos: resultadoBatalhas?.cavaleirosVivos || [],
      cavaleiros_mortos: resultadoBatalhas?.cavaleirosQueMorreram || []
    }
  };
}

module.exports = { processarDadosDoJogo };