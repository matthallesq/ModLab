import React from "react";
import TeamManagement from "@/components/teams/TeamManagement";
import Toolbar from "@/components/dashboard/layout/Toolbar";
import { useProject } from "@/contexts/ProjectContext";
import { ProjectProvider } from "@/contexts/ProjectContext";

const TeamPage: React.FC = () => {
  const { teams, createTeam, deleteTeam, addTeamMember, removeTeamMember } =
    useProject();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar activeItem="Team" />
      <div className="container mx-auto pt-24 px-4 pb-8">
        <TeamManagement
          teams={teams}
          createTeam={createTeam}
          deleteTeam={deleteTeam}
          addTeamMember={addTeamMember}
          removeTeamMember={removeTeamMember}
        />
      </div>
    </div>
  );
};

const TeamPageWithProvider: React.FC = () => {
  return (
    <ProjectProvider>
      <TeamPage />
    </ProjectProvider>
  );
};

export default TeamPageWithProvider;
