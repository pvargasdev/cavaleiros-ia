import React, { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// --- IMPORTAÇÕES CRITICAS (Verifique se as pastas batem com isso) ---
import Mapa from '../../components/mapa/Mapa'       // Verifica se é Mapa.jsx ou mapa.jsx
import Caminho from '../../components/caminho/Caminho'
import Status from '../../components/status/Status'
// -------------------------------------------------------------------

// Importa o mapa padrão como texto bruto (raw) para evitar erros de fetch
import mapaPadraoTxt from '../../assets/Mapa.csv?raw' 

function Game() {
  const location = useLocation()
  const navigate = useNavigate()

  // Estados
  const [csvMapaData, setCsvMapaData] = useState(null)
  const [resultadoIA, setResultadoIA] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  
  // Animação
  const [passoAtual, setPassoAtual] = useState(0)
  const velocidadeAnimacao = 100 

  const { arquivoMapa, mapaPersonalizado } = location.state || {}

  // Função para ler arquivo do input file
  const lerArquivoUpload = (arquivo) => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsText(arquivo)
  })

  useEffect(() => {
    // Se tentar acessar direto sem passar pela Home, volta
    if (!location.state) { navigate('/'); return }

    const processarJogo = async () => {
      try {
        setCarregando(true)
        setErro(null)
        let csvParaEnviar = '';

        // 1. CARREGAR O CSV
        if (mapaPersonalizado && arquivoMapa) {
          csvParaEnviar = await lerArquivoUpload(arquivoMapa)
        } else {
          // Usa o import do topo. Se falhar, string vazia.
          csvParaEnviar = mapaPadraoTxt || "";
        }

        console.log("CSV sendo enviado (primeiras 50 letras):", csvParaEnviar.slice(0, 50));

        if (!csvParaEnviar || csvParaEnviar.length < 10) {
             throw new Error("O arquivo de mapa está vazio ou não foi carregado corretamente.");
        }

        setCsvMapaData(csvParaEnviar)

        // 2. CHAMAR O ELECTRON (BACKEND)
        if (window.electronAPI) {
            const dadosCalculados = await window.electronAPI.calcularJogo(csvParaEnviar);
            setResultadoIA(dadosCalculados);
        } else {
            console.warn("Ambiente web detectado (sem Electron).");
            // Para testes na web (sem electron), você pode comentar a linha abaixo se quiser ver o layout vazio
            // throw new Error("Este jogo deve ser executado dentro do Electron.");
        }

      } catch (error) {
        console.error("Erro no Game.jsx:", error)
        setErro(error.message)
      } finally {
        setCarregando(false)
      }
    }

    processarJogo()
  }, [location.state, navigate, arquivoMapa, mapaPersonalizado])

  // Timer da animação
  useEffect(() => {
    let intervalo = null
    if (!erro && resultadoIA?.caminho && passoAtual < resultadoIA.caminho.length - 1) {
      intervalo = setInterval(() => {
        setPassoAtual((prev) => prev + 1)
      }, velocidadeAnimacao)
    }
    return () => clearInterval(intervalo)
  }, [resultadoIA, passoAtual, erro])

  // Dados visuais
  const dadosVisualizacao = useMemo(() => {
    if (!resultadoIA?.caminho) return { agente: null, rastro: [] }
    return { 
      agente: resultadoIA.caminho[passoAtual], 
      rastro: resultadoIA.caminho.slice(0, passoAtual + 1) 
    }
  }, [resultadoIA, passoAtual])

  // --- RENDERIZAÇÃO ---
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p>Processando Inteligência Artificial...</p>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white gap-6 p-8">
        <div className="text-red-500 text-6xl">⚠️</div>
        <h2 className="text-2xl font-bold">Erro de Execução</h2>
        <div className="bg-red-900/20 border border-red-500 p-6 rounded max-w-2xl text-center">
          <p className="text-red-200">{erro}</p>
        </div>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition">
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col p-4 gap-4 overflow-hidden">
      <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0 overflow-hidden">
        
        {/* O ERRO ESTAVA AQUI: O componente Mapa não estava importado */}
        <div className="flex-[3] bg-gray-800 border border-gray-600 p-2 rounded flex items-center justify-center overflow-hidden relative">
           <Mapa 
            csvPersonalizado={csvMapaData} 
            posicaoAgente={dadosVisualizacao.agente}
            rastro={dadosVisualizacao.rastro}
          />
        </div>

        <div className="flex-[1] bg-gray-800 border border-gray-600 p-2 rounded overflow-y-auto">
          <Caminho dadosIa={resultadoIA} passoAtual={passoAtual} />
        </div>
      </div>
      <div className="flex h-48 gap-4 shrink-0">
        <div className="flex-1 bg-gray-800 border border-gray-600 p-2 rounded overflow-y-auto">
          <Status tipo="geral" dadosIa={resultadoIA} />
        </div>
        <div className="flex-1 bg-gray-800 border border-gray-600 p-2 rounded overflow-y-auto">
          <Status tipo="personagens" dadosIa={resultadoIA} />
        </div>
      </div>
    </div>
  )
}

export default Game