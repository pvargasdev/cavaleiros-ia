import React from 'react'

function Status({ tipo, dadosIa }) {
  
  // Proteção: Se não tiver dados ainda, não renderiza nada complexo
  if (!dadosIa && tipo === 'geral') {
    return (
      <div className="flex flex-col h-full p-2">
        <h2 className="text-lg font-bold mb-2 text-gray-500">Aguardando dados...</h2>
      </div>
    )
  }

  if (tipo === 'geral') {
    return (
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-bold mb-2 text-gray-300">Resumo da Missão</h2>
        <div className="flex-1 bg-gray-900 p-3 rounded-md text-sm font-mono text-green-400 border border-gray-700">
          <p>{'>'} Tempo Total: <span className="text-white">{dadosIa?.tempo_total ?? 0} min</span></p>
          <p>{'>'} Passos: <span className="text-white">{dadosIa?.caminho?.length ?? 0}</span></p>
          <p>{'>'} Status: {dadosIa?.sucesso ? <span className="text-blue-400">ATENA SALVA!</span> : <span className="text-red-500">FALHA NA MISSÃO</span>}</p>
          
          {/* Mostra detalhes extras se existirem */}
          {dadosIa?.detalhes && (
             <div className="mt-2 pt-2 border-t border-gray-800 text-xs text-gray-500">
                <p>Caminhada: {dadosIa.detalhes.tempo_caminhada} min</p>
                <p>Vivos: {dadosIa.detalhes.cavaleiros_vivos?.join(', ')}</p>
                <p>Mortos: {dadosIa.detalhes.cavaleiros_mortos?.join(', ')}</p>
             </div>
          )}
        </div>
      </div>
    )
  }

  if (tipo === 'personagens') {
    return (
      <div className="flex flex-col h-full overflow-y-auto pr-2">
        <h2 className="text-lg font-bold mb-2 text-gray-300">Status dos 12 Cavaleiros de Ouro</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map((casa, index) => {
            
            let foiDerrotado = false;
            
            // Lógica blindada contra erros de renderização
            if (dadosIa?.batalhas && Array.isArray(dadosIa.batalhas)) {
              const nomeCasaLimpo = (casa || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
              
              foiDerrotado = dadosIa.batalhas.some(batalha => {
                // Garante que batalha.local existe antes de tentar normalizar
                const localStr = batalha.local || ""; 
                const localLimpo = localStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return localLimpo.includes(nomeCasaLimpo) && batalha.venceu;
              });
            }

            return (
              <div key={index} className={`p-2 rounded border flex justify-between transition-colors ${foiDerrotado ? 'bg-gray-800 border-gray-700 opacity-50' : 'bg-gray-800 border-red-900/50'}`}>
                <span className="text-gray-300">{casa}</span>
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