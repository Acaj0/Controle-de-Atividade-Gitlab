import { NextResponse } from "next/server"
import axios from "axios"
import type { GitLabProject, GitLabMember } from "@/types/gitlab"

const BASE_URL = "https://gitlab.com/api/v4/"
const TOKEN = "glpat-eArbSJkeTt-CGo3dsS-V"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const projectId = params.id

  console.log(`Fetching project data for project ID: ${projectId}`)

  try {
    const [projectResponse, membersResponse] = await Promise.all([
      axios.get<GitLabProject>(`${BASE_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        timeout: 10000, 
      }),
      axios.get<GitLabMember[]>(`${BASE_URL}/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
        timeout: 10000, 
      }),
    ])

    const project: GitLabProject = {
      id: projectResponse.data.id,
      name: projectResponse.data.name,
      description: projectResponse.data.description,
      web_url: projectResponse.data.web_url,
      members: membersResponse.data,
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project data:", error)
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json({ error: "Request timed out. Please try again." }, { status: 504 })
      }
      if (error.response) {
        return NextResponse.json(
          { error: `GitLab API error: ${error.response.status}` },
          { status: error.response.status },
        )
      } else if (error.request) {
        return NextResponse.json({ error: "No response received from GitLab API" }, { status: 503 })
      }
    }
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

