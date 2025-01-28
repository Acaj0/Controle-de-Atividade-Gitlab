"use client"

import { useQuery } from "react-query"
import { useState } from "react"
import type { GitLabProject, GitLabMember } from "../types/gitlab"
import CommitDetailsPopup from "./CommitDetailsPopup"

const DAYS_OF_WEEK = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]

function getWeekDates() {
  const today = new Date()
  const currentDay = today.getDay()
  const diff = currentDay === 0 ? 6 : currentDay - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - diff)

  return DAYS_OF_WEEK.map((_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date.toISOString().split("T")[0]
  })
}

interface Commit {
  date: string
  branch: string
  project: string
}

function MemberWeeklyCommits({ member, projects }: { member: GitLabMember; projects: GitLabProject[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const weekDates = getWeekDates()

  const queries = projects.map((project) =>
    useQuery<Commit[], Error>(["commits", member.id, project.id], async () => {
      const res = await fetch(`/api/commits/${member.id}/${project.id}`)
      if (!res.ok) throw new Error("Network response was not ok")
      const data = await res.json()
      return data.map((commit: any) => ({
        ...commit,
        project: project.name,
      }))
    }),
  )

  const isLoading = queries.some((query) => query.isLoading)
  const error = queries.some((query) => query.isError)

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar commits</div>

  const allCommits = queries
    .flatMap((query) => query.data || [])
    .filter((commit): commit is Commit => commit !== undefined)

  const commitDates = new Set(allCommits.map((commit) => commit.date))

  const handleCommitClick = (date: string) => {
    if (commitDates.has(date)) {
      setSelectedDate(date)
    }
  }

  const selectedCommits = selectedDate ? allCommits.filter((commit) => commit.date === selectedDate) : []

  return (
    <div className="flex items-center justify-center hover:shadow-lg gap-4 outline-1 outline p-6 rounded-lg">
      <span className="text-xl font-medium text-center w-96 text-clip">{member.name}</span>
      <div className="flex gap-2">
        {weekDates.map((date) => (
          <div
            key={date}
            className={`w-6 h-6 rounded-sm ${commitDates.has(date) ? "bg-red-800 cursor-pointer" : "bg-gray-200"}`}
            title={`${date}: ${commitDates.has(date) ? "✔ Commit" : "❌ Sem commit"}`}
            onClick={() => handleCommitClick(date)}
          />
        ))}
      </div>
      {selectedDate && selectedCommits.length > 0 && (
        <CommitDetailsPopup
          commits={selectedCommits}
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          member={member}
        />
      )}
    </div>
  )
}

export default function HomeWeeklyView({ projects }: { projects: GitLabProject[] }) {
  const allMembers = projects.flatMap((project) => project.members)
  const uniqueMembers = Array.from(new Map(allMembers.map((member) => [member.id, member])).values())

  const excludedMembers = [
    "Adrian Toledo Procopiou",
    "Andressa Da Silva Carvalho",
    "Fernando Prudencio De Souza",
    "Jaudo Cesar Martins Correa",
    "Luis Felipe Amorim Sant Ana",
    "Joao Almeida",
    "Ulisses Ribeiro Da Silva",
  ]

  const filteredMembers = uniqueMembers.filter((member) => !excludedMembers.includes(member.name))
  const sortedMembers = filteredMembers.sort((a, b) => a.name.localeCompare(b.name))

  const memberQueries = sortedMembers.map((member) =>
    projects.map((project) =>
      useQuery<Commit[], Error>(["commits", member.id, project.id], async () => {
        const res = await fetch(`/api/commits/${member.id}/${project.id}`)
        if (!res.ok) throw new Error("Network response was not ok")
        return res.json()
      }),
    ),
  )

  const isLoading = memberQueries.flat().some((query) => query.isLoading)
  const error = memberQueries.flat().some((query) => query.isError)

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar commits</div>

  const today = new Date()
  const formattedDate = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="bg-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">
        Visão Semanal de Commits <span className="text-sm text-gray-600">({formattedDate})</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedMembers.map((member, index) => (
          <MemberWeeklyCommits key={member.id} member={member} projects={projects} />
        ))}
      </div>
    </div>
  )
}

