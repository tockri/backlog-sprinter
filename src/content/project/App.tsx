import React from "react";
import { PBFormInfo } from "./types";

type ProjectAppProps = {
  info: PBFormInfo
}

export const ProjectApp: React.FC<ProjectAppProps> = (props) => {
  return <div>Project {props.info.lang} {props.info.projectKey}</div>
}