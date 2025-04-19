import React from "react";
import { ProjectProvider } from "@/contexts/ProjectContext";
import ProjectsPage from "./ProjectsPage";

const ProjectsPageWrapper = () => {
  return (
    <ProjectProvider>
      <ProjectsPage />
    </ProjectProvider>
  );
};

export default ProjectsPageWrapper;
