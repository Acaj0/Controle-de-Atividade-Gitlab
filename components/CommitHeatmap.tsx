"use client"

import { useQuery } from "react-query"
import { useState } from "react"

interface Commit {
  date: string
  branch: string
  message: string
  project: string
}

interface CommitGridProps {
  userId: string
  projectId: string
}

export default function CommitGrid({ userId, projectId }: CommitGridProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const {
    data: commitData,
    isLoading,
    error,
  } = useQuery<{ commitData: Commit[] }, Error>(
    ["commits", userId, projectId],
    async () => {
      const res = await fetch(`/api/commits/${userId}/${projectId}`)
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to fetch commit data")
      }
      return res.json()
    },
    {
      retry: (failureCount, error) => {
        if (error.message === "Project not found") return false
        return failureCount < 3
      },
    },
  )

  if (isLoading) return <div>Carregando commits...</div>
  if (error) return <div>Erro: {error.message}</div>

  const commits = commitData?.commitData || []
  const commitDates = new Set(commits.map((commit) => commit.date))

  const startDate = new Date(selectedYear, 0, 1)
  const endDate = new Date(selectedYear, 11, 31)

  const daysOfYear: any[] = []
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const formattedDate = date.toISOString().split("T")[0]
    daysOfYear.push({
      date: formattedDate,
      hasCommit: commitDates.has(formattedDate),
    })
  }

  const firstDayOfWeek = startDate.getDay()
  const adjustedFirstDayOfWeek = firstDayOfWeek
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

  return (
    <div className="space-y-4 overflow-x-scroll  scrollbar">
      <div className="flex justify-start gap-2 items-center">
        <h2 className="text-xl font-bold">Commits de </h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded p-1"
        >
          {[...Array(5)].map((_, i) => {
            const year = new Date().getFullYear() - i
            return (
              <option key={year} value={year}>
                {year}
              </option>
            )
          })}
        </select>
      </div>
      <div className="space-y-1">
        <div className="flex ml-11 gap-11 mb-1">
          {months.map((month, index) => (
            <div key={index} className="w-[5px] ml-1 mr-2 text-xs text-gray-400">
              {month}
            </div>
          ))}
        </div>
        <div className="flex">
          <div className="grid mt-4 grid-rows-3 gap-[6px] mr-2 text-xs text-gray-400">
            <div className="h-2 flex items-center">Seg</div>
            <div className="h-2 flex items-center">Qua</div>
            <div className="h-2 flex items-center">Sex</div>
          </div>
          <div className="flex gap-[2px] mt-1 h-24">
            {Array.from({ length: Math.ceil((daysOfYear.length + adjustedFirstDayOfWeek) / 7) }, (_, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayOfYearIndex = weekIndex * 7 + dayIndex - adjustedFirstDayOfWeek
                  const day = daysOfYear[dayOfYearIndex]
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${
                        day ? (day.hasCommit ? "bg-red-800" : "bg-gray-200") : "bg-transparent"
                      }`}
                      title={day ? (day.hasCommit ? `✔ Commit em ${day.date}` : `❌ Sem commit em ${day.date}`) : ""}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
