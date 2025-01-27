"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import ProjectCard from "./ProjectCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { GitLabProject } from "../types/gitlab"

const projectIds = [221, 217, 224, 170, 181, 183, 201, 177, 26, 215] // projetos

export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState<number>(projectIds[0])

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery<GitLabProject[], Error>(
    "projects",
    async () => {
      const responses = await Promise.all(
        projectIds.map((id) =>
          fetch(`/api/project/${id}`).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
            return res.json()
          }),
        ),
      )
      return responses
    },
    {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  )

  if (isLoading) return <div>Carregando...</div>
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load projects: {error.message}.</AlertDescription>
      </Alert>
    )
  if (!projects || projects.length === 0) return <div>0 Projetos encontrados</div>

  return (
    <div>
      <div className="mb-4">
        {projects.map((project) => (
          <button
            key={project.id}
            className={`px-4 py-2 rounded-sm mr-2 ${activeTab === project.id ? "bg-red-800 text-white" : "bg-white"}`}
            onClick={() => setActiveTab(project.id)}
          >
            {project.name}
          </button>
        ))}
      </div>
      {projects.map((project) => (
        <div key={project.id} className= {activeTab === project.id ? "" : "hidden"}>
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  )
}

