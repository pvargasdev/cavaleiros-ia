import React from 'react'

function Status({ tipo, dadosIa }) {
  
  if (tipo === 'geral') {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-bold mb-2 text-gray-300">Outros Status / Batalhas</h2>
        <div className="flex-1 bg-gray-900 p-3 rounded-md text-sm font-mono text-green-400">
          <p>{'>'} Custo Total Atual: {dadosIa ? `${dadosIa.tempo_total} min` : ''}</p>
          <p>{'>'} Nodos Visitados: {dadosIa ? 'Calculado' : ''}</p>
          <p>{'>'} Status da Missão: {dadosIa?.sucesso ? 'Atena Salva' : 'Em andamento'}</p>
        </div>
      </div>
    )
  }

  if (tipo === 'personagens') {
    return (
      <div className="flex flex-col h-full overflow-y-auto pr-2">
        
        {/* 5 Cavaleiros de Bronze com 5 pontos de energia */}
        <h2 className="text-lg font-bold mb-2 text-gray-300">Energia dos Cavaleiros</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm mb-4">
          
        </div>

        {/* 12 Cavaleiros de Ouro */}
        <h2 className="text-lg font-bold mb-2 text-gray-300 border-t border-gray-600 pt-2">
          Status dos 12 Cavaleiros de Ouro
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map((casa, index) => {
            
            // Lógica para verificar se o cavaleiro foi derrotado pela IA
            let foiDerrotado = false;
            
            if (dadosIa && dadosIa.batalhas) {
              // Remove acentos e deixa minúsculo
              const nomeCasaLimpo = casa.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
              
              // Busca no array de batalhas do backend se há alguma vitória nessa casa
              foiDerrotado = dadosIa.batalhas.some(batalha => {
                const localLimpo = batalha.local.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return localLimpo.includes(nomeCasaLimpo) && batalha.venceu;
              });
            }

            return (
              <div key={index} className="bg-gray-800 p-2 rounded border border-gray-600 flex justify-between">
                <span className="text-gray-300">{casa}</span>

                {/* Renderização Condicional com base na variável foiDerrotado */}
                <span className={`font-bold ${foiDerrotado ? 'text-gray-500 line-through' : 'text-red-400'}`}>
                  {foiDerrotado ? 'Derrotado' : 'Vivo'}
                </span> 
              </div>
            )
          })}
        </div>

      </div>
    )
  }

  return null
}

export default Status