import ProjectTabs from "../components/ProjectTabs"

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-gray-200 mx-auto p-4 ">
      <h1 className="text-4xl font-bold text-red-800 mb-4">RedeFlex Controle de Atividade</h1>
      <ProjectTabs />
    </main>
  )
}

