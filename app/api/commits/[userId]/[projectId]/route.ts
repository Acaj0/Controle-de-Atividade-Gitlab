import { NextResponse } from "next/server"
import axios from "axios"
import type { CommitData } from "@/types/gitlab"

const BASE_URL = "https://gitlab.com/api/v4/"
const TOKEN = "glpat-eArbSJkeTt-CGo3dsS-V"

interface GitLabEvent {
  project_id: number
  created_at: string
}

export async function GET(request: Request, { params }: { params: { userId: string; projectId: string } }) {
  const { userId, projectId } = params

  try {
    const startDate = new Date(new Date().getFullYear(), 0, 1)
    const endDate = new Date()

    let url = `${BASE_URL}/users/${userId}/events?action=pushed&per_page=100`
    const allEvents: GitLabEvent[] = []

    while (url) {
      const response = await axios.get<GitLabEvent[]>(url, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      })

      const events = response.data.filter(
        (event) =>
          event.project_id === Number.parseInt(projectId) &&
          new Date(event.created_at) >= startDate &&
          new Date(event.created_at) <= endDate,
      )

      allEvents.push(...events)

      const nextLink = response.headers.link?.match(/<(.*)>;\s*rel="next"/)
      url = nextLink ? nextLink[1] : ""
    }

    const commitCounts: Record<string, number> = allEvents.reduce(
      (acc, event) => {
        const date = event.created_at.split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const commitData: CommitData[] = Object.entries(commitCounts).map(([date, count]) => ({
      date,
      count,
    }))

    return NextResponse.json(commitData)
  } catch (error) {
    console.error("Error fetching commit data:", error)
    return NextResponse.json({ error: "Failed to fetch commit data" }, { status: 500 })
  }
}

