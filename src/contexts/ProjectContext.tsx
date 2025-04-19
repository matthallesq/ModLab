import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ModelType,
  Project,
  SUBSCRIPTION_TIERS,
  Team,
  TeamMember,
} from "@/types/project";

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  createProject: (
    name: string,
    description: string,
    navigateToProjects?: boolean,
    modelType?: ModelType,
  ) => Project;
  deleteProject: (projectId: string) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  createTeam: (name: string, description?: string) => Team;
  deleteTeam: (teamId: string) => void;
  addTeamMember: (
    teamId: string,
    member: Omit<TeamMember, "id">,
  ) => TeamMember | null;
  removeTeamMember: (teamId: string, memberId: string) => void;
  assignTeamToProject: (projectId: string, teamId: string) => void;
  assignMembersToProject: (projectId: string, memberIds: string[]) => void;
  assignTeamToCanvas: (
    projectId: string,
    canvasId: string,
    teamMembers: TeamMember[],
  ) => void;
  assignTeamToProductCanvas: (
    projectId: string,
    canvasId: string,
    teamMembers: TeamMember[],
  ) => void;
  assignTeamToExperiment: (
    projectId: string,
    experimentId: string,
    teamMembers: TeamMember[],
  ) => void;
  removeExperimentAssignee: (
    projectId: string,
    experimentId: string,
    memberId: string,
  ) => void;
  assignTeamToInsight: (
    projectId: string,
    insightId: string,
    teamMembers: TeamMember[],
  ) => void;
  removeInsightAssignee: (
    projectId: string,
    insightId: string,
    memberId: string,
  ) => void;
  removeAllExperimentAssignees: () => void;
  experimentViewMode: "board" | "table";
  setExperimentViewMode: (mode: "board" | "table") => void;
  setProjectModelType: (projectId: string, modelType: ModelType) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Sample team members data
const sampleTeamMembers: TeamMember[] = [
  {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: "owner",
  },
  {
    id: "user-124",
    name: "Alice Smith",
    email: "alice@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    role: "admin",
  },
  {
    id: "user-125",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    role: "member",
  },
  {
    id: "user-126",
    name: "Carol Williams",
    email: "carol@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
    role: "member",
  },
];

// Sample teams data
const sampleTeams: Team[] = [
  {
    id: "team-001",
    name: "Product Team",
    description: "Team responsible for product development",
    members: [sampleTeamMembers[0], sampleTeamMembers[1], sampleTeamMembers[2]],
    created_at: new Date(2023, 4, 10).toISOString(),
    updated_at: new Date(2023, 5, 15).toISOString(),
    owner_id: "user-123",
  },
  {
    id: "team-002",
    name: "Marketing Team",
    description: "Team responsible for marketing activities",
    members: [sampleTeamMembers[0], sampleTeamMembers[3]],
    created_at: new Date(2023, 6, 20).toISOString(),
    updated_at: new Date(2023, 7, 25).toISOString(),
    owner_id: "user-123",
  },
];

// Sample projects data
const sampleProjects: Project[] = [
  {
    id: "proj-001",
    name: "Product Market Fit Analysis",
    description: "Analyzing product market fit for our SaaS platform",
    created_at: new Date(2023, 4, 10).toISOString(),
    updated_at: new Date(2023, 5, 15).toISOString(),
    user_id: "user-123",
    analytics: {
      validatedExperiments: 3,
      totalExperiments: 5,
      totalInsights: 8,
    },
  },
  {
    id: "proj-002",
    name: "Customer Acquisition Strategy",
    description: "Developing strategies for customer acquisition",
    created_at: new Date(2023, 6, 20).toISOString(),
    updated_at: new Date(2023, 7, 25).toISOString(),
    user_id: "user-123",
    analytics: {
      validatedExperiments: 1,
      totalExperiments: 3,
      totalInsights: 4,
    },
  },
  {
    id: "proj-003",
    name: "Enterprise Expansion Plan",
    description: "Planning for enterprise market expansion",
    created_at: new Date(2023, 8, 5).toISOString(),
    updated_at: new Date(2023, 9, 10).toISOString(),
    user_id: "user-123",
    analytics: {
      validatedExperiments: 5,
      totalExperiments: 10,
      totalInsights: 12,
    },
  },
];

const ProjectProvider = React.memo(function ProjectProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(() => {
    // Try to load projects from localStorage
    try {
      const savedProjects = localStorage.getItem("modellab_projects");
      return savedProjects ? JSON.parse(savedProjects) : sampleProjects;
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
      return sampleProjects;
    }
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    // Try to load teams from localStorage
    try {
      const savedTeams = localStorage.getItem("modellab_teams");
      return savedTeams ? JSON.parse(savedTeams) : sampleTeams;
    } catch (error) {
      console.error("Failed to load teams from localStorage", error);
      return sampleTeams;
    }
  });

  const [experimentViewMode, setExperimentViewMode] = useState<
    "board" | "table"
  >(() => {
    // Try to load experiment view mode from localStorage
    try {
      const savedViewMode = localStorage.getItem(
        "modellab_experiment_view_mode",
      );
      return savedViewMode === "board" || savedViewMode === "table"
        ? savedViewMode
        : "board";
    } catch (error) {
      console.error(
        "Failed to load experiment view mode from localStorage",
        error,
      );
      return "board";
    }
  });

  // Create a new project
  const createProject = useCallback(
    (
      name: string,
      description: string,
      navigateToProjects = false,
      modelType: ModelType = "business",
    ) => {
      // Create new project object
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "user-123", // In a real app, this would be the current user's ID
        modelType, // Use the provided model type or default to business model
        analytics: {
          validatedExperiments: 0,
          totalExperiments: 0,
          totalInsights: 0,
        },
      };

      // Add to projects list
      setProjects((prev) => {
        const updatedProjects = [...prev, newProject];
        // Save to localStorage for persistence
        try {
          localStorage.setItem(
            "modellab_projects",
            JSON.stringify(updatedProjects),
          );
        } catch (error) {
          console.error("Failed to save projects to localStorage", error);
        }
        return updatedProjects;
      });

      // Set as selected project
      setSelectedProject(newProject);

      // Navigate to projects page if requested
      if (navigateToProjects) {
        navigate("/projects");
      }

      return newProject;
    },
    [navigate],
  );

  // Delete a project
  const deleteProject = useCallback(
    (projectId: string) => {
      setProjects((prev) => {
        const updatedProjects = prev.filter(
          (project) => project.id !== projectId,
        );
        // Save to localStorage for persistence
        try {
          localStorage.setItem(
            "modellab_projects",
            JSON.stringify(updatedProjects),
          );
        } catch (error) {
          console.error("Failed to save projects to localStorage", error);
        }
        return updatedProjects;
      });

      // If the deleted project was selected, select the first available project or null
      if (selectedProject?.id === projectId) {
        const remainingProjects = projects.filter(
          (project) => project.id !== projectId,
        );
        setSelectedProject(
          remainingProjects.length > 0 ? remainingProjects[0] : null,
        );
      }
    },
    [projects, selectedProject],
  );

  // Create a new team
  const createTeam = useCallback((name: string, description?: string) => {
    // Create new team object
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      description,
      members: [sampleTeamMembers[0]], // Add current user as owner
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: "user-123", // In a real app, this would be the current user's ID
    };

    // Add to teams list
    setTeams((prev) => {
      const updatedTeams = [...prev, newTeam];
      // Save to localStorage for persistence
      try {
        localStorage.setItem("modellab_teams", JSON.stringify(updatedTeams));
      } catch (error) {
        console.error("Failed to save teams to localStorage", error);
      }
      return updatedTeams;
    });

    return newTeam;
  }, []);

  // Delete a team
  const deleteTeam = useCallback(
    (teamId: string) => {
      setTeams((prev) => {
        const updatedTeams = prev.filter((team) => team.id !== teamId);
        // Save to localStorage for persistence
        try {
          localStorage.setItem("modellab_teams", JSON.stringify(updatedTeams));
        } catch (error) {
          console.error("Failed to save teams to localStorage", error);
        }
        return updatedTeams;
      });

      // Also update projects that had this team assigned
      setProjects((prev) => {
        const updatedProjects = prev.map((project) => {
          if (project.team_id === teamId) {
            return { ...project, team_id: undefined, team: undefined };
          }
          return project;
        });
        // Save to localStorage for persistence
        try {
          localStorage.setItem(
            "modellab_projects",
            JSON.stringify(updatedProjects),
          );
        } catch (error) {
          console.error("Failed to save projects to localStorage", error);
        }
        return updatedProjects;
      });
    },
    [projects],
  );

  // Add a team member
  const addTeamMember = useCallback(
    (teamId: string, memberData: Omit<TeamMember, "id">) => {
      let addedMember: TeamMember | null = null;

      setTeams((prev) => {
        const updatedTeams = prev.map((team) => {
          if (team.id === teamId) {
            // Create new member with ID
            const newMember: TeamMember = {
              ...memberData,
              id: `user-${Date.now()}`,
            };
            addedMember = newMember;
            return {
              ...team,
              members: [...team.members, newMember],
              updated_at: new Date().toISOString(),
            };
          }
          return team;
        });

        // Save to localStorage for persistence
        try {
          localStorage.setItem("modellab_teams", JSON.stringify(updatedTeams));
        } catch (error) {
          console.error("Failed to save teams to localStorage", error);
        }
        return updatedTeams;
      });

      return addedMember;
    },
    [],
  );

  // Helper function to remove a member from assignees array
  const removeMemberFromAssignees = useCallback(
    (assignees: TeamMember[] | undefined, memberId: string) => {
      if (!assignees) return undefined;
      return assignees.filter((member) => member.id !== memberId);
    },
    [],
  );

  // Remove a team member
  const removeTeamMember = useCallback(
    (teamId: string, memberId: string) => {
      // First update the teams
      setTeams((prev) => {
        const updatedTeams = prev.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              members: team.members.filter((member) => member.id !== memberId),
              updated_at: new Date().toISOString(),
            };
          }
          return team;
        });

        // Save to localStorage for persistence
        try {
          localStorage.setItem("modellab_teams", JSON.stringify(updatedTeams));
        } catch (error) {
          console.error("Failed to save teams to localStorage", error);
        }
        return updatedTeams;
      });

      // Then update all projects to remove the member from assignees
      setProjects((prev) => {
        const updatedProjects = prev.map((project) => {
          // Remove from project assignees
          const updatedProject = {
            ...project,
            assignees: removeMemberFromAssignees(project.assignees, memberId),
            updated_at: new Date().toISOString(),
          };

          return updatedProject;
        });

        // Save to localStorage for persistence
        try {
          localStorage.setItem(
            "modellab_projects",
            JSON.stringify(updatedProjects),
          );
        } catch (error) {
          console.error("Failed to save projects to localStorage", error);
        }
        return updatedProjects;
      });
    },
    [removeMemberFromAssignees],
  );

  // Assign a team to a project
  const assignTeamToProject = useCallback(
    (projectId: string, teamId: string) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;

      setProjects((prev) => {
        const updatedProjects = prev.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              team_id: teamId,
              team: team,
              updated_at: new Date().toISOString(),
            };
          }
          return project;
        });

        // Save to localStorage for persistence
        try {
          localStorage.setItem(
            "modellab_projects",
            JSON.stringify(updatedProjects),
          );
        } catch (error) {
          console.error("Failed to save projects to localStorage", error);
        }
        return updatedProjects;
      });
    },
    [teams],
  );

  // Assign members to a project
  const assignMembersToProject = useCallback(
    (projectId: string, memberIds: string[]) => {
      // Collect all team members
      const allMembers = teams.flatMap((team) => team.members);
      const membersToAssign = allMembers.filter((member) =>
        memberIds.includes(member.id),
      );

      setProjects((prev) => {
        const updatedProjects = prev.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              assignees: membersToAssign,
              updated_at: new Date().toISOString(),
            };
          }
          return project;
        });

        // Save to localStorage for persistence
        try {
          localStorage.setItem(
            "modellab_projects",
            JSON.stringify(updatedProjects),
          );
        } catch (error) {
          console.error("Failed to save projects to localStorage", error);
        }
        return updatedProjects;
      });
    },
    [teams],
  );

  // Functions for assigning team members to different entities
  const assignTeamToCanvas = useCallback(
    (projectId: string, canvasId: string, teamMembers: TeamMember[]) => {
      // In a real implementation, this would make an API call to update the database
      // For now, we'll just log the assignment and update local state
      console.log(
        `Assigned ${teamMembers.length} team members to canvas ${canvasId} in project ${projectId}`,
      );

      // Update local state
      // This is a simplified implementation - in a real app, you would have a more complex data structure
      setProjects((prev) => {
        return prev.map((project) => {
          if (project.id === projectId) {
            // Assuming project has a canvases array
            const updatedProject = { ...project };
            // In a real implementation, you would update the specific canvas
            return updatedProject;
          }
          return project;
        });
      });
    },
    [],
  );

  const assignTeamToProductCanvas = useCallback(
    (projectId: string, canvasId: string, teamMembers: TeamMember[]) => {
      // Similar to assignTeamToCanvas but for product canvas
      console.log(
        `Assigned ${teamMembers.length} team members to product canvas ${canvasId} in project ${projectId}`,
      );

      // Update local state
      setProjects((prev) => {
        return prev.map((project) => {
          if (project.id === projectId) {
            // Assuming project has a productCanvases array
            const updatedProject = { ...project };
            // In a real implementation, you would update the specific product canvas
            return updatedProject;
          }
          return project;
        });
      });
    },
    [],
  );

  const assignTeamToExperiment = useCallback(
    (projectId: string, experimentId: string, teamMembers: TeamMember[]) => {
      console.log(
        `Assigned ${teamMembers.length} team members to experiment ${experimentId} in project ${projectId}`,
      );

      // Update local state
      setProjects((prev) => {
        return prev.map((project) => {
          if (project.id === projectId) {
            // Assuming project has an experiments array
            const updatedProject = { ...project };
            // In a real implementation, you would update the specific experiment
            // updatedProject.experiments = updatedProject.experiments.map(exp =>
            //   exp.id === experimentId ? { ...exp, assignees: teamMembers } : exp
            // );
            return updatedProject;
          }
          return project;
        });
      });
    },
    [],
  );

  // Remove a specific team member from an experiment
  const removeExperimentAssignee = useCallback(
    (projectId: string, experimentId: string, memberId: string) => {
      console.log(
        `Removed team member ${memberId} from experiment ${experimentId} in project ${projectId}`,
      );

      // Update local state
      setProjects((prev) => {
        return prev.map((project) => {
          if (project.id === projectId) {
            // Assuming project has an experiments array
            const updatedProject = { ...project };
            // In a real implementation, you would update the specific experiment
            // updatedProject.experiments = updatedProject.experiments.map(exp =>
            //   exp.id === experimentId
            //     ? { ...exp, assignees: exp.assignees.filter(a => a.id !== memberId) }
            //     : exp
            // );
            return updatedProject;
          }
          return project;
        });
      });
    },
    [],
  );

  // Remove all assignees from experiments
  const removeAllExperimentAssignees = useCallback(() => {
    console.log("Removing all assignees from experiments");

    // Update local state
    setProjects((prev) => {
      const updatedProjects = prev.map((project) => {
        // In a real implementation with actual experiments array
        // const updatedExperiments = project.experiments?.map(exp => ({
        //   ...exp,
        //   assignees: []
        // })) || [];

        // Return updated project
        return {
          ...project,
          // experiments: updatedExperiments
        };
      });

      // Save to localStorage for persistence
      try {
        localStorage.setItem(
          "modellab_projects",
          JSON.stringify(updatedProjects),
        );
      } catch (error) {
        console.error("Failed to save projects to localStorage", error);
      }
      return updatedProjects;
    });
  }, []);

  const assignTeamToInsight = useCallback(
    (projectId: string, insightId: string, teamMembers: TeamMember[]) => {
      console.log(
        `Assigned ${teamMembers.length} team members to insight ${insightId} in project ${projectId}`,
      );

      // Update local state
      setProjects((prev) => {
        return prev.map((project) => {
          if (project.id === projectId) {
            // Assuming project has an insights array
            const updatedProject = { ...project };
            // In a real implementation, you would update the specific insight
            // updatedProject.insights = updatedProject.insights.map(insight =>
            //   insight.id === insightId ? { ...insight, assignees: teamMembers } : insight
            // );
            return updatedProject;
          }
          return project;
        });
      });
    },
    [],
  );

  // Remove a specific team member from an insight
  const removeInsightAssignee = useCallback(
    (projectId: string, insightId: string, memberId: string) => {
      console.log(
        `Removed team member ${memberId} from insight ${insightId} in project ${projectId}`,
      );

      // Update local state
      setProjects((prev) => {
        return prev.map((project) => {
          if (project.id === projectId) {
            // Assuming project has an insights array
            const updatedProject = { ...project };
            // In a real implementation, you would update the specific insight
            // updatedProject.insights = updatedProject.insights.map(insight =>
            //   insight.id === insightId
            //     ? { ...insight, assignees: insight.assignees.filter(a => a.id !== memberId) }
            //     : insight
            // );
            return updatedProject;
          }
          return project;
        });
      });
    },
    [],
  );

  // Function to update experiment view mode and save to localStorage
  const handleSetExperimentViewMode = useCallback((mode: "board" | "table") => {
    setExperimentViewMode(mode);
    try {
      localStorage.setItem("modellab_experiment_view_mode", mode);
    } catch (error) {
      console.error(
        "Failed to save experiment view mode to localStorage",
        error,
      );
    }
  }, []);

  // Set project model type
  const setProjectModelType = useCallback(
    (projectId: string, modelType: ModelType) => {
      setProjects((prev) => {
        const updatedProjects = prev.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              modelType,
              updated_at: new Date().toISOString(),
            };
          }
          return project;
        });

        // Save to localStorage for persistence
        try {
          localStorage.setItem(
            "modellab_projects",
            JSON.stringify(updatedProjects),
          );
        } catch (error) {
          console.error("Failed to save projects to localStorage", error);
        }
        return updatedProjects;
      });
    },
    [],
  );

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        projects,
        setProjects,
        createProject,
        deleteProject,
        teams,
        setTeams,
        createTeam,
        deleteTeam,
        addTeamMember,
        removeTeamMember,
        assignTeamToProject,
        assignMembersToProject,
        assignTeamToCanvas,
        assignTeamToProductCanvas,
        assignTeamToExperiment,
        removeExperimentAssignee,
        assignTeamToInsight,
        removeInsightAssignee,
        removeAllExperimentAssignees,
        experimentViewMode,
        setExperimentViewMode: handleSetExperimentViewMode,
        setProjectModelType,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
});

const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

export { useProject, ProjectContext, ProjectProvider };
