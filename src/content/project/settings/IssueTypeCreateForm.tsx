import { useAtom, useAtomValue } from "jotai"
import React from "react"
import { useForm } from "react-hook-form"
import { IssueTypeColor } from "../../backlog/ProjectInfo"
import { issueTypesAtom } from "../app/State"
import { issueTypeCreateAtom } from "./State"

export const IssueTypeCreateForm: React.FC = () => {
  const [formValue, setForm] = useAtom(issueTypeCreateAtom)
  const issueTypes = useAtomValue(issueTypesAtom)
  const { register, handleSubmit } = useForm()

  return (
    formValue && (
      <div>
        <form
          onSubmit={handleSubmit((data) => {
            console.log({ data })
          })}
        >
          <div>
            <input type="text" {...register("name")} />
          </div>
          <div>
            {Object.entries(IssueTypeColor).map(([color, hex], idx) => (
              <label key={idx} htmlFor={color} style={{ backgroundColor: hex, padding: "0 3em 0 0", color: "white" }}>
                <input type="radio" value={color} id={color} />
                {color}
              </label>
            ))}
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  )
}
