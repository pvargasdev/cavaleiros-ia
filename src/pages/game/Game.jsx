import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Mapa from '../../components/mapa/Mapa'
import Caminho from '../../components/caminho/Caminho'
import Status from '../../components/status/Status'

function Game() {
  const location = useLocation()
  const navigate = useNavigate()

  // Estados para guardar os textos lidos dos arquivos
  const [csvMapaData, setCsvMapaData] = useState(null)
  const [csvChefesData, setCsvChefesData] = useState(null)
  
  // Estado para guardar o JSON retornado pelo backend
  const [resultadoIA, setResultadoIA] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const { 
    arquivoMapa, mapaPersonalizado,
    arquivoChefes, chefesPersonalizados 
  } = location.state || {}

  useEffect(() => {
    if (!location.state) {
      navigate('/')
      return
    }

    // Função assíncrona para ler um arquivo usando FileReader
    const lerArquivo = (arquivo) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsText(arquivo)
      })
    }

    const prepararDados = async () => {
      let mapaTexto = null
      let chefesTexto = null

      // Lê o mapa se for personalizado
      if (mapaPersonalizado && arquivoMapa) {
        mapaTexto = await lerArquivo(arquivoMapa)
        setCsvMapaData(mapaTexto)
      }

      // Lê os chefes se for personalizado
      if (chefesPersonalizados && arquivoChefes) {
        chefesTexto = await lerArquivo(arquivoChefes)
        setCsvChefesData(chefesTexto)
      }

      // CHAMADA PARA O BACKEND VEM AQUI!
     
      // Simulação para remover o loading enquanto não tem backend
      setTimeout(() => setCarregando(false), 500)
    }

    prepararDados()

  }, [location.state, navigate, arquivoMapa, mapaPersonalizado, arquivoChefes, chefesPersonalizados])

  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Calculando rota com A*...
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen lg:h-screen bg-gray-900 text-white flex flex-col p-4 gap-4 overflow-y-auto lg:overflow-hidden">
      
      <div className="flex flex-col lg:flex-row flex-[2] gap-4 lg:min-h-0">
        <div className="flex-[3] min-h-[50vh] lg:min-h-0 bg-gray-800 border-2 border-gray-400 p-4 overflow-auto flex items-center justify-center relative">
          <Mapa csvPersonalizado={csvMapaData} />
        </div>
        <div className="flex-[1] min-h-[40vh] lg:min-h-0 bg-gray-800 border-2 border-gray-400 p-4 overflow-y-auto">
          {/* Vai se passar resultadoIA.caminho e resultadoIA.batalhas para preencher isso depois */}
          <Caminho dadosIa={resultadoIA} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-[1] gap-4 lg:min-h-0">
        <div className="flex-1 bg-gray-800 border-2 border-gray-400 p-4 overflow-y-auto">
          {/* Aqui vai se passar o resultadoIA.tempo_total */}
          <Status tipo="geral" dadosIa={resultadoIA} />
        </div>
        <div className="flex-1 bg-gray-800 border-2 border-gray-400 p-4 overflow-y-auto">
          <Status tipo="personagens" dadosIa={resultadoIA} />
        </div>
      </div>
    </div>
  )
}

export default Game