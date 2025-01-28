"use client";

import { useState } from "react";
import { useQuery } from "react-query";
import ProjectCard from "./ProjectCard";
import HomeWeeklyView from "./HomeWeeklyView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { GitLabProject } from "../types/gitlab";

const projectIds = [66510560, 66510759, 66510764]; // projetos

export default function ProjectTabs() {
  const [activeTab, setActiveTab] = useState<number | "home">("home");

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
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
        )
      );
      return responses;
    },
    {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );

  if (isLoading) return <div>Carregando...</div>;
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load projects: {error.message}.
        </AlertDescription>
      </Alert>
    );
  if (!projects || projects.length === 0)
    return <div>0 Projetos encontrados</div>;

  return (
    <div>
      <div className="mb-4">
        <button
          className={`px-4 py-2 hover:shadow-lg rounded-sm mr-2 ${
            activeTab === "home" ? "bg-red-800 text-white" : "bg-white"
          }`}
          onClick={() => setActiveTab("home")}
        >
          <svg
            width={20}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            className={`${
              activeTab === "home" ? "fill-white" : "fill-black"
            } inline-block align-middle`}
          >
            <path d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z" />
          </svg>
          <span className="inline-block align-middle ml-1">Visão Geral</span>
        </button>
        {projects.map((project) => (
          <button
            key={project.id}
            className={`px-4 py-2 hover:shadow-lg rounded-sm mr-2 ${
              activeTab === project.id ? "bg-red-800 text-white" : "bg-white"
            }`}
            onClick={() => setActiveTab(project.id)}
          >
            {project.name}
          </button>
        ))}
      </div>
      {activeTab === "home" ? (
        <HomeWeeklyView projects={projects} />
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            className={activeTab === project.id ? "" : "hidden"}
          >
            <ProjectCard project={project} />
          </div>
        ))
      )}
    </div>
  );
}
