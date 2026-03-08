/**
 * src/logica/navegador.js
 * Versão Corrigida - Funções Globais
 */
'use strict';
const fs = require('fs');
const { TERRENOS } = require('../constantes');

const MAPA_CUSTOS = {
  [TERRENOS.MONTANHOSO.id]: TERRENOS.MONTANHOSO.custo,
  [TERRENOS.PLANO.id]:      TERRENOS.PLANO.custo,
  [TERRENOS.ROCHOSO.id]:    TERRENOS.ROCHOSO.custo,
  [TERRENOS.INICIO.id]:     TERRENOS.INICIO.custo,
  [TERRENOS.FIM.id]:        TERRENOS.FIM.custo
};

function obterCustoMovimento(celula) {
  const numero = Number(celula);
  if (MAPA_CUSTOS[numero] !== undefined) return MAPA_CUSTOS[numero];
  // Casas do Zodíaco (1 a 12)
  if (numero >= 1 && numero <= 12) return TERRENOS.CUSTO_MOVIMENTO_CASA;
  return 1; 
}

function distanciaManhattan(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// ─── 2. LEITURA DE MAPA ───

function lerMapa(conteudoOuCaminho) {
  let conteudo = conteudoOuCaminho;

  try {
    // Tenta ler arquivo apenas se for um caminho válido e curto
    if (typeof conteudoOuCaminho === 'string' && 
        !conteudoOuCaminho.includes('\n') && 
        conteudoOuCaminho.length < 255 && 
        fs.existsSync(conteudoOuCaminho)) {
      
      conteudo = fs.readFileSync(conteudoOuCaminho, 'utf-8');
    }
  } catch (e) {
    // Ignora erro de arquivo e assume que é string CSV
  }

  if (!conteudo || typeof conteudo !== 'string') {
    throw new Error('Conteúdo do mapa inválido ou vazio.');
  }

  const grade = conteudo
    .trim()
    .split('\n')
    .map(linha => linha.split(/[;,]/).map(c => c.trim()));

  if (grade.length < 1) throw new Error('Mapa vazio ou inválido.');

  let inicio = null, objetivo = null, casas = {};

  for (let l = 0; l < grade.length; l++) {
    for (let c = 0; c < grade[l].length; c++) {
      const num = Number(grade[l][c]);
      if (num === 0) inicio = [l, c];
      else if (num === 13) objetivo = [l, c];
      else if (num >= 1 && num <= 12) casas[num] = [l, c];
    }
  }

  if (!inicio) throw new Error('Inicio (0) não encontrado.');
  if (!objetivo) throw new Error('Objetivo (13) não encontrado.');

  const casasOrdenadas = Object.keys(casas).map(Number).sort((a, b) => a - b);

  return { grade, inicio, objetivo, casas, casasOrdenadas };
}

// ─── 3. ALGORITMO A* ───

function estrelaA(grade, origem, destino) {
  const totalL = grade.length;
  const totalC = grade[0].length;
  const chave = (l, c) => l * totalC + c;
  
  // Fila simples (array)
  const fila = [{ f: 0, g: 0, l: origem[0], c: origem[1] }];
  const custoAcumulado = new Map([[chave(origem[0], origem[1]), 0]]);
  const veioDE = new Map();
  const visitados = new Set();
  const direcoes = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (fila.length > 0) {
    // Ordena para simular Min-Heap (menor F primeiro)
    fila.sort((a, b) => a.f - b.f);
    const no = fila.shift(); 
    
    const { l, c, g } = no;
    const atual = chave(l, c);

    if (visitados.has(atual)) continue;
    visitados.add(atual);

    // Chegou no destino
    if (l === destino[0] && c === destino[1]) {
      const caminho = [];
      let k = atual;
      while (k !== undefined) {
        caminho.unshift([Math.floor(k / totalC), k % totalC]);
        k = veioDE.get(k);
      }
      return { caminho, custo: g };
    }

    // Vizinhos
    for (let dir of direcoes) {
      const nl = l + dir[0], nc = c + dir[1];
      
      // Verifica limites do mapa
      if (nl < 0 || nl >= totalL || nc < 0 || nc >= totalC) continue;
      
      const vizinhoChave = chave(nl, nc);
      if (visitados.has(vizinhoChave)) continue;

      // CÁLCULO DO CUSTO (Aqui estava o erro antes)
      const custoCelula = obterCustoMovimento(grade[nl][nc]);
      const custoNovo = g + custoCelula;
      
      const custoAntigo = custoAcumulado.has(vizinhoChave) ? custoAcumulado.get(vizinhoChave) : Infinity;

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
  throw new Error("Caminho bloqueado ou impossível.");
}

// ─── 4. ORQUESTRADOR ───

function encontrarCaminhoCompleto(grade, inicio, objetivo, casas, ordem) {
  const pontos = [inicio, ...ordem.map(n => casas[n]), objetivo];
  let caminhoTotal = [];
  let custoTotal = 0;

  for (let i = 0; i < pontos.length - 1; i++) {
    const res = estrelaA(grade, pontos[i], pontos[i+1]);
    
    // Concatena caminho (removendo o primeiro ponto para não duplicar, exceto no inicio)
    const trecho = i === 0 ? res.caminho : res.caminho.slice(1);
    caminhoTotal.push(...trecho);
    custoTotal += res.custo;
  }

  return { caminho: caminhoTotal, tempoDePercurso: custoTotal };
}

// ─── 5. FUNÇÃO PRINCIPAL EXPORTADA ───

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
    console.error("Erro Navegador:", e.message);
    // Retorna null para o controlador saber que falhou
    return null;
  }
}

module.exports = { navegar, lerMapa, obterCustoMovimento };