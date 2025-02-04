import { NextResponse } from "next/server"
import axios from "axios"
import type { Commit } from "@/types/gitlab"

const BASE_URL = process.env.url
const TOKEN = process.env.token

export async function GET(request: Request, { params }: { params: { userId: string; projectId: string } }) {
  const { userId, projectId } = params

  try {
    const eventsResponse = await axios.get(`${BASE_URL}/projects/${projectId}/events?action=pushed&per_page=100`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      timeout: 10000,
    })

    const commitData: Commit[] = eventsResponse.data
      .filter((event: any) => event.author_id === Number(userId))
      .map((event: any) => ({
        date: event.created_at.split("T")[0],
        branch: event.push_data?.ref?.replace("refs/heads/", "") || "unknown",
        message: event.push_data?.commit_title || "Nenhuma mensagem",
        project: projectId,
        sha: event.push_data?.commit_to || "unknown", 

      }))

    return NextResponse.json({ commitData })
  } catch (error) {
    console.error("Error fetching commit data:", error)
    if (axios.isAxiosError(error)) {
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

