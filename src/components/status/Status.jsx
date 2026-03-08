import React from 'react'
import { PADRAO_CAVALEIROS } from '../../constantes'

function Status({ tipo, dadosIa, batalhasRealizadas = [], passoAtual, custoReal, cavaleiros }) {
  const listaHerois = (cavaleiros && cavaleiros.length > 0) ? cavaleiros : (PADRAO_CAVALEIROS || [])

  if (!dadosIa && tipo === 'geral') return null

  if (tipo === 'geral') {
    const totalPassos = dadosIa?.caminho?.length || 0
    const chegouAoFim = passoAtual >= totalPassos - 1
    const custoDisplay = typeof custoReal === 'number' ? custoReal.toFixed(1) : "0.0"

    return (
      <div className="flex flex-col h-full gap-2 font-mono">
        <h2 className="text-lg font-bold text-gray-300 border-b border-gray-600 pb-1">ESTATÍSTICAS</h2>
        <div className="flex-1 flex flex-col gap-2">
            <div className="bg-gray-800 p-2 border border-white text-sm">
                <p className="text-gray-400 uppercase mb-1">Situação:</p>
                {chegouAoFim ? (
                    dadosIa.sucesso ? 
                    <span className="text-green-400 font-bold text-xl"> SUCESSO</span> : 
                    <span className="text-red-500 font-bold text-xl"> FRACASSO</span>
                ) : (
                    <span className="text-blue-400 font-bold text-xl"> EM ANDAMENTO</span>
                )}
            </div>
            <div className="bg-gray-800 p-2 border border-white text-sm">
                <p className="text-gray-400 uppercase mb-1">Custo Total:</p>
                <p className="text-white text-2xl font-bold">{custoDisplay} min</p>
            </div>
        </div>
      </div>
    )
  }

  if (tipo === 'personagens') {
    return (
      <div className="flex flex-col h-full font-mono">
        <h2 className="text-lg font-bold mb-2 text-gray-300 border-b border-gray-600 pb-1">PERSONAGENS</h2>
        <div className="grid grid-cols-5 gap-2 h-full">
          {listaHerois.map((heroi) => {
            let dano = 0
            batalhasRealizadas.forEach(b => {
                if (b.cavaleiros_escolhidos && b.cavaleiros_escolhidos.includes(heroi.nome)) {
                    dano += 1
                }
            })
            const vida = 5 - dano
            const estaMorto = vida <= 0
            const barras = []
            for(let i=0; i<5; i++) {
                barras.push(<div key={i} className={`h-3 w-3 border border-black ${i < vida ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>)
            }
            return (
              <div key={heroi.nome} className={`bg-gray-800 border-2 ${estaMorto ? 'border-red-600' : 'border-gray-500'} p-2 flex flex-col items-center justify-between`}>
                <div className="text-center">
                    <span className={`font-bold block ${estaMorto ? 'text-red-500 line-through' : 'text-white'}`}>{heroi.nome}</span>
                    <span className="text-xs text-gray-400">PC: {Number(heroi.poderCosmico).toFixed(1)}</span>
                </div>
                <div className="flex gap-1 mt-1">{barras}</div>
                <div className="text-xs mt-1">{estaMorto ? 'MORTO' : `${vida}/5`}</div>
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