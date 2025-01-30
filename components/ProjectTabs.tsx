"use client"

import { useState } from "react"
import { useQuery } from "react-query"
import ProjectCard from "./ProjectCard"
import HomeWeeklyView from "./HomeWeeklyView"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { GitLabProject } from "../types/gitlab"

const defaultProjectIds = [221, 217, 224, 170, 181, 183, 201, 177, 26, 215]

export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState<number | "home">("home")
  const [projectIds, setProjectIds] = useState<number[]>(defaultProjectIds)
  const [newProjectId, setNewProjectId] = useState<string>("")

  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useQuery<GitLabProject[], Error>(
    ["projects", projectIds],
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

  const removeProject = (id: number) => {
    setProjectIds((prev) => prev.filter((projectId) => projectId !== id))
    if (activeTab === id) {
      setActiveTab("home")
    }
  }

  const addProject = () => {
    const id = Number.parseInt(newProjectId)
    if (!isNaN(id) && !projectIds.includes(id)) {
      setProjectIds((prev) => [...prev, id])
      setNewProjectId("")
      refetch()
    }
  }

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
      <div className="mb-2 flex flex-wrap items-center">
        <button
          className={`px-4 py-2 hover:shadow-lg rounded-sm mr-2 mb-2 ${
            activeTab === "home" ? "bg-red-800 text-white" : "bg-white"
          }`}
          onClick={() => setActiveTab("home")}
        >
          <svg
            width={20}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            className={`${activeTab === "home" ? "fill-white" : "fill-black"} inline-block align-middle`}
          >
            <path d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z" />
          </svg>
          <span className="inline-block align-middle ml-1">Visão Geral</span>
        </button>
        {projects.map((project) => (
          <button
            key={project.id}
            className={`px-4 py-2 hover:shadow-lg rounded-sm mr-2 mb-2 relative group ${
              activeTab === project.id ? "bg-red-800 text-white" : "bg-white"
            }`}
            onClick={() => setActiveTab(project.id)}
          >
            {project.name}
            <span
              className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                removeProject(project.id)
              }}
            >
              <X size={12} />
            </span>
          </button>
        ))}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mb-2 h-8 w-8" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Projeto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="projectId" className="text-right">
                  ID do Projeto
                </Label>
                <Input
                  id="projectId"
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={addProject}>Adicionar Projeto</Button>
          </DialogContent>
        </Dialog>
      </div>
      {activeTab === "home" ? (
        <HomeWeeklyView projects={projects} />
      ) : (
        projects.map((project) => (
          <div key={project.id} className={activeTab === project.id ? "" : "hidden"}>
            <ProjectCard project={project} />
          </div>
        ))
      )}
    </div>
  )
}

