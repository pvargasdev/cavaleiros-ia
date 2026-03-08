'use strict';
const fs = require('fs');
const { TERRENOS } = require('../constantes');

const MAPA_CUSTOS = {
  [TERRENOS.MONTANHOSO.id]: TERRENOS.MONTANHOSO.custo,
  [TERRENOS.PLANO.id]: TERRENOS.PLANO.custo,
  [TERRENOS.ROCHOSO.id]: TERRENOS.ROCHOSO.custo,
  [TERRENOS.INICIO.id]: TERRENOS.INICIO.custo,
  [TERRENOS.FIM.id]: TERRENOS.FIM.custo
};

function obterCustoMovimento(celula) {
  const numero = Number(celula);
  if (MAPA_CUSTOS[numero] !== undefined) return MAPA_CUSTOS[numero];
  if (numero >= 1 && numero <= 12) return TERRENOS.CUSTO_MOVIMENTO_CASA;
  return 1;
}

function lerMapa(conteudoOuCaminho) {
  let conteudo = conteudoOuCaminho;
  try {
    if (typeof conteudoOuCaminho === 'string' && !conteudoOuCaminho.includes('\n') && conteudoOuCaminho.length < 255 && fs.existsSync(conteudoOuCaminho)) {
      conteudo = fs.readFileSync(conteudoOuCaminho, 'utf-8');
    }
  } catch (e) {}

  if (!conteudo) throw new Error("Conteúdo do mapa não fornecido.");

  const grade = conteudo.trim().split('\n').map(l => l.split(/[;,]/).map(c => c.trim()));

  if (grade.length !== 42) {
    throw new Error(`Dimensão inválida: O mapa deve ter 42 linhas. (Atual: ${grade.length})`);
  }

  let contagemInicio = 0;
  let contagemFim = 0;
  let casasEncontradas = new Set();
  let inicio = null, objetivo = null, casas = {};

  for (let l = 0; l < grade.length; l++) {
    if (grade[l].length !== 42) {
      throw new Error(`Dimensão inválida: A linha ${l} deve ter 42 colunas.`);
    }

    for (let c = 0; c < grade[l].length; c++) {
      const num = Number(grade[l][c]);
      
      if (isNaN(num) || num < 0 || num > 16) {
        throw new Error(`Valor inválido encontrado na posição [${l},${c}]: ${grade[l][c]}`);
      }

      if (num === TERRENOS.INICIO.id) {
        contagemInicio++;
        inicio = [l, c];
      } else if (num === TERRENOS.FIM.id) {
        contagemFim++;
        objetivo = [l, c];
      } else if (num >= 1 && num <= 12) {
        if (casasEncontradas.has(num)) {
          throw new Error(`A Casa ${num} aparece mais de uma vez no mapa.`);
        }
        casasEncontradas.add(num);
        casas[num] = [l, c];
      }
    }
  }

  if (contagemInicio !== 1) throw new Error(`O mapa deve ter exatamente UM ponto de início (0). Encontrados: ${contagemInicio}`);
  if (contagemFim !== 1) throw new Error(`O mapa deve ter exatamente UM ponto de chegada (13). Encontrados: ${contagemFim}`);
  
  for (let i = 1; i <= 12; i++) {
    if (!casasEncontradas.has(i)) throw new Error(`A Casa do Zodíaco ${i} está faltando no mapa.`);
  }

  const casasOrdenadas = Object.keys(casas).map(Number).sort((a, b) => a - b);
  return { grade, inicio, objetivo, casas, casasOrdenadas };
}

function distanciaManhattan(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function estrelaA(grade, origem, destino) {
  const totalL = grade.length;
  const totalC = grade[0].length;
  const chave = (l, c) => l * totalC + c;
  const fila = [{ f: 0, g: 0, l: origem[0], c: origem[1] }];
  const custoAcumulado = new Map([[chave(origem[0], origem[1]), 0]]);
  const veioDE = new Map();
  const visitados = new Set();
  const direcoes = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (fila.length > 0) {
    fila.sort((a, b) => a.f - b.f);
    const no = fila.shift();
    const { l, c, g } = no;
    const atual = chave(l, c);
    if (visitados.has(atual)) continue;
    visitados.add(atual);
    if (l === destino[0] && c === destino[1]) {
      const caminho = [];
      let k = atual;
      while (k !== undefined) {
        caminho.unshift([Math.floor(k / totalC), k % totalC]);
        k = veioDE.get(k);
      }
      return { caminho, custo: g };
    }
    for (let dir of direcoes) {
      const nl = l + dir[0], nc = c + dir[1];
      if (nl < 0 || nl >= totalL || nc < 0 || nc >= totalC) continue;
      const vizinhoChave = chave(nl, nc);
      if (visitados.has(vizinhoChave)) continue;
      const custoNovo = g + obterCustoMovimento(grade[nl][nc]);
      const custoAntigo = custoAcumulado.get(vizinhoChave) ?? Infinity;
      if (custoNovo < custoAntigo) {
        custoAcumulado.set(vizinhoChave, custoNovo);
        veioDE.set(vizinhoChave, atual);
        fila.push({
          f: custoNovo + distanciaManhattan([nl, nc], destino),
          g: custoNovo,
          l: nl, c: nc
        });
      }
    }
  }
  throw new Error("Caminho impossível entre os pontos.");
}

function encontrarCaminhoCompleto(grade, inicio, objetivo, casas, ordem) {
  const pontos = [inicio, ...ordem.map(n => casas[n]), objetivo];
  let caminhoTotal = [];
  let custoTotal = 0;
  for (let i = 0; i < pontos.length - 1; i++) {
    const res = estrelaA(grade, pontos[i], pontos[i+1]);
    const trecho = i === 0 ? res.caminho : res.caminho.slice(1);
    caminhoTotal.push(...trecho);
    custoTotal += res.custo;
  }
  return { caminho: caminhoTotal, tempoDePercurso: custoTotal };
}

function navegar(conteudoCsv) {
  try {
    const mapa = lerMapa(conteudoCsv);
    const res = encontrarCaminhoCompleto(mapa.grade, mapa.inicio, mapa.objetivo, mapa.casas, mapa.casasOrdenadas);
    return {
      caminho: res.caminho,
      tempoDePercurso: res.tempoDePercurso,
      casasEmOrdem: mapa.casasOrdenadas,
      casas: mapa.casas
    };
  } catch (e) {
    throw e;
  }
}

module.exports = { navegar, lerMapa, obterCustoMovimento };