
import type { ProjectCardProps } from "../types/gitlab";
import CommitGrid from "./CommitHeatmap";

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold ">{project.name}</h2>
      <p className="mb-4">ID: {project.id}</p>
      <h3 className="text-xl font-semibold mb-1">Membros:</h3>
      {project.members.map((member) => (
        <div key={member.id} className="mb-4">
          <h4 className="text-2xl font-bold">{member.name}</h4>
          {/* Renderiza CommitGrid */}
          <CommitGrid userId={member.id.toString()} projectId={project.id.toString()} />
          </div>
      ))}
    </div>
  );
}
