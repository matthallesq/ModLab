import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Experiment, TeamMember } from "@/types/project";
import { useProject } from "./ProjectContext";
import { supabase } from "../../supabase/supabase";

interface ExperimentContextType {
  experiments: Record<string, Experiment[]>;
  loading: boolean;
  error: string | null;
  saveExperiment: (
    projectId: string,
    experiment: Experiment,
  ) => Promise<boolean>;
  getExperiments: (projectId: string) => Promise<Experiment[]>;
  getExperimentsSync: (projectId: string) => Experiment[];
  deleteExperiment: (
    projectId: string,
    experimentId: string,
  ) => Promise<boolean>;
  updateExperimentStatus: (
    projectId: string,
    experimentId: string,
    status: "backlog" | "running" | "completed",
  ) => Promise<boolean>;
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
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(
  undefined,
);

// Define the provider as a named function component
export function ExperimentProvider({ children }: { children: ReactNode }) {
  // Store experiments in state, fetched from Supabase
  const [experiments, setExperiments] = useState<Record<string, Experiment[]>>(
    {},
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load experiments from Supabase on initial load
  useEffect(() => {
    const fetchAllExperiments = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from("experiments").select("*");

        if (error) throw error;

        // Group experiments by project_id
        const experimentsByProject: Record<string, Experiment[]> = {};
        data.forEach((experiment: Experiment) => {
          if (!experimentsByProject[experiment.project_id]) {
            experimentsByProject[experiment.project_id] = [];
          }
          experimentsByProject[experiment.project_id].push(experiment);
        });

        setExperiments(experimentsByProject);
        console.log("Loaded experiments from Supabase", experimentsByProject);
      } catch (error) {
        console.error("Failed to load experiments from Supabase", error);
        setError("Failed to load experiments. Please try again later.");

        // Fallback to localStorage if Supabase fails
        try {
          const savedExperiments = localStorage.getItem("modellab_experiments");
          if (savedExperiments) {
            setExperiments(JSON.parse(savedExperiments));
            console.log("Loaded experiments from localStorage as fallback");
          }
        } catch (localError) {
          console.error(
            "Failed to load experiments from localStorage",
            localError,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllExperiments();
  }, []);

  // Queue for events that need to be added to the timeline
  const [pendingEvents, setPendingEvents] = useState<
    Array<{
      projectId: string;
      eventType: string;
      title: string;
      description: string;
      experimentId: string;
    }>
  >([]);

  // Try to get the project context, but don't throw if it's not available
  let projectContext;
  try {
    projectContext = useProject();
  } catch (error) {
    // ProjectContext not available, we'll handle this in useEffect
    console.log("ProjectContext not available, events will be queued");
  }

  // Process any pending events when the project context becomes available
  useEffect(() => {
    if (projectContext && pendingEvents.length > 0) {
      pendingEvents.forEach((event) => {
        projectContext.addExperimentEvent(
          event.projectId,
          event.eventType,
          event.title,
          event.description,
          event.experimentId,
        );
      });
      setPendingEvents([]);
    }
  }, [projectContext, pendingEvents]);

  // Function to add experiment events that works with or without ProjectContext
  const addExperimentEvent = useCallback(
    (
      projectId: string,
      eventType: string,
      title: string,
      description: string,
      experimentId: string,
    ) => {
      if (projectContext && projectContext.addExperimentEvent) {
        projectContext.addExperimentEvent(
          projectId,
          eventType,
          title,
          description,
          experimentId,
        );
      } else {
        // Queue the event for later processing
        setPendingEvents((prev) => [
          ...prev,
          { projectId, eventType, title, description, experimentId },
        ]);
      }
    },
    [projectContext],
  );

  // Add or update an experiment
  const saveExperiment = useCallback(
    async (projectId: string, experiment: Experiment) => {
      console.log("Saving experiment:", experiment, "for project:", projectId);
      setError(null);

      // Try to get subscription context to check limits
      let subscriptionContext;
      try {
        // This is a placeholder - in a real implementation, you would import and use the subscription context
        // subscriptionContext = useSubscription();
      } catch (error) {
        // Subscription context not available, we'll proceed without checking limits
        console.log(
          "Subscription context not available, proceeding without checking limits",
        );
      }

      // Check if we're at the experiment limit for this project
      const projectExperiments = experiments[projectId] || [];
      const isNewExperiment = !projectExperiments.some(
        (e) => e.id === experiment.id,
      );

      // If this is a new experiment and we have subscription context, check limits
      if (
        isNewExperiment &&
        subscriptionContext &&
        subscriptionContext.limits
      ) {
        const currentCount = projectExperiments.length;
        const maxAllowed = subscriptionContext.limits.maxExperiments;

        // If we've reached the limit, don't save and return false
        if (typeof maxAllowed === "number" && currentCount >= maxAllowed) {
          console.log(
            `Experiment limit reached: ${currentCount}/${maxAllowed}`,
          );
          // In a real implementation, you would show an upgrade prompt here
          return false;
        }
      }

      // Ensure experiment has all required fields
      const experimentToSave = {
        ...experiment,
        id: experiment.id || `exp-${Date.now()}`,
        status: experiment.status || "backlog",
        created_at: experiment.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        project_id: projectId,
      };

      try {
        let result;
        let eventType:
          | "experiment_created"
          | "experiment_running"
          | "experiment_completed" = "experiment_created";

        if (isNewExperiment) {
          // Insert new experiment
          result = await supabase
            .from("experiments")
            .insert(experimentToSave)
            .select()
            .single();

          eventType = "experiment_created";

          // Add timeline event for new experiment
          addExperimentEvent(
            projectId,
            "experiment_created",
            `New experiment created: ${experimentToSave.title}`,
            experimentToSave.description?.substring(0, 100) +
              (experimentToSave.description &&
              experimentToSave.description.length > 100
                ? "..."
                : ""),
            experimentToSave.id,
          );
        } else {
          // Find existing experiment to check status change
          const existingExperiment = projectExperiments.find(
            (e) => e.id === experimentToSave.id,
          );
          const oldStatus = existingExperiment?.status;

          // Update existing experiment
          result = await supabase
            .from("experiments")
            .update(experimentToSave)
            .eq("id", experimentToSave.id)
            .select()
            .single();

          // Determine event type based on status change
          if (oldStatus !== experimentToSave.status) {
            if (experimentToSave.status === "running") {
              eventType = "experiment_running";
            } else if (experimentToSave.status === "completed") {
              eventType = "experiment_completed";
            }

            // Add timeline event for status change
            addExperimentEvent(
              projectId,
              eventType,
              `Experiment ${eventType === "experiment_created" ? "created" : eventType === "experiment_running" ? "started" : "completed"}: ${experimentToSave.title}`,
              experimentToSave.description?.substring(0, 100) +
                (experimentToSave.description &&
                experimentToSave.description.length > 100
                  ? "..."
                  : ""),
              experimentToSave.id,
            );
          }
        }

        if (result.error) throw result.error;

        // Update local state
        setExperiments((prev) => {
          const projectExperiments = prev[projectId] || [];
          let updatedProjectExperiments;

          if (isNewExperiment) {
            updatedProjectExperiments = [
              ...projectExperiments,
              experimentToSave,
            ];
          } else {
            updatedProjectExperiments = projectExperiments.map((e) =>
              e.id === experimentToSave.id ? experimentToSave : e,
            );
          }

          return {
            ...prev,
            [projectId]: updatedProjectExperiments,
          };
        });

        // Also save to localStorage as backup
        try {
          localStorage.setItem(
            "modellab_experiments",
            JSON.stringify({
              ...experiments,
              [projectId]: [
                ...(experiments[projectId] || []),
                experimentToSave,
              ],
            }),
          );
        } catch (localError) {
          console.error(
            "Failed to save experiments to localStorage",
            localError,
          );
        }

        return true;
      } catch (error) {
        console.error("Failed to save experiment to Supabase", error);
        setError("Failed to save experiment. Please try again later.");
        return false;
      }
    },
    [addExperimentEvent, experiments],
  );

  // Get experiments for a project
  const getExperiments = useCallback(
    async (projectId: string) => {
      let isMounted = true;
      const controller = new AbortController();

      // Create a promise that we can use to track the loading state
      const loadingPromise = new Promise<Experiment[]>((resolve, reject) => {
        // First check if we already have the experiments in state
        if (experiments[projectId] && experiments[projectId].length > 0) {
          resolve(experiments[projectId]);
          return;
        }

        setLoading(true);
        setError(null);

        // Otherwise fetch from Supabase
        supabase
          .from("experiments")
          .select("*")
          .eq("project_id", projectId)
          .then(({ data, error }) => {
            if (controller.signal.aborted) {
              reject(new Error("Request was aborted"));
              return;
            }

            if (error) {
              throw error;
            }

            if (!isMounted) {
              reject(new Error("Component unmounted"));
              return;
            }

            // Update state with fetched experiments
            setExperiments((prev) => ({
              ...prev,
              [projectId]: data,
            }));

            // Also save to localStorage as backup
            try {
              const updatedExperiments = {
                ...experiments,
                [projectId]: data,
              };
              localStorage.setItem(
                "modellab_experiments",
                JSON.stringify(updatedExperiments),
              );
            } catch (localError) {
              console.error(
                "Failed to save experiments to localStorage",
                localError,
              );
            }

            if (isMounted) {
              setLoading(false);
            }

            resolve(data);
          })
          .catch((error) => {
            console.error("Failed to fetch experiments from Supabase", error);

            if (isMounted) {
              setError("Failed to load experiments. Please try again later.");
              setLoading(false);
            }

            // Return cached data if available
            resolve(experiments[projectId] || []);
          });
      });

      // Setup cleanup
      loadingPromise.finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

      // Return a cleanup function
      const cleanup = () => {
        isMounted = false;
        controller.abort();
      };

      // Attach the cleanup function to the promise
      (loadingPromise as any).cleanup = cleanup;

      return loadingPromise;
    },
    [experiments],
  );

  // Ensure cleanup happens when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any pending promises
      // This is a no-op if there are no pending promises
    };
  }, []);

  // Synchronous version for components that can't handle async
  const getExperimentsSync = useCallback(
    (projectId: string) => {
      // First check if we have experiments for this project in state
      if (experiments[projectId] && experiments[projectId].length > 0) {
        return experiments[projectId];
      }

      // If not, trigger an async fetch but return empty array for now
      // This ensures the component will re-render when data is available
      if (!loading) {
        getExperiments(projectId).catch((err) => {
          console.error(
            `Error fetching experiments in getExperimentsSync: ${err.message}`,
          );
        });
      }

      return experiments[projectId] || [];
    },
    [experiments, getExperiments, loading],
  );

  // Delete an experiment
  const deleteExperiment = useCallback(
    async (projectId: string, experimentId: string) => {
      setError(null);
      try {
        // Delete from Supabase
        const { error } = await supabase
          .from("experiments")
          .delete()
          .eq("id", experimentId);

        if (error) throw error;

        // Update local state
        setExperiments((prev) => {
          const projectExperiments = prev[projectId] || [];
          const updatedProjectExperiments = projectExperiments.filter(
            (e) => e.id !== experimentId,
          );

          const updatedExperiments = {
            ...prev,
            [projectId]: updatedProjectExperiments,
          };

          // Also update localStorage as backup
          try {
            localStorage.setItem(
              "modellab_experiments",
              JSON.stringify(updatedExperiments),
            );
          } catch (localError) {
            console.error(
              "Failed to update experiments in localStorage",
              localError,
            );
          }

          return updatedExperiments;
        });

        return true;
      } catch (error) {
        console.error("Failed to delete experiment from Supabase", error);
        setError("Failed to delete experiment. Please try again later.");
        return false;
      }
    },
    [],
  );

  // Update experiment status
  const updateExperimentStatus = useCallback(
    async (
      projectId: string,
      experimentId: string,
      status: "backlog" | "running" | "completed",
    ) => {
      setError(null);
      try {
        const projectExperiments = experiments[projectId] || [];
        const existingExperiment = projectExperiments.find(
          (e) => e.id === experimentId,
        );

        if (!existingExperiment) {
          throw new Error(`Experiment with ID ${experimentId} not found`);
        }

        const oldStatus = existingExperiment.status;
        const updatedExperiment = {
          ...existingExperiment,
          status,
          updated_at: new Date().toISOString(),
        };

        // Update in Supabase
        const { error } = await supabase
          .from("experiments")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", experimentId);

        if (error) throw error;

        // Update local state
        setExperiments((prev) => {
          const projectExperiments = prev[projectId] || [];
          const updatedProjectExperiments = projectExperiments.map((e) =>
            e.id === experimentId
              ? { ...e, status, updated_at: new Date().toISOString() }
              : e,
          );

          return {
            ...prev,
            [projectId]: updatedProjectExperiments,
          };
        });

        // Only add a timeline event if the status actually changed
        if (oldStatus !== status) {
          // Determine event type based on new status
          let eventType:
            | "experiment_created"
            | "experiment_running"
            | "experiment_completed";
          if (status === "running") {
            eventType = "experiment_running";
          } else if (status === "completed") {
            eventType = "experiment_completed";
          } else {
            eventType = "experiment_created";
          }

          // Add timeline event for status change
          addExperimentEvent(
            projectId,
            eventType,
            `Experiment ${status === "running" ? "started" : status === "completed" ? "completed" : "moved to backlog"}: ${existingExperiment.title}`,
            existingExperiment.description?.substring(0, 100) +
              (existingExperiment.description &&
              existingExperiment.description.length > 100
                ? "..."
                : ""),
            experimentId,
          );
        }

        // Also update localStorage as backup
        try {
          localStorage.setItem(
            "modellab_experiments",
            JSON.stringify({
              ...experiments,
              [projectId]: projectExperiments.map((e) =>
                e.id === experimentId
                  ? { ...e, status, updated_at: new Date().toISOString() }
                  : e,
              ),
            }),
          );
        } catch (localError) {
          console.error(
            "Failed to update experiments in localStorage",
            localError,
          );
        }

        return true;
      } catch (error) {
        console.error("Failed to update experiment status in Supabase", error);
        setError("Failed to update experiment status. Please try again later.");
        return false;
      }
    },
    [addExperimentEvent, experiments],
  );

  // Assign team members to an experiment
  const assignTeamToExperiment = useCallback(
    (projectId: string, experimentId: string, teamMembers: TeamMember[]) => {
      setExperiments((prev) => {
        const projectExperiments = prev[projectId] || [];
        const updatedProjectExperiments = projectExperiments.map(
          (experiment) => {
            if (experiment.id === experimentId) {
              return {
                ...experiment,
                assignees: teamMembers,
                updated_at: new Date().toISOString(),
              };
            }
            return experiment;
          },
        );

        const updatedExperiments = {
          ...prev,
          [projectId]: updatedProjectExperiments,
        };

        // Save to localStorage
        try {
          localStorage.setItem(
            "modellab_experiments",
            JSON.stringify(updatedExperiments),
          );
        } catch (error) {
          console.error("Failed to save experiments to localStorage", error);
        }

        return updatedExperiments;
      });
    },
    [],
  );

  // Remove a team member from an experiment
  const removeExperimentAssignee = useCallback(
    (projectId: string, experimentId: string, memberId: string) => {
      setExperiments((prev) => {
        const projectExperiments = prev[projectId] || [];
        const updatedProjectExperiments = projectExperiments.map(
          (experiment) => {
            if (experiment.id === experimentId && experiment.assignees) {
              return {
                ...experiment,
                assignees: experiment.assignees.filter(
                  (a) => a.id !== memberId,
                ),
                updated_at: new Date().toISOString(),
              };
            }
            return experiment;
          },
        );

        const updatedExperiments = {
          ...prev,
          [projectId]: updatedProjectExperiments,
        };

        // Save to localStorage
        try {
          localStorage.setItem(
            "modellab_experiments",
            JSON.stringify(updatedExperiments),
          );
        } catch (error) {
          console.error("Failed to save experiments to localStorage", error);
        }

        return updatedExperiments;
      });
    },
    [],
  );

  return (
    <ExperimentContext.Provider
      value={{
        experiments,
        loading,
        error,
        saveExperiment,
        getExperiments,
        getExperimentsSync,
        deleteExperiment,
        updateExperimentStatus,
        assignTeamToExperiment,
        removeExperimentAssignee,
      }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

// Define the hook as a named function
export function useExperiments() {
  const context = useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error("useExperiments must be used within an ExperimentProvider");
  }
  return context;
}

// Export the context directly
export { ExperimentContext };
