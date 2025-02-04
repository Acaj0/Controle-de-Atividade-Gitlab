import { NextResponse } from "next/server"
import axios from "axios"

const BASE_URL = process.env.url
const TOKEN = process.env.token

export async function GET(request: Request, { params }: { params: { userId: string; projectId: string } }) {
  const { userId, projectId } = params

  console.log(`Fetching PR data for user ${userId} in project ${projectId}`)

  try {
    const mergeRequestsResponse = await axios.get(`${BASE_URL}/projects/${projectId}/merge_requests`, {
      params: {
        state: "all",
        scope: "all",
        author_id: userId,
        per_page: 100,
      },
      headers: {
        "PRIVATE-TOKEN": TOKEN,
      },
      timeout: 10000,
    })

    const prData = await Promise.all(
      mergeRequestsResponse.data.map(async (mr: any) => {
        try {
          const notesResponse = await axios.get(`${BASE_URL}/projects/${projectId}/merge_requests/${mr.iid}/notes`, {
            params: {
              per_page: 100,
            },
            headers: {
              "PRIVATE-TOKEN": TOKEN,
            },
            timeout: 10000,
          })

          const userActivity = notesResponse.data
            .filter((note: any) => note.author.id === Number(userId) && !note.system)
            .map((note: any) => ({
              date: note.created_at.split("T")[0],
              type: note.type === "DiffNote" ? "review" : "comment",
            }))

          return {
            iid: mr.iid,
            title: mr.title,
            state: mr.state,
            created_at: mr.created_at,
            updated_at: mr.updated_at,
            activity: userActivity,
          }
        } catch (error) {
          console.error(`Error fetching notes for MR ${mr.iid}:`, error)
          return null
        }
      }),
    )

    const filteredPrData = prData.filter((pr) => pr !== null)

    return NextResponse.json({ prData: filteredPrData })
  } catch (error) {
    console.error("Error fetching pull request data:", error)
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("GitLab API Response Error:", error.response.data)
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

