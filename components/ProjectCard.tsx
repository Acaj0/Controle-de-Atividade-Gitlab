import { useEffect, useState } from "react";
import type { ProjectCardProps } from "../types/gitlab";
import CommitGrid from "./CommitHeatmap";
import { EyeOff, Eye } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export default function ProjectCard({ project }: ProjectCardProps) {
  const [hiddenUsers, setHiddenUsers] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    const savedHiddenUsers = localStorage.getItem("hiddenUsers");
    if (savedHiddenUsers) {
      setHiddenUsers(JSON.parse(savedHiddenUsers));
    }
  }, []);

  const hiddenUserIds = hiddenUsers.map((user) => user.id);
  const filteredMembers = project.members.filter(
    (member) => !hiddenUserIds.includes(member.id)
  );
  const sortedMembers = filteredMembers.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const toggleUserVisibility = (member: { id: number; name: string }) => {
    setHiddenUsers((prevHiddenUsers) => {
      const updatedHiddenUsers = prevHiddenUsers.some(
        (user) => user.id === member.id
      )
        ? prevHiddenUsers.filter((user) => user.id !== member.id)
        : [...prevHiddenUsers, member];
      localStorage.setItem("hiddenUsers", JSON.stringify(updatedHiddenUsers));
      return updatedHiddenUsers;
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold">{project.name}</h2>
      <p className="mb-4">ID: {project.id}</p>
      <h3 className="text-xl font-semibold mb-1">Membros:</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className="outline hover:shadow-lg transition-shadow duration-150 px-4 py-2 flex flex-col rounded-md outline-2 outline-gray-400/40 relative"
          >
            <h4 className="text-2xl font-bold">{member.name}</h4>
            <CommitGrid
              userId={member.id.toString()}
              projectId={project.id.toString()}
            />
            <button
              className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => {
                if (
                  window.confirm(
                    `Tem certeza que deseja ocultar ${member.name}?`
                  )
                ) {
                  toggleUserVisibility({ id: member.id, name: member.name });
                }
              }}
              title="Ocultar usuário"
            >
              <EyeOff />
            </button>
          </div>
        ))}
      </div>

      {hiddenUsers.length > 0 && (
        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="hidden-users">
              <AccordionTrigger className="text-xl font-bold">
                Usuários Ocultados ({hiddenUsers.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {hiddenUsers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                    >
                      <span>{member.name}</span>
                      <button
                        className="text-red-800 hover:text-red-900"
                        onClick={() => toggleUserVisibility(member)}
                        title="Mostrar usuário"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="mt-4 w-full px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900"
                    onClick={() => {
                      setHiddenUsers([]);
                      localStorage.removeItem("hiddenUsers");
                    }}
                  >
                    Mostrar todos os usuários
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
