
export interface GitLabMember {
  id: number
  name: string
  username: string
  state: string
  avatar_url: string
  web_url: string
}

export interface Commit {
  date: string
  sha: string
  branch: string
  project: string
  message: string
  author_name: string
}

export interface GitLabProject {
  id: number
  name: string
  description: string | null
  web_url: string
  members: GitLabMember[]
  commitData?: Commit[]
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


