import { NextResponse } from "next/server"
import axios from "axios"
import type { Commit } from "@/types/gitlab"

const BASE_URL = process.env.url
const TOKEN = process.env.token

function getWeekRange() {
  const today = new Date()
  const currentDay = today.getDay()
  const diff = currentDay

  const sunday = new Date(today)
  sunday.setDate(today.getDate() - diff)

  const saturday = new Date(sunday)
  saturday.setDate(sunday.getDate() + 6)

  return {
    start: sunday.toISOString().split("T")[0],
    end: saturday.toISOString().split("T")[0],
  }
}



const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 

export async function GET(request: Request, { params }: { params: { userId: string; projectId: string } }) {
  const { userId, projectId } = params
  const { start, end } = getWeekRange()

  const cacheKey = `user-${userId}-project-${projectId}-week-${start}`

  const cachedData = cache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log(`Usando cache para usuário ${userId} no projeto ${projectId}`)
    return NextResponse.json({ commitData: cachedData.data })
  }

  console.log(`Buscando commits para usuário ${userId} no projeto ${projectId}`)

  let allEvents: any[] = []
  let page = 1
  let hasMore = true

  try {
    while (hasMore) {
      const eventsResponse = await axios.get(`${BASE_URL}/projects/${projectId}/events`, {
        params: {
          action: "pushed",
          per_page: 100,
          page: page,
          after: start,
          //until: end,
        },
        headers: { Authorization: `Bearer ${TOKEN}` },
        timeout: 10000,
      })

      if (Array.isArray(eventsResponse.data) && eventsResponse.data.length > 0) {
        allEvents = [...allEvents, ...eventsResponse.data]
        page++
      } else {
        hasMore = false
      }
    }

    const userIdNumber = Number(userId)

    console.log(`Total de eventos encontrados: ${allEvents.length}`)
    console.log(`Filtrando eventos para o usuário ID: ${userIdNumber}`)

    const userEvents = allEvents.filter((event: any) => {
      const eventAuthorId = Number(event.author_id)
      const isMatch = eventAuthorId === userIdNumber

      if (isMatch) {
        console.log(`Evento encontrado para usuário ${userIdNumber}: ${event.push_data?.commit_title || "Sem título"}`)
      }

      return isMatch
    })

    console.log(`Eventos filtrados para o usuário ${userIdNumber}: ${userEvents.length}`)

    const commitData: Commit[] = userEvents.map((event: any) => ({
      date: event.created_at?.split("T")[0] || "unknown",
      branch: event.push_data?.ref?.replace("refs/heads/", "") || "unknown",
      message: event.push_data?.commit_title || "Nenhuma mensagem",
      project: projectId,
      sha: event.push_data?.commit_to || "unknown",
      author_name: event.author?.name || "Desconhecido",
    }))

    cache.set(cacheKey, { data: commitData, timestamp: Date.now() })
    console.log(`Armazenado em cache: ${commitData.length} commits para usuário ${userId}`)

    return NextResponse.json({ commitData })
  } catch (error) {
    console.error(`Erro ao buscar commits para usuário ${userId}:`, error)
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