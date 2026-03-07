/**
 * navegador.js  -  Desenvolvedor 1: O Navegador
 *
 * Responsabilidades:
 *   - Leitura do mapa a partir de mapa.csv (42 x 42)
 *   - Custos de terreno: Plano +1 | Rochoso +5 | Montanhoso +200
 *   - Movimento: somente vertical e horizontal (sem diagonal)
 *   - A* com heuristica Distancia de Manhattan
 *   - Visita obrigatoria as 12 Casas em ordem (1->2->...->12->Objetivo)
 *
 * Interface para o Desenvolvedor 2 / index.js:
 *
 *   const { navegar } = require('./navegador');
 *   const resultado = navegar('./mapa.csv');
 *
 *   resultado = {
 *     caminho         : Array<[linha, coluna]>,
 *     tempoDePercurso : number,   (minutos gastos SO na caminhada)
 *     casas           : { [n: 1..12]: [linha, coluna] },
 *     casasEmOrdem    : number[], ([1,2,3,...,12])
 *   }
 *
 * Formato do CSV:
 *   M = Montanhoso (+200 min)   P = Plano (+1 min)   R = Rochoso (+5 min)
 *   S = Inicio (entrada)        G = Objetivo (Grande Mestre)
 *   1-12 = Casa do Zodiaco (custo de movimento = plano)
 */

'use strict';

const fs = require('fs');

// ─── CUSTOS DE TERRENO (facilmente editaveis) ───────────────────────────────
const CUSTO_TERRENO = {
  P: 1,    // Plano       - cinza medio
  R: 5,    // Rochoso     - cinza claro
  M: 200,  // Montanhoso  - cinza escuro
  S: 1,    // Inicio      - tratado como plano
  G: 1,    // Objetivo    - tratado como plano
};

function obterCustoMovimento(celula) {
  if (CUSTO_TERRENO[celula] !== undefined) return CUSTO_TERRENO[celula];
  const numero = Number(celula);
  if (!isNaN(numero) && numero >= 1 && numero <= 12) return 1;
  return 1;
}

// ─── LEITURA DO MAPA ────────────────────────────────────────────────────────
function lerMapa(caminhoArquivo) {
  const conteudo = fs.readFileSync(caminhoArquivo, 'utf-8');
  const grade = conteudo
    .trim()
    .split('\n')
    .map(function(linha) { return linha.split(',').map(function(c) { return c.trim(); }); });

  if (grade.length !== 42 || grade[0].length !== 42) {
    throw new Error('Mapa invalido: esperado 42x42, obtido ' + grade.length + 'x' + grade[0].length);
  }

  var inicio   = null;
  var objetivo = null;
  var casas    = {};

  for (var l = 0; l < grade.length; l++) {
    for (var c = 0; c < grade[l].length; c++) {
      var celula = grade[l][c];
      if      (celula === 'S') { inicio   = [l, c]; }
      else if (celula === 'G') { objetivo = [l, c]; }
      else {
        var numero = Number(celula);
        if (!isNaN(numero) && numero >= 1 && numero <= 12) casas[numero] = [l, c];
      }
    }
  }

  if (!inicio)   throw new Error('Inicio (S) nao encontrado no mapa.');
  if (!objetivo) throw new Error('Objetivo (G) nao encontrado no mapa.');

  var casasFaltando = [];
  for (var i = 1; i <= 12; i++) if (!casas[i]) casasFaltando.push(i);
  if (casasFaltando.length > 0) throw new Error('Casas faltando: ' + casasFaltando.join(', '));

  return { grade: grade, inicio: inicio, objetivo: objetivo, casas: casas };
}

// ─── FILA DE PRIORIDADE (Min-Heap) ──────────────────────────────────────────
function FilaDePrioridade() {
  this._dados = [];
}

FilaDePrioridade.prototype.inserir = function(no) {
  this._dados.push(no);
  this._subir(this._dados.length - 1);
};

FilaDePrioridade.prototype.removerMinimo = function() {
  var topo  = this._dados[0];
  var ultimo = this._dados.pop();
  if (this._dados.length > 0) { this._dados[0] = ultimo; this._descer(0); }
  return topo;
};

Object.defineProperty(FilaDePrioridade.prototype, 'tamanho', {
  get: function() { return this._dados.length; }
});

FilaDePrioridade.prototype._subir = function(i) {
  while (i > 0) {
    var pai = (i - 1) >> 1;
    if (this._dados[pai].f <= this._dados[i].f) break;
    var tmp = this._dados[pai]; this._dados[pai] = this._dados[i]; this._dados[i] = tmp;
    i = pai;
  }
};

FilaDePrioridade.prototype._descer = function(i) {
  var n = this._dados.length;
  while (true) {
    var menor = i;
    var esq = 2 * i + 1, dir = 2 * i + 2;
    if (esq < n && this._dados[esq].f < this._dados[menor].f) menor = esq;
    if (dir < n && this._dados[dir].f < this._dados[menor].f) menor = dir;
    if (menor === i) break;
    var tmp2 = this._dados[menor]; this._dados[menor] = this._dados[i]; this._dados[i] = tmp2;
    i = menor;
  }
};

// ─── HEURISTICA: Distancia de Manhattan ─────────────────────────────────────
function distanciaManhattan(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// ─── ALGORITMO A* ───────────────────────────────────────────────────────────
// Somente movimentos verticais e horizontais (sem diagonal)
var DIRECOES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function estrelaA(grade, origem, destino) {
  var totalLinhas  = grade.length;
  var totalColunas = grade[0].length;
  var chave        = function(l, c) { return l * totalColunas + c; };

  var custoAcumulado  = new Map([[chave(origem[0], origem[1]), 0]]);
  var veioDE          = new Map();
  var conjuntoFechado = new Set();
  var fila            = new FilaDePrioridade();

  fila.inserir({ f: distanciaManhattan(origem, destino), g: 0, l: origem[0], c: origem[1] });

  while (fila.tamanho > 0) {
    var no    = fila.removerMinimo();
    var g = no.g, l = no.l, c = no.c;
    var atual = chave(l, c);

    if (conjuntoFechado.has(atual)) continue;
    conjuntoFechado.add(atual);

    // Chegou ao destino: reconstroi o caminho
    if (l === destino[0] && c === destino[1]) {
      var caminho = [];
      var k = atual;
      while (k !== undefined) {
        caminho.unshift([Math.floor(k / totalColunas), k % totalColunas]);
        k = veioDE.get(k);
      }
      return { caminho: caminho, custo: g };
    }

    // Expande vizinhos (cima, baixo, esquerda, direita)
    for (var d = 0; d < DIRECOES.length; d++) {
      var nl = l + DIRECOES[d][0], nc = c + DIRECOES[d][1];
      if (nl < 0 || nl >= totalLinhas || nc < 0 || nc >= totalColunas) continue;

      var chaveVizinho   = chave(nl, nc);
      if (conjuntoFechado.has(chaveVizinho)) continue;

      var custoTentativo = g + obterCustoMovimento(grade[nl][nc]);
      var custoAnterior  = custoAcumulado.has(chaveVizinho) ? custoAcumulado.get(chaveVizinho) : Infinity;

      if (custoTentativo < custoAnterior) {
        custoAcumulado.set(chaveVizinho, custoTentativo);
        veioDE.set(chaveVizinho, atual);
        fila.inserir({
          f: custoTentativo + distanciaManhattan([nl, nc], destino),
          g: custoTentativo,
          l: nl,
          c: nc,
        });
      }
    }
  }

  return null; // Sem caminho encontrado
}

// ─── CAMINHO ENCADEADO ───────────────────────────────────────────────────────
// Inicio -> Casa 1 -> Casa 2 -> ... -> Casa 12 -> Objetivo
function encontrarCaminhoCompleto(grade, inicio, objetivo, casas, ordemDasVisitas) {
  if (!ordemDasVisitas) ordemDasVisitas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  var pontosDePassagem = [inicio];
  for (var x = 0; x < ordemDasVisitas.length; x++) pontosDePassagem.push(casas[ordemDasVisitas[x]]);
  pontosDePassagem.push(objetivo);

  var caminhoTotal = [];
  var custoTotal   = 0;
  var segmentos    = [];

  for (var i = 0; i < pontosDePassagem.length - 1; i++) {
    var origem  = pontosDePassagem[i];
    var destino = pontosDePassagem[i + 1];
    var resultado = estrelaA(grade, origem, destino);

    if (!resultado) {
      var rotulo;
      if (i === 0) rotulo = 'Entrada->Casa ' + ordemDasVisitas[0];
      else if (i === pontosDePassagem.length - 2) rotulo = 'Casa ' + ordemDasVisitas[i-1] + '->Grande Mestre';
      else rotulo = 'Casa ' + ordemDasVisitas[i-1] + '->Casa ' + ordemDasVisitas[i];
      throw new Error('Sem caminho no segmento: ' + rotulo);
    }

    // Evita duplicar o ponto de inicio de cada segmento
    var trecho = i === 0 ? resultado.caminho : resultado.caminho.slice(1);
    for (var t = 0; t < trecho.length; t++) caminhoTotal.push(trecho[t]);
    custoTotal += resultado.custo;

    var rotuloSeg;
    if (i === 0) rotuloSeg = 'Entrada -> Casa 1';
    else if (i === pontosDePassagem.length - 2) rotuloSeg = 'Casa ' + ordemDasVisitas[i-1] + ' -> Grande Mestre';
    else rotuloSeg = 'Casa ' + ordemDasVisitas[i-1] + ' -> Casa ' + ordemDasVisitas[i];

    segmentos.push({ rotulo: rotuloSeg, passos: resultado.caminho.length, custo: resultado.custo });
  }

  return { caminho: caminhoTotal, tempoDePercurso: custoTotal, segmentos: segmentos };
}

// ─── VISUALIZACAO NO CONSOLE ─────────────────────────────────────────────────
var SIMBOLOS_TERRENO = { M: '#', R: '.', P: ' ', S: 'S', G: 'G' };

function visualizarCaminho(grade, caminho, casas) {
  var totalColunas    = grade[0].length;
  var conjuntoCaminho = new Set();
  for (var p = 0; p < caminho.length; p++) conjuntoCaminho.add(caminho[p][0] * totalColunas + caminho[p][1]);

  var posicaoCasa = new Map();
  var chaves = Object.keys(casas);
  for (var x = 0; x < chaves.length; x++) {
    var n = chaves[x];
    posicaoCasa.set(casas[n][0] * totalColunas + casas[n][1], n);
  }

  console.log('+' + '-'.repeat(totalColunas) + '+');
  for (var l = 0; l < grade.length; l++) {
    var linha = '|';
    for (var c = 0; c < grade[l].length; c++) {
      var chv    = l * totalColunas + c;
      var celula = grade[l][c];
      if      (celula === 'S')           linha += 'S';
      else if (celula === 'G')           linha += 'G';
      else if (posicaoCasa.has(chv))     linha += String(posicaoCasa.get(chv)).slice(-1);
      else if (conjuntoCaminho.has(chv)) linha += '*';
      else                               linha += (SIMBOLOS_TERRENO[celula] !== undefined ? SIMBOLOS_TERRENO[celula] : celula);
    }
    linha += '|';
    console.log(linha);
  }
  console.log('+' + '-'.repeat(totalColunas) + '+');
}

// ─── FUNCAO PRINCIPAL ────────────────────────────────────────────────────────
function navegar(caminhoArquivo) {
  if (!caminhoArquivo) caminhoArquivo = './mapa.csv';

  console.log('='.repeat(55));
  console.log('  NAVEGADOR  -  Cavaleiros de Bronze  (A*)');
  console.log('='.repeat(55));

  // 1. Carrega o mapa do arquivo CSV
  var mapa = lerMapa(caminhoArquivo);
  var grade    = mapa.grade;
  var inicio   = mapa.inicio;
  var objetivo = mapa.objetivo;
  var casas    = mapa.casas;

  console.log('\nMapa carregado: ' + grade.length + 'x' + grade[0].length);
  console.log('Inicio  : [' + inicio + ']');
  console.log('Objetivo: [' + objetivo + ']');

  // 2. Executa A* encadeado pelas 12 casas em ordem
  var tempoInicio = Date.now();
  var resultado;
  try {
    resultado = encontrarCaminhoCompleto(grade, inicio, objetivo, casas);
  } catch (erro) {
    console.error('\nERRO: ' + erro.message);
    return null;
  }
  var tempoExecucao = Date.now() - tempoInicio;

  var caminho          = resultado.caminho;
  var tempoDePercurso  = resultado.tempoDePercurso;
  var segmentos        = resultado.segmentos;
  var casasEmOrdem     = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // 3. Exibe resultados
  console.log('\nA* encadeado concluido em ' + tempoExecucao + ' ms');
  console.log('Total de passos no caminho : ' + caminho.length);
  console.log('Tempo de percurso          : ' + tempoDePercurso + ' minutos');

  console.log('\nSegmentos do percurso:');
  for (var s = 0; s < segmentos.length; s++) {
    var seg = segmentos[s];
    console.log('  ' + seg.rotulo.padEnd(35) + '| ' + seg.passos + ' passos | ' + seg.custo + ' min');
  }

  console.log('\nOrdem de visita: Entrada -> ' + casasEmOrdem.join(' -> ') + ' -> Grande Mestre');

  // 4. Visualiza o mapa com o caminho marcado
  visualizarCaminho(grade, caminho, casas);

  // 5. Exibe o caminho completo (coordenadas)
  console.log('\nCaminho percorrido (coordenadas):');
  var tamanhoBloco = 8;
  for (var i = 0; i < caminho.length; i += tamanhoBloco) {
    var bloco = caminho.slice(i, i + tamanhoBloco).map(function(pos) { return '[' + pos[0] + ',' + pos[1] + ']'; });
    console.log(bloco.join(' -> ') + (i + tamanhoBloco < caminho.length ? ' ->' : ''));
  }

  console.log('\nCUSTO TOTAL DO PERCURSO: ' + tempoDePercurso + ' minutos');

  // 6. Retorna os dados para o Desenvolvedor 2 / index.js
  return {
    caminho        : caminho,
    tempoDePercurso: tempoDePercurso,
    casas          : casas,
    casasEmOrdem   : casasEmOrdem,
  };
}

// ─── EXPORTACOES ─────────────────────────────────────────────────────────────
module.exports = {
  navegar                : navegar,
  lerMapa                : lerMapa,
  estrelaA               : estrelaA,
  encontrarCaminhoCompleto: encontrarCaminhoCompleto,
  visualizarCaminho      : visualizarCaminho,
  obterCustoMovimento    : obterCustoMovimento,
};

// Executa direto se chamado como: node navegador.js
if (require.main === module) {
  navegar('./mapa.csv');
}