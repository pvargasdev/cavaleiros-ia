/**
 * src/logica/controlador.js
 */
const { navegar } = require('./navegador');
const { planejarBatalhas } = require('./estrategista');

const TEMPO_MAXIMO_MINUTOS = 720; // 12 horas

function processarDadosDoJogo(csvConteudo) {
  // 1. Executa o Navegador (A*)
  const resultadoNavegacao = navegar(csvConteudo);

  if (!resultadoNavegacao) {
    throw new Error("Não foi possível calcular um caminho válido no mapa fornecido.");
  }

  // 2. Calcula tempo restante
  const tempoRestante = TEMPO_MAXIMO_MINUTOS - resultadoNavegacao.tempoDePercurso;
  
  // 3. Executa o Estrategista (DFS / Batalhas)
  // Só executa se houver tempo sobrando
  let resultadoBatalhas = null;
  if (tempoRestante > 0) {
    resultadoBatalhas = planejarBatalhas(
      resultadoNavegacao.casasEmOrdem, 
      tempoRestante
    );
  }

  // 4. Formata o JSON Final para o React
  const jsonFinal = {
    sucesso: resultadoBatalhas ? resultadoBatalhas.dentroDoLimite : false,
    tempo_total: parseFloat((resultadoNavegacao.tempoDePercurso + (resultadoBatalhas?.tempoTotalDeBatalhas || 0)).toFixed(2)),
    caminho: resultadoNavegacao.caminho,
    batalhas: resultadoBatalhas ? resultadoBatalhas.escalacoes.map(b => ({
      local: b.nomeDaCasa,
      venceu: true, // Se o estrategista retornou, é porque venceu essa etapa
      cavaleiros_escolhidos: b.cavaleirosEscalados,
      tempo_batalha: parseFloat(b.tempoDaBatalha.toFixed(2))
    })) : [],
    // Dados extras para debug ou exibição avançada
    detalhes: {
      tempo_caminhada: resultadoNavegacao.tempoDePercurso,
      cavaleiros_vivos: resultadoBatalhas?.cavaleirosVivos || [],
      cavaleiros_mortos: resultadoBatalhas?.cavaleirosQueMorreram || []
    }
  };

  return jsonFinal;
}

module.exports = { processarDadosDoJogo };