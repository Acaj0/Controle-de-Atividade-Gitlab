"use client"

import { useQuery } from "react-query"
import { useState, useEffect } from "react"
import type { GitLabProject, GitLabMember, Commit } from "../types/gitlab"
import CommitDetailsPopup from "./CommitDetailsPopup"
import { EyeOff, Eye } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

function MemberWeeklyCommits({ member, projects }: { member: GitLabMember; projects: GitLabProject[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const weekDates = getWeekDates()

  const queries = projects.map((project) =>
    useQuery<{ commitData: Commit[] }, Error>(
      ["commits", member.id, project.id],
      async () => {
        const res = await fetch(`/api/commits/${member.id}/${project.id}`)
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Failed to fetch commit data")
        }
        return res.json()
      },
      {
        enabled: !!member.id && !!project.id,
        retry: (failureCount, error) => {
          if (error.message === "Project not found") return false
          return failureCount < 3
        },
      },
    ),
  )

  const isLoading = queries.some((query) => query.isLoading)
  const error = queries.some((query) => query.isError)

  const allCommits = queries
    .flatMap((query) => query.data?.commitData || [])
    .filter((commit): commit is Commit => commit !== undefined)

  const commitDates = new Set(allCommits.map((commit) => commit.date))

  const handleCommitClick = (date: string) => {
    if (commitDates.has(date)) {
      setSelectedDate(date)
    }
  }

  const selectedCommits = selectedDate ? allCommits.filter((commit) => commit.date === selectedDate) : []

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar commits</div>

  return (
    <div className="flex items-center justify-center hover:shadow-lg duration-150 transition-shadow gap-4 outline-1 outline p-6 rounded-lg">
      <span className="text-xl font-medium text-center w-96 text-clip">{member.name}</span>
      <div className="flex gap-2">
        {weekDates.map((date) => (
          <div
            key={date}
            className={`w-6 h-6 rounded-sm ${commitDates.has(date) ? "bg-red-800 hover:bg-red-900 cursor-pointer" : "bg-gray-200"}`}
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
          projects={projects}
        />
      )}
    </div>
  )
}

export default function HomeWeeklyView({ projects }: { projects: GitLabProject[] }) {
  const allMembers = projects.flatMap((project) => project.members)
  const uniqueMembers = Array.from(new Map(allMembers.map((member) => [member.id, member])).values())

  const [hiddenUsers, setHiddenUsers] = useState<string[]>([])

  useEffect(() => {
    const savedHiddenUsers = localStorage.getItem("hiddenUsers")
    if (savedHiddenUsers) {
      setHiddenUsers(JSON.parse(savedHiddenUsers))
    }
  }, [])

  const toggleUserVisibility = (userName: string) => {
    setHiddenUsers((prevHiddenUsers) => {
      const updatedHiddenUsers = prevHiddenUsers.includes(userName)
        ? prevHiddenUsers.filter((name) => name !== userName)
        : [...prevHiddenUsers, userName]
      localStorage.setItem("hiddenUsers", JSON.stringify(updatedHiddenUsers))
      return updatedHiddenUsers
    })
  }

  const showAllUsers = () => {
    setHiddenUsers([])
    localStorage.removeItem("hiddenUsers")
  }

  const filteredMembers = uniqueMembers.filter((member) => !hiddenUsers.includes(member.name))
  const sortedMembers = filteredMembers.sort((a, b) => a.name.localeCompare(b.name))
  const hiddenMembers = uniqueMembers.filter((member) => hiddenUsers.includes(member.name))

  return (
    <div className="bg-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">
        Visão Semanal de Commits{" "}
        <span className="text-sm text-gray-600">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedMembers.map((member) => (
          <div key={member.id} className="relative">
            <MemberWeeklyCommits member={member} projects={projects} />
            <button
              className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => {
                if (window.confirm(`Tem certeza que deseja ocultar ${member.name}?`)) {
                  toggleUserVisibility(member.name)
                }
              }}
              title="Ocultar usuário"
            >
              <EyeOff size={20} />
            </button>
          </div>
        ))}
      </div>
      {hiddenMembers.length > 0 && (
        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="hidden-users">
              <AccordionTrigger className="text-xl font-bold">
                Usuários Ocultados ({hiddenMembers.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {hiddenMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <span>{member.name}</span>
                      <button
                        className="text-red-800 hover:text-red-900"
                        onClick={() => toggleUserVisibility(member.name)}
                        title="Mostrar usuário"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  ))}
                  {hiddenMembers.length > 1 && (
                    <button
                      className="mt-4 w-full px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900"
                      onClick={showAllUsers}
                    >
                      Mostrar todos os usuários
                    </button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  )
}

