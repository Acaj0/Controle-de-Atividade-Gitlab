import { useEffect, useState } from "react";
import type { ProjectCardProps } from "../types/gitlab";
import CommitGrid from "./CommitHeatmap";

export default function ProjectCard({ project }: ProjectCardProps) {

  const [hiddenUsers, setHiddenUsers] = useState<string[]>([])

   useEffect(() => {
      const savedHiddenUsers = localStorage.getItem("hiddenUsers")
      if (savedHiddenUsers) {
        setHiddenUsers(JSON.parse(savedHiddenUsers))
      }
    }, [])
  const filteredMembers = project.members.filter((member) => !hiddenUsers.includes(member.name))
  const sortedMembers = filteredMembers.sort((a, b) => a.name.localeCompare(b.name))

  
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold ">{project.name}</h2>
      <p className="mb-4">ID: {project.id}</p>
      <h3 className="text-xl font-semibold mb-1">Membros:</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className=" outline hover:shadow-lg transition-shadow duration-150 px-4 py-2 flex flex-col rounded-md outline-2 outline-gray-400/40 "
          >
            <h4 className="text-2xl font-bold">{member.name}</h4>
            <CommitGrid
              userId={member.id.toString()}
              projectId={project.id.toString()}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
