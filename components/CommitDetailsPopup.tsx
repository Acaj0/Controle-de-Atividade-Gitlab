import type React from "react"
import { X } from "lucide-react"
import type { Commit, GitLabMember } from "../types/gitlab"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"

interface CommitDetailsPopupProps {
  commits: Commit[]
  date: string
  onClose: () => void
  member: GitLabMember
}

const CommitDetailsPopup: React.FC<CommitDetailsPopupProps> = ({ commits, date, onClose, member }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg overflow-y-scroll max-h-[600px] w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Detalhes dos Commits de {member.name} - {date}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-6">
          {commits.map((commit, index) => (
            <div key={index} className="space-y-2">
              <div>
                <div className="font-medium">Projeto:</div>
                <div>{commit.project}</div>
              </div>
              <div>
                <div className="font-medium">Branch:</div>
                <div>{commit.branch}</div>
              </div>
              <div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="message">
                    <AccordionTrigger className="text-md">
                      <div className="font-medium">Mensagem do Commit</div>
                    </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex overflow-visible text-wrap">{commit.message}</div>
                      </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              {index < commits.length - 1 && <hr className="my-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CommitDetailsPopup

