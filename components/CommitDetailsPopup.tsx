import type React from "react"
import { X } from "lucide-react"
import type { Commit, GitLabMember } from "../types/gitlab"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { GitLabProject } from "../types/gitlab"
import Link from "next/link"

interface CommitDetailsPopupProps {
  commits: Commit[]
  date: string
  onClose: () => void
  member: GitLabMember
  projects: GitLabProject[]
}

const CommitDetailsPopup: React.FC<CommitDetailsPopupProps> = ({ commits, date, onClose, member, projects }) => {
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id.toString() === projectId)
    return project ? project.name : projectId
  }

  const getCommitUrl = (projectId: string, sha: string) => {
    const project = projects.find((p) => p.id.toString() === projectId)
    return project ? `${project.web_url}/commit/${sha}` : "#"
  }
  const formattedDate = date.split("-").reverse().join("/")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg overflow-y-scroll max-h-[600px] w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
          <h2 className="text-xl font-bold">
            Detalhes dos Commits {member.name.split(" ")[0]} 
          </h2>
          <p className="text-md font-medium text-gray-500">{formattedDate}</p></div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-6">
          {commits.map((commit, index) => (
            <Accordion type="single" collapsible key={index}>
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger>
                  <div className="text-left">
                    <div className="font-bold text-xl">Projeto: {getProjectName(commit.project)}</div>
                    <div className="text-gray-500 text-sm">Branch: {commit.branch}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2">
                    <div className="font-medium">Mensagem:</div>
                    <div className="whitespace-pre-wrap">{commit.message}</div>
                    <Link
                      href={getCommitUrl(commit.project, commit.sha)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" text-white text-xs outline bg-gray-400 rounded-lg px-2 py-1 mt-2 inline-block"
                    >
                      Ver commit no GitLab
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CommitDetailsPopup

