import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseClient";
import {
  ModelType,
  Project,
  Team,
  TeamMember,
  Insight,
  TimelineEvent,
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
  ) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  archiveProject: (projectId: string) => Promise<void>;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  createTeam: (name: string, description?: string) => Promise<Team>;
  deleteTeam: (teamId: string) => Promise<void>;
  addTeamMember: (
    teamId: string,
    member: Omit<TeamMember, "id">,
  ) => Promise<TeamMember | null>;
  removeTeamMember: (teamId: string, memberId: string) => Promise<void>;
  assignTeamToProject: (projectId: string, teamId: string) => Promise<void>;
  assignMembersToProject: (
    projectId: string,
    memberIds: string[],
  ) => Promise<void>;
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
  addTimelineEvent: (
    projectId: string,
    event: Omit<TimelineEvent, "id" | "timestamp">,
  ) => void;
  addModelEvent: (
    projectId: string,
    type: "model_added" | "model_updated",
    title: string,
    description?: string,
    entityId?: string,
  ) => void;
  addExperimentEvent: (
    projectId: string,
    type: "experiment_created" | "experiment_running" | "experiment_completed",
    title: string,
    description?: string,
    entityId?: string,
  ) => void;
  addInsightEvent: (
    projectId: string,
    title: string,
    description?: string,
    entityId?: string,
  ) => void;
  saveInsight: (projectId: string, insight: Insight) => void;
  getInsights: (projectId: string) => Insight[];
  deleteInsight: (projectId: string, insightId: string) => void;
  loading: {
    projects: boolean;
    teams: boolean;
  };
  error: {
    projects?: string;
    teams?: string;
  };
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

function ProjectProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState({
    projects: true,
    teams: true,
  });
  const [error, setError] = useState<{
    projects?: string;
    teams?: string;
  }>({});

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading((prev) => ({ ...prev, projects: true }));

        const { data, error } = await supabase
          .from("projects")
          .select(
            `
            *,
            team:teams(*),
            assignees:project_team_members(team_member:team_members(*)),
            timelineEvents:timeline_events(*)
          `,
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform data to match Project type
        const transformedProjects = data.map((project: any) => {
          return {
            ...project,
            team: project.team,
            assignees: project.assignees?.map((a: any) => a.team_member) || [],
            analytics: {
              validatedExperiments: 0, // Will be updated when we fetch experiments
              totalExperiments: 0,
              totalInsights: 0,
            },
          };
        });

        setProjects(transformedProjects);
        setError((prev) => ({ ...prev, projects: undefined }));
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        setError((prev) => ({ ...prev, projects: error.message }));
        // Fall back to sample data in development
        if (import.meta.env.DEV) {
          setProjects(
            sampleProjects.map((project) => ({
              ...project,
              timelineEvents: project.timelineEvents || [],
            })),
          );
        }
      } finally {
        setLoading((prev) => ({ ...prev, projects: false }));
      }
    };

    fetchProjects();
  }, []);

  // Fetch teams from Supabase
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading((prev) => ({ ...prev, teams: true }));

        const { data, error } = await supabase
          .from("teams")
          .select(
            `
            *,
            members:team_members(*)
          `,
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform data to match Team type
        const transformedTeams = data.map((team: any) => {
          return {
            ...team,
            members: team.members || [],
          };
        });

        setTeams(transformedTeams);
        setError((prev) => ({ ...prev, teams: undefined }));
      } catch (error: any) {
        console.error("Error fetching teams:", error);
        setError((prev) => ({ ...prev, teams: error.message }));
        // Fall back to sample data in development
        if (import.meta.env.DEV) {
          setTeams(sampleTeams);
        }
      } finally {
        setLoading((prev) => ({ ...prev, teams: false }));
      }
    };

    fetchTeams();
  }, []);

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

  // Helper function to fetch project analytics data
  const fetchProjectAnalytics = useCallback(async (projectId: string) => {
    try {
      // Fetch experiment counts
      const { data: experiments, error: experimentsError } = await supabase
        .from("experiments")
        .select("id, status")
        .eq("project_id", projectId);

      if (experimentsError) {
        console.error(
          "Error fetching experiments for analytics:",
          experimentsError,
        );
        return {
          validatedExperiments: 0,
          totalExperiments: 0,
          totalInsights: 0,
        };
      }

      // Count validated experiments (status === 'completed')
      const validatedExperiments =
        experiments?.filter((exp) => exp.status === "completed").length || 0;
      const totalExperiments = experiments?.length || 0;

      // Fetch insight count
      const { count: totalInsights, error: insightsError } = await supabase
        .from("insights")
        .select("id", { count: "exact", head: true })
        .eq("project_id", projectId);

      if (insightsError) {
        console.error("Error fetching insights for analytics:", insightsError);
        return {
          validatedExperiments,
          totalExperiments,
          totalInsights: 0,
        };
      }

      return {
        validatedExperiments,
        totalExperiments,
        totalInsights: totalInsights || 0,
      };
    } catch (error) {
      console.error("Error calculating project analytics:", error);
      return {
        validatedExperiments: 0,
        totalExperiments: 0,
        totalInsights: 0,
      };
    }
  }, []);

  // Helper function to create a timeline event
  const createTimelineEvent = useCallback(
    async (
      projectId: string,
      type: TimelineEventType,
      title: string,
      description: string,
      userId: string,
      userName: string,
      entityType?: string,
    ) => {
      try {
        const { error } = await supabase.from("timeline_events").insert({
          type,
          title,
          description,
          user_id: userId,
          user_name: userName,
          entity_type: entityType,
          project_id: projectId,
        });

        if (error) {
          console.error("Failed to create timeline event:", error);
        }
      } catch (error) {
        console.error("Error creating timeline event:", error);
      }
    },
    [],
  );

  // Create a new project
  const createProject = useCallback(
    async (
      name: string,
      description: string,
      navigateToProjects = false,
      modelType?: ModelType,
    ) => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Create new project in Supabase
        const { data, error } = await supabase
          .from("projects")
          .insert({
            name,
            description,
            model_type: modelType,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

        // Create initial timeline event
        await createTimelineEvent(
          data.id,
          "model_added",
          `Project created: ${name}`,
          description,
          user.id,
          user.email || "", // Use email as name if user profile not set up
          "project",
        );

        // Fetch the newly created project with all relations
        const { data: projectWithRelations, error: fetchError } = await supabase
          .from("projects")
          .select(
            `
            *,
            team:teams(*),
            assignees:project_team_members(team_member:team_members(*)),
            timelineEvents:timeline_events(*)
          `,
          )
          .eq("id", data.id)
          .single();

        if (fetchError) throw fetchError;

        // Fetch analytics data for the new project
        const analytics = await fetchProjectAnalytics(data.id);

        // Transform to match Project type
        const newProject: Project = {
          ...projectWithRelations,
          team: projectWithRelations.team,
          assignees:
            projectWithRelations.assignees?.map((a: any) => a.team_member) ||
            [],
          analytics,
          modelType: projectWithRelations.model_type as ModelType | undefined,
        };

        // Add to projects list
        setProjects((prev) => [newProject, ...prev]);

        // Set as selected project
        setSelectedProject(newProject);

        // Navigate to projects page if requested
        if (navigateToProjects) {
          navigate("/projects");
        }

        return newProject;
      } catch (error: any) {
        console.error("Error creating project:", error);

        // In development, fall back to local implementation
        if (import.meta.env.DEV) {
          console.log("Using local fallback for project creation");

          // Create new project object
          const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: "user-123", // In a real app, this would be the current user's ID
            modelType, // Optional model type - will be undefined for new projects by default
            analytics: {
              validatedExperiments: 0,
              totalExperiments: 0,
              totalInsights: 0,
            },
            timelineEvents: [
              // Add initial timeline event for project creation
              {
                id: `event-${Date.now()}`,
                type: "model_added",
                title: `Project created: ${name}`,
                description: description,
                timestamp: new Date().toISOString(),
                userId: "user-123", // In a real app, this would be the current user's ID
                userName: "John Doe", // In a real app, this would be the current user's name
                entityType: "project",
              },
            ],
          };

          // Add to projects list
          setProjects((prev) => [newProject, ...prev]);

          // Set as selected project
          setSelectedProject(newProject);

          // Navigate to projects page if requested
          if (navigateToProjects) {
            navigate("/projects");
          }

          return newProject;
        }

        throw error;
      }
    },
    [navigate, createTimelineEvent, fetchProjectAnalytics],
  );

  // Archive/unarchive a project
  const archiveProject = useCallback(async (projectId: string) => {
    try {
      // First, get the current project to check its archived status
      const { data: currentProject, error: fetchError } = await supabase
        .from("projects")
        .select("archived")
        .eq("id", projectId)
        .single();

      if (fetchError) throw fetchError;

      // Toggle the archived status
      const newArchivedStatus = !currentProject.archived;

      // Update the project in Supabase
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          archived: newArchivedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (updateError) throw updateError;

      // Update local state
      setProjects((prev) => {
        return prev.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              archived: newArchivedStatus,
              updated_at: new Date().toISOString(),
            };
          }
          return project;
        });
      });
    } catch (error: any) {
      console.error("Error archiving project:", error);

      // In development, fall back to local implementation
      if (import.meta.env.DEV) {
        console.log("Using local fallback for project archiving");

        setProjects((prev) => {
          const updatedProjects = prev.map((project) => {
            if (project.id === projectId) {
              // Toggle the archived status
              return {
                ...project,
                archived: !project.archived,
                updated_at: new Date().toISOString(),
              };
            }
            return project;
          });
          return updatedProjects;
        });
      } else {
        throw error;
      }
    }
  }, []);

  // Delete a project
  const deleteProject = useCallback(
    async (projectId: string) => {
      try {
        // Delete the project from Supabase
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", projectId);

        if (error) throw error;

        // Update local state
        setProjects((prev) => {
          return prev.filter((project) => project.id !== projectId);
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
      } catch (error: any) {
        console.error("Error deleting project:", error);

        // In development, fall back to local implementation
        if (import.meta.env.DEV) {
          console.log("Using local fallback for project deletion");

          setProjects((prev) => {
            return prev.filter((project) => project.id !== projectId);
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
        } else {
          throw error;
        }
      }
    },
    [projects, selectedProject],
  );

  // Create a new team
  const createTeam = useCallback(async (name: string, description?: string) => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create new team in Supabase
      const { data, error } = await supabase
        .from("teams")
        .insert({
          name,
          description,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the current user as a team member with owner role
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: data.id,
          user_id: user.id,
          name: user.email?.split("@")[0] || "Team Owner", // Use email username as name
          email: user.email || "",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          role: "owner",
        });

      if (memberError) throw memberError;

      // Fetch the newly created team with all members
      const { data: teamWithMembers, error: fetchError } = await supabase
        .from("teams")
        .select(
          `
          *,
          members:team_members(*)
        `,
        )
        .eq("id", data.id)
        .single();

      if (fetchError) throw fetchError;

      // Transform to match Team type
      const newTeam: Team = {
        ...teamWithMembers,
        members: teamWithMembers.members || [],
      };

      // Add to teams list
      setTeams((prev) => [newTeam, ...prev]);

      return newTeam;
    } catch (error: any) {
      console.error("Error creating team:", error);

      // In development, fall back to local implementation
      if (import.meta.env.DEV) {
        console.log("Using local fallback for team creation");

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
        setTeams((prev) => [newTeam, ...prev]);

        return newTeam;
      }

      throw error;
    }
  }, []);

  // Delete a team
  const deleteTeam = useCallback(
    async (teamId: string) => {
      try {
        // Delete the team from Supabase
        // Note: This will cascade delete all team members due to foreign key constraints
        const { error } = await supabase
          .from("teams")
          .delete()
          .eq("id", teamId);

        if (error) throw error;

        // Update local state for teams
        setTeams((prev) => {
          return prev.filter((team) => team.id !== teamId);
        });

        // Update local state for projects that had this team assigned
        setProjects((prev) => {
          return prev.map((project) => {
            if (project.team_id === teamId) {
              return { ...project, team_id: undefined, team: undefined };
            }
            return project;
          });
        });
      } catch (error: any) {
        console.error("Error deleting team:", error);

        // In development, fall back to local implementation
        if (import.meta.env.DEV) {
          console.log("Using local fallback for team deletion");

          setTeams((prev) => {
            return prev.filter((team) => team.id !== teamId);
          });

          // Also update projects that had this team assigned
          setProjects((prev) => {
            return prev.map((project) => {
              if (project.team_id === teamId) {
                return { ...project, team_id: undefined, team: undefined };
              }
              return project;
            });
          });
        } else {
          throw error;
        }
      }
    },
    [projects],
  );

  // Add a team member
  const addTeamMember = useCallback(
    async (teamId: string, memberData: Omit<TeamMember, "id">) => {
      try {
        // Add team member to Supabase
        const { data, error } = await supabase
          .from("team_members")
          .insert({
            team_id: teamId,
            user_id: null, // This would be set if the member is an existing user
            name: memberData.name,
            email: memberData.email,
            avatar:
              memberData.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberData.name}`,
            role: memberData.role,
          })
          .select()
          .single();

        if (error) throw error;

        // Create TeamMember object from the response
        const newMember: TeamMember = {
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          role: data.role as TeamMember["role"],
        };

        // Update local state
        setTeams((prev) => {
          return prev.map((team) => {
            if (team.id === teamId) {
              return {
                ...team,
                members: [...team.members, newMember],
                updated_at: new Date().toISOString(),
              };
            }
            return team;
          });
        });

        return newMember;
      } catch (error: any) {
        console.error("Error adding team member:", error);

        // In development, fall back to local implementation
        if (import.meta.env.DEV) {
          console.log("Using local fallback for adding team member");

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
            return updatedTeams;
          });

          return addedMember;
        }

        throw error;
      }
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
    async (teamId: string, memberId: string) => {
      try {
        // Delete the team member from Supabase
        const { error } = await supabase
          .from("team_members")
          .delete()
          .eq("id", memberId)
          .eq("team_id", teamId);

        if (error) throw error;

        // Update local state for teams
        setTeams((prev) => {
          return prev.map((team) => {
            if (team.id === teamId) {
              return {
                ...team,
                members: team.members.filter(
                  (member) => member.id !== memberId,
                ),
                updated_at: new Date().toISOString(),
              };
            }
            return team;
          });
        });

        // Update local state for projects to remove the member from assignees
        setProjects((prev) => {
          return prev.map((project) => {
            return {
              ...project,
              assignees: removeMemberFromAssignees(project.assignees, memberId),
              updated_at: new Date().toISOString(),
            };
          });
        });

        // Delete from project_team_members table
        const { error: projectMemberError } = await supabase
          .from("project_team_members")
          .delete()
          .eq("team_member_id", memberId);

        if (projectMemberError)
          console.error(
            "Error removing from project_team_members:",
            projectMemberError,
          );

        // Delete from experiment_team_members table
        const { error: experimentMemberError } = await supabase
          .from("experiment_team_members")
          .delete()
          .eq("team_member_id", memberId);

        if (experimentMemberError)
          console.error(
            "Error removing from experiment_team_members:",
            experimentMemberError,
          );

        // Delete from insight_team_members table
        const { error: insightMemberError } = await supabase
          .from("insight_team_members")
          .delete()
          .eq("team_member_id", memberId);

        if (insightMemberError)
          console.error(
            "Error removing from insight_team_members:",
            insightMemberError,
          );
      } catch (error: any) {
        console.error("Error removing team member:", error);

        // In development, fall back to local implementation
        if (import.meta.env.DEV) {
          console.log("Using local fallback for removing team member");

          // First update the teams
          setTeams((prev) => {
            return prev.map((team) => {
              if (team.id === teamId) {
                return {
                  ...team,
                  members: team.members.filter(
                    (member) => member.id !== memberId,
                  ),
                  updated_at: new Date().toISOString(),
                };
              }
              return team;
            });
          });

          // Then update all projects to remove the member from assignees
          setProjects((prev) => {
            return prev.map((project) => {
              return {
                ...project,
                assignees: removeMemberFromAssignees(
                  project.assignees,
                  memberId,
                ),
                updated_at: new Date().toISOString(),
              };
            });
          });
        } else {
          throw error;
        }
      }
    },
    [removeMemberFromAssignees],
  );

  // Assign a team to a project
  const assignTeamToProject = useCallback(
    async (projectId: string, teamId: string) => {
      try {
        const team = teams.find((t) => t.id === teamId);
        if (!team) return;

        // Update the project in Supabase
        const { error } = await supabase
          .from("projects")
          .update({
            team_id: teamId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);

        if (error) throw error;

        // Update local state
        setProjects((prev) => {
          return prev.map((project) => {
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
        });
      } catch (error: any) {
        console.error("Error assigning team to project:", error);

        // In development, fall back to local implementation
        if (import.meta.env.DEV) {
          console.log("Using local fallback for assigning team to project");

          const team = teams.find((t) => t.id === teamId);
          if (!team) return;

          setProjects((prev) => {
            return prev.map((project) => {
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
          });
        } else {
          throw error;
        }
      }
    },
    [teams],
  );

  // Assign members to a project
  const assignMembersToProject = useCallback(
    async (projectId: string, memberIds: string[]) => {
      try {
        // Collect all team members
        const allMembers = teams.flatMap((team) => team.members);
        const membersToAssign = allMembers.filter((member) =>
          memberIds.includes(member.id),
        );

        // First, delete all existing project team members
        const { error: deleteError } = await supabase
          .from("project_team_members")
          .delete()
          .eq("project_id", projectId);

        if (deleteError) throw deleteError;

        // Then, insert new project team members
        if (membersToAssign.length > 0) {
          const projectTeamMembers = membersToAssign.map((member) => ({
            project_id: projectId,
            team_member_id: member.id,
          }));

          const { error: insertError } = await supabase
            .from("project_team_members")
            .insert(projectTeamMembers);

          if (insertError) throw insertError;
        }

        // Update local state
        setProjects((prev) => {
          return prev.map((project) => {
            if (project.id === projectId) {
              return {
                ...project,
                assignees: membersToAssign,
                updated_at: new Date().toISOString(),
              };
            }
            return project;
          });
        });
      } catch (error: any) {
        console.error("Error assigning members to project:", error);

        // In development, fall back to local implementation
        if (import.meta.env.DEV) {
          console.log("Using local fallback for assigning members to project");

          // Collect all team members
          const allMembers = teams.flatMap((team) => team.members);
          const membersToAssign = allMembers.filter((member) =>
            memberIds.includes(member.id),
          );

          setProjects((prev) => {
            return prev.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  assignees: membersToAssign,
                  updated_at: new Date().toISOString(),
                };
              }
              return project;
            });
          });
        } else {
          throw error;
        }
      }
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

  // Store insights in localStorage
  const [insights, setInsights] = useState<Record<string, Insight[]>>(() => {
    try {
      const savedInsights = localStorage.getItem("modellab_insights");
      return savedInsights ? JSON.parse(savedInsights) : {};
    } catch (error) {
      console.error("Failed to load insights from localStorage", error);
      return {};
    }
  });

  // Add a timeline event to a project
  const addTimelineEvent = useCallback(
    (projectId: string, eventData: Omit<TimelineEvent, "id" | "timestamp">) => {
      console.log("Adding timeline event to project", projectId, eventData);
      setProjects((prev) => {
        const updatedProjects = prev.map((project) => {
          if (project.id === projectId) {
            const newEvent: TimelineEvent = {
              ...eventData,
              id: `event-${Date.now()}`,
              timestamp: new Date().toISOString(),
            };

            console.log("Creating new event", newEvent);
            console.log("Current timeline events", project.timelineEvents);

            const updatedProject = {
              ...project,
              timelineEvents: [...(project.timelineEvents || []), newEvent],
              updated_at: new Date().toISOString(),
            };

            console.log(
              "Updated timeline events",
              updatedProject.timelineEvents,
            );
            return updatedProject;
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

  // Add a model event to the timeline
  const addModelEvent = useCallback(
    (
      projectId: string,
      type: "model_added" | "model_updated",
      title: string,
      description?: string,
      entityId?: string,
    ) => {
      addTimelineEvent(projectId, {
        type,
        title,
        description,
        entityId,
        entityType: "model",
        userId: "user-123", // In a real app, this would be the current user's ID
        userName: "John Doe", // In a real app, this would be the current user's name
      });
    },
    [addTimelineEvent],
  );

  // Add an experiment event to the timeline
  const addExperimentEvent = useCallback(
    (
      projectId: string,
      type:
        | "experiment_created"
        | "experiment_running"
        | "experiment_completed",
      title: string,
      description?: string,
      entityId?: string,
    ) => {
      addTimelineEvent(projectId, {
        type,
        title,
        description,
        entityId,
        entityType: "experiment",
        userId: "user-123", // In a real app, this would be the current user's ID
        userName: "John Doe", // In a real app, this would be the current user's name
      });
    },
    [addTimelineEvent],
  );

  // Add an insight event to the timeline
  const addInsightEvent = useCallback(
    (
      projectId: string,
      title: string,
      description?: string,
      entityId?: string,
    ) => {
      addTimelineEvent(projectId, {
        type: "insight_added",
        title,
        description,
        entityId,
        entityType: "insight",
        userId: "user-123", // In a real app, this would be the current user's ID
        userName: "John Doe", // In a real app, this would be the current user's name
      });
    },
    [addTimelineEvent],
  );

  // Add or update an insight
  const saveInsight = useCallback(
    async (projectId: string, insight: Insight) => {
      try {
        let savedInsight;

        if (insight.id && insight.id.startsWith("insight-")) {
          // This is a new insight with a temporary ID
          const { id, ...insightData } = insight;

          // Insert new insight into Supabase
          const { data, error } = await supabase
            .from("insights")
            .insert({
              ...insightData,
              project_id: projectId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          savedInsight = { ...data, id: data.id };

          // Add a timeline event for the new insight
          await addInsightEvent(
            projectId,
            insight.title,
            insight.insight_text.substring(0, 100) +
              (insight.insight_text.length > 100 ? "..." : ""),
            savedInsight.id,
          );

          // Update project analytics
          setProjects((prevProjects) => {
            return prevProjects.map((project) => {
              if (project.id === projectId) {
                return {
                  ...project,
                  analytics: {
                    ...project.analytics,
                    totalInsights: (project.analytics?.totalInsights || 0) + 1,
                  },
                };
              }
              return project;
            });
          });
        } else {
          // Update existing insight
          const { error } = await supabase
            .from("insights")
            .update({
              title: insight.title,
              type: insight.type,
              hypothesis: insight.hypothesis,
              observation: insight.observation,
              insight_text: insight.insight_text,
              next_steps: insight.next_steps,
              updated_at: new Date().toISOString(),
            })
            .eq("id", insight.id);

          if (error) throw error;
          savedInsight = insight;
        }

        // Update local state
        setInsights((prev) => {
          const projectInsights = prev[projectId] || [];
          const existingIndex = projectInsights.findIndex(
            (i) => i.id === savedInsight.id,
          );

          let updatedProjectInsights;
          if (existingIndex >= 0) {
            // Update existing insight
            updatedProjectInsights = [...projectInsights];
            updatedProjectInsights[existingIndex] = savedInsight;
          } else {
            // Add new insight
            updatedProjectInsights = [...projectInsights, savedInsight];
          }

          return {
            ...prev,
            [projectId]: updatedProjectInsights,
          };
        });

        return savedInsight;
      } catch (error: any) {
        console.error("Error saving insight:", error);

        // Fall back to local implementation in development
        if (import.meta.env.DEV) {
          setInsights((prev) => {
            const projectInsights = prev[projectId] || [];
            const existingIndex = projectInsights.findIndex(
              (i) => i.id === insight.id,
            );

            let updatedProjectInsights;
            if (existingIndex >= 0) {
              // Update existing insight
              updatedProjectInsights = [...projectInsights];
              updatedProjectInsights[existingIndex] = insight;
            } else {
              // Add new insight with temporary ID if none exists
              const newInsight = {
                ...insight,
                id: insight.id || `insight-${Date.now()}`,
                created_at: insight.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              updatedProjectInsights = [...projectInsights, newInsight];

              // Update project analytics
              setProjects((prevProjects) => {
                return prevProjects.map((project) => {
                  if (project.id === projectId) {
                    return {
                      ...project,
                      analytics: {
                        ...project.analytics,
                        totalInsights:
                          (project.analytics?.totalInsights || 0) + 1,
                      },
                    };
                  }
                  return project;
                });
              });

              // Add a timeline event for the new insight
              addInsightEvent(
                projectId,
                newInsight.title,
                newInsight.insight_text.substring(0, 100) +
                  (newInsight.insight_text.length > 100 ? "..." : ""),
                newInsight.id,
              );

              return {
                ...prev,
                [projectId]: updatedProjectInsights,
              };
            }

            return {
              ...prev,
              [projectId]: updatedProjectInsights,
            };
          });
        }

        throw error;
      }
    },
    [addInsightEvent],
  );

  // Get insights for a project
  const getInsights = useCallback(
    (projectId: string) => {
      return insights[projectId] || [];
    },
    [insights],
  );

  // Delete an insight
  const deleteInsight = useCallback((projectId: string, insightId: string) => {
    setInsights((prev) => {
      const projectInsights = prev[projectId] || [];
      const updatedProjectInsights = projectInsights.filter(
        (i) => i.id !== insightId,
      );

      const updatedInsights = {
        ...prev,
        [projectId]: updatedProjectInsights,
      };

      // Save to localStorage
      try {
        localStorage.setItem(
          "modellab_insights",
          JSON.stringify(updatedInsights),
        );
      } catch (error) {
        console.error("Failed to save insights to localStorage", error);
      }

      // Update project analytics
      setProjects((prevProjects) => {
        const updatedProjects = prevProjects.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              analytics: {
                ...project.analytics,
                totalInsights: Math.max(
                  (project.analytics?.totalInsights || 0) - 1,
                  0,
                ),
              },
            };
          }
          return project;
        });

        // Save updated projects to localStorage
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

      return updatedInsights;
    });
  }, []);

  const assignTeamToInsight = useCallback(
    (projectId: string, insightId: string, teamMembers: TeamMember[]) => {
      console.log(
        `Assigned ${teamMembers.length} team members to insight ${insightId} in project ${projectId}`,
      );

      // Update insights state
      setInsights((prev) => {
        const projectInsights = prev[projectId] || [];
        const updatedProjectInsights = projectInsights.map((insight) => {
          if (insight.id === insightId) {
            return {
              ...insight,
              assignees: teamMembers,
            };
          }
          return insight;
        });

        const updatedInsights = {
          ...prev,
          [projectId]: updatedProjectInsights,
        };

        // Save to localStorage
        try {
          localStorage.setItem(
            "modellab_insights",
            JSON.stringify(updatedInsights),
          );
        } catch (error) {
          console.error("Failed to save insights to localStorage", error);
        }

        return updatedInsights;
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

      // Update insights state
      setInsights((prev) => {
        const projectInsights = prev[projectId] || [];
        const updatedProjectInsights = projectInsights.map((insight) => {
          if (insight.id === insightId && insight.assignees) {
            return {
              ...insight,
              assignees: insight.assignees.filter((a) => a.id !== memberId),
            };
          }
          return insight;
        });

        const updatedInsights = {
          ...prev,
          [projectId]: updatedProjectInsights,
        };

        // Save to localStorage
        try {
          localStorage.setItem(
            "modellab_insights",
            JSON.stringify(updatedInsights),
          );
        } catch (error) {
          console.error("Failed to save insights to localStorage", error);
        }

        return updatedInsights;
      });
    },
    [],
  );

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
        archiveProject,
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
        setExperimentViewMode,
        setProjectModelType,
        addTimelineEvent,
        addModelEvent,
        addExperimentEvent,
        addInsightEvent,
        saveInsight,
        getInsights,
        deleteInsight,
        loading,
        error,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

export { ProjectProvider, useProject };
