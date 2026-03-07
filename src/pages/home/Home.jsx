import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
function Home() {
  const navigate = useNavigate() 

  // Guardam as decisões do usuário
  const [mapaPersonalizado, setMapaPersonalizado] = useState(null)
  const [chefesPersonalizados, setChefesPersonalizados] = useState(null)

  // Guardam os arquivos reais enviados pelo usuário através dos inputs
  const [arquivoMapa, setArquivoMapa] = useState(null)
  const [arquivoChefes, setArquivoChefes] = useState(null)

  // Captura o arquivo de mapa quando o usuário seleciona algo no input file
  function handleMapaFile(e) {
    setArquivoMapa(e.target.files[0])
  }

  // Captura o arquivo de chefes
  function handleChefesFile(e) {
    setArquivoChefes(e.target.files[0])
  }

  // Acionada ao clicar em "Começar"
  function handleComecar() {
    // Redireciona para a rota '/game'
    // Isso nos permite enviar os arquivos pesados de uma página para a outra sem depender da URL
    navigate('/game', {
      state: {
        arquivoMapa,
        arquivoChefes,
        mapaPersonalizado,
        chefesPersonalizados
      }
    })
  }
  
  const perguntasRespondidas = mapaPersonalizado !== null && chefesPersonalizados !== null

  const mapaOk = mapaPersonalizado === false || arquivoMapa
  
  const chefesOk = chefesPersonalizados === false || arquivoChefes
  
  const podeComecar = perguntasRespondidas && mapaOk && chefesOk


  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="flex flex-col items-center bg-gray-700 w-full max-w-md rounded-xl p-8 shadow-lg">
        
        <div className="px-6 py-3">
          <h1 className="text-5xl font-semibold text-white mb-4">Bem-vindo</h1>
        </div>

        <form className="flex flex-col items-center w-full gap-8">
          <h3 className="text-white text-lg font-medium">
            Escolha como começar
          </h3>

          {/* Mapa */}
          <div className="flex flex-col items-center w-full gap-3">
            <h3 className="text-gray-200 text-sm">
              Deseja um mapa personalizado?
            </h3>

            {/* Botões de seleção */}
            <div className="flex gap-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition shadow
                ${
                  mapaPersonalizado === true
                    ? 'bg-blue-500 text-white' // Botão ativo
                    : 'bg-gray-300 hover:bg-gray-400' // Botão inativo
                }`}
                onClick={() => setMapaPersonalizado(true)}
              >
                Sim
              </button>

              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition shadow
                ${
                  mapaPersonalizado === false
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setMapaPersonalizado(false)}
              >
                Não
              </button>
            </div>

            {/* Container do Input de Mapa  */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                mapaPersonalizado === true
                  ? 'grid-rows-[1fr] opacity-100 mt-2'
                  : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none' 
              }`}
            >
              <div className="overflow-hidden flex flex-col items-center gap-1">
                <label className="cursor-pointer text-blue-400 text-sm border border-dashed border-blue-400 px-4 py-2 rounded-md hover:bg-blue-400/10 transition mt-1">
                  Importar CSV do mapa
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleMapaFile}
                  />
                </label>

                {/* Feedback visual com o nome do arquivo enviado */}
                {arquivoMapa && (
                  <p className="text-xs text-gray-300 mt-1">{arquivoMapa.name}</p>
                )}
              </div>
            </div>
          </div>


          {/* Chefes */}
          <div className="flex flex-col items-center w-full gap-3">
            <h3 className="text-gray-200 text-sm">
              Deseja personalizar os status dos Chefes?
            </h3>

            {/* Botões de seleção */}
            <div className="flex gap-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition shadow
                ${
                  chefesPersonalizados === true
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setChefesPersonalizados(true)}
              >
                Sim
              </button>

              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium transition shadow
                ${
                  chefesPersonalizados === false
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setChefesPersonalizados(false)}
              >
                Não
              </button>
            </div>

            {/* Container do Input de Chefes */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                chefesPersonalizados === true
                  ? 'grid-rows-[1fr] opacity-100 mt-2'
                  : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
              }`}
            >
              <div className="overflow-hidden flex flex-col items-center gap-1">
                <label className="cursor-pointer text-blue-400 text-sm border border-dashed border-blue-400 px-4 py-2 rounded-md hover:bg-blue-400/10 transition mt-1">
                  Importar CSV dos chefes
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleChefesFile}
                  />
                </label>

                {/* Feedback visual com o nome do arquivo enviado */}
                {arquivoChefes && (
                  <p className="text-xs text-gray-300 mt-1">{arquivoChefes.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botão de submit  */}
          <button
            type="button"
            disabled={!podeComecar}
            onClick={handleComecar}
            className={`px-6 py-2 rounded-lg font-medium shadow transition
            ${
              podeComecar
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
          >
            Começar
          </button>
        </form>
      </div>
    </main>
  )
}

export default Home