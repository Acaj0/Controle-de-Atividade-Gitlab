import type { ReactCalendarHeatmapValue } from "react-calendar-heatmap"

export interface GitLabMember {
  id: number
  name: string
  username: string
  state: string
  avatar_url: string
  web_url: string
}

export interface GitLabProject {
  id: number
  name: string
  description: string | null
  web_url: string
  members: GitLabMember[]
}

export interface CommitData {
  date: string
  count: number
}

export interface ProjectCardProps {
  project: GitLabProject
}

export interface CommitHeatmapProps {
  userId: number
  projectId: number
}

// Atualizamos a definição de HeatmapValue para usar o tipo genérico corretamente
export interface HeatmapValue extends ReactCalendarHeatmapValue<Date> {
  date: Date
  count: number
}

