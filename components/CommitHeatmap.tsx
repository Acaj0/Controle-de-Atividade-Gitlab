"use client";

import { useQuery } from "react-query";

interface CommitData {
  date: string;
}


interface CommitHeatmapProps {
  userId: string;
  projectId: string;
}

export default function CommitGrid({ userId, projectId }: CommitHeatmapProps) {
  const {
    data: commits,
    isLoading,
    error,
  } = useQuery<CommitData[], Error>(
    ["commits", userId, projectId],
    async () => {
      const res = await fetch(`/api/commits/${userId}/${projectId}`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    }
  );

  if (isLoading) return <div>Carregando commits...</div>;
  if (error) return <div> {error.message}</div>;
  if (!commits) return <div>Sem Atividade</div>;

  const commitDates = new Set(commits.map((commit) => commit.date));

  const year = 2025;
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const daysOfYear: any[] = [];
  for (
    let date = startDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const formattedDate = date.toISOString().split("T")[0];
    daysOfYear.push({
      date: formattedDate,
      hasCommit: commitDates.has(formattedDate),
    });
  }

  const firstDayOfWeek = startDate.getDay();
  const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 0 : 7 - firstDayOfWeek;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 mt-2">
        {/* Renderizar colunas de semanas */}
        {Array.from(
          {
            length: Math.ceil((daysOfYear.length + adjustedFirstDayOfWeek) / 7),
          },
          (_, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dayOfYearIndex =
                  weekIndex * 7 + dayIndex - adjustedFirstDayOfWeek;
                const day = daysOfYear[dayOfYearIndex];
                return (
                  <div
                    key={dayIndex}
                    className={`w-4 h-4 rounded-sm ${
                      day
                        ? day.hasCommit
                          ? "bg-red-800"
                          : "bg-gray-200"
                        : "bg-transparent"
                    }`}
                    title={
                      day
                        ? day.hasCommit
                          ? `✔ Commit em ${day.date}`
                          : `❌ Sem commit em ${day.date}`
                        : ""
                    }
                  />
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
