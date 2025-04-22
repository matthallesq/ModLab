import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, LayoutGrid, List, Search } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import ExperimentModal from "./ExperimentModal";
import ExperimentsTable from "./ExperimentsTable";
import { useProject } from "@/contexts/ProjectContext";
import { useExperiments } from "@/contexts/ExperimentContext";
import { Input } from "@/components/ui/input";

import { TeamMember } from "@/types/project";

interface Experiment {
  id: string;
  title: string;
  description: string;
  hypothesis: string;
  test_description: string;
  success_criteria: string;
  results?: string;
  status: "backlog" | "running" | "completed";
  priority?: "low" | "medium" | "high";
  created_at?: string;
  due_date?: string;
  assignee?: {
    name: string;
    avatar: string;
  };
  assignees?: TeamMember[];
  project_id: string;
  isLoading?: boolean;
  isDeleting?: boolean;
}

interface ExperimentBoardProps {
  experiments?: Experiment[];
  onExperimentMove?: (
    experimentId: string,
    newStatus: Experiment["status"],
  ) => void;
  onExperimentClick?: (experiment: Experiment) => void;
  isLoading?: boolean;
  projectId?: string;
}

// Empty default experiments array
const defaultExperiments: Experiment[] = [];

const ExperimentBoard = ({
  experiments = defaultExperiments,
  onExperimentMove = () => {},
  onExperimentClick = () => {},
  isLoading = false,
  projectId: propProjectId,
}: ExperimentBoardProps) => {
  const { selectedProject, experimentViewMode, setExperimentViewMode } =
    useProject();
  const {
    saveExperiment,
    getExperiments,
    deleteExperiment,
    updateExperimentStatus,
  } = useExperiments();
  const effectiveProjectId = propProjectId || selectedProject?.id;
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] =
    useState<Experiment | null>(null);
  const [localExperiments, setLocalExperiments] =
    useState<Experiment[]>(experiments);
  const [viewMode, setViewMode] = useState<"board" | "table">(
    experimentViewMode,
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Simulate loading for demo purposes
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Load experiments when component mounts or projectId changes
  useEffect(() => {
    if (effectiveProjectId) {
      console.log(`Fetching experiments for project: ${effectiveProjectId}`);
      setLoading(true);
      setError(null);
      getExperiments(effectiveProjectId)
        .then((projectExperiments) => {
          setLocalExperiments(projectExperiments);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching experiments:", err);
          setError("Failed to load experiments. Please try again.");
          setLoading(false);
        });
    }
  }, [effectiveProjectId, getExperiments]);

  // Refresh local experiments whenever the experiments in context change
  // This ensures that any changes made to experiments (including status changes) are reflected
  useEffect(() => {
    if (effectiveProjectId) {
      getExperiments(effectiveProjectId)
        .then((projectExperiments) => {
          setLocalExperiments(projectExperiments);
        })
        .catch((error) => {
          console.error("Error refreshing experiments:", error);
        });
    }
  }, [effectiveProjectId, getExperiments, experiments]);

  useEffect(() => {
    setLocalExperiments(experiments);
  }, [experiments]);

  const columns = [
    {
      id: "backlog",
      title: "Backlog",
      color: "bg-gray-50",
      borderColor: "border-gray-200",
    },
    {
      id: "running",
      title: "Running",
      color: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      id: "completed",
      title: "Completed",
      color: "bg-green-50",
      borderColor: "border-green-100",
    },
  ];

  const handleDragStart = (e: React.DragEvent, experimentId: string) => {
    e.dataTransfer.setData("experimentId", experimentId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: Experiment["status"]) => {
    e.preventDefault();
    const experimentId = e.dataTransfer.getData("experimentId");

    if (!effectiveProjectId) return;

    // Find the experiment being moved
    const experiment = localExperiments.find((exp) => exp.id === experimentId);
    if (!experiment) return;

    // Don't do anything if status hasn't changed
    if (experiment.status === status) return;

    // Show loading state for this specific experiment
    setLocalExperiments((prev) =>
      prev.map((exp) =>
        exp.id === experimentId ? { ...exp, status, isLoading: true } : exp,
      ),
    );

    // Update in context (which will save to Supabase)
    updateExperimentStatus(effectiveProjectId, experimentId, status)
      .then((success) => {
        if (!success) {
          console.error("Failed to update experiment status");
          setError(
            `Failed to update status for experiment "${experiment.title}". Please try again.`,
          );
          // Revert local state if update failed
          getExperiments(effectiveProjectId).then(setLocalExperiments);
        } else {
          // Update local state to remove loading indicator
          setLocalExperiments((prev) =>
            prev.map((exp) =>
              exp.id === experimentId
                ? { ...exp, status, isLoading: false }
                : exp,
            ),
          );
          // Call the prop callback
          onExperimentMove(experimentId, status);
        }
      })
      .catch((error) => {
        console.error("Error updating experiment status:", error);
        setError(
          `Error updating status for experiment "${experiment.title}". Please try again.`,
        );
        // Revert local state if update failed
        getExperiments(effectiveProjectId).then(setLocalExperiments);
      });
  };

  const handleOpenModal = (experiment: Experiment | null = null) => {
    setSelectedExperiment(experiment);
    setModalOpen(true);
  };

  const handleDeleteExperiment = (experimentId: string) => {
    if (!effectiveProjectId) return;

    // Find the experiment to be deleted
    const experiment = localExperiments.find((exp) => exp.id === experimentId);
    if (!experiment) return;

    if (
      window.confirm(
        `Are you sure you want to delete the experiment "${experiment.title}"?`,
      )
    ) {
      // Set loading state for this operation
      setLoading(true);

      // Mark this experiment as being deleted in the UI
      setLocalExperiments((prev) =>
        prev.map((exp) =>
          exp.id === experimentId ? { ...exp, isDeleting: true } : exp,
        ),
      );

      // Delete experiment from context (which will delete from Supabase)
      deleteExperiment(effectiveProjectId, experimentId)
        .then((success) => {
          if (success) {
            console.log(`Experiment ${experimentId} deleted successfully`);
            // Remove from local state after successful deletion
            setLocalExperiments(
              localExperiments.filter((exp) => exp.id !== experimentId),
            );
          } else {
            console.error(`Failed to delete experiment ${experimentId}`);
            setError(
              `Failed to delete experiment "${experiment.title}". Please try again.`,
            );
            // Revert local state if delete failed
            getExperiments(effectiveProjectId).then(setLocalExperiments);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error(`Error deleting experiment ${experimentId}:`, error);
          setError(
            `Error deleting experiment "${experiment.title}". Please try again.`,
          );
          // Revert local state if delete failed
          getExperiments(effectiveProjectId).then(setLocalExperiments);
          setLoading(false);
        });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedExperiment(null);
  };

  const handleSaveExperiment = async (experiment: Experiment) => {
    if (!effectiveProjectId) {
      console.error("Cannot save experiment: No project ID available");
      return;
    }

    console.log("Saving experiment in TaskBoard:", experiment);
    setLoading(true);

    // Ensure experiment has required fields
    const experimentToSave: Experiment = {
      ...experiment,
      id: experiment.id || `exp-${Date.now()}`,
      created_at: experiment.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: effectiveProjectId,
      status: experiment.status || "backlog", // Ensure status is set
    };

    // Save experiment to context
    console.log(
      "Calling saveExperiment with:",
      effectiveProjectId,
      experimentToSave,
    );

    try {
      // saveExperiment returns a Promise<boolean>
      const saveResult = await saveExperiment(
        effectiveProjectId,
        experimentToSave,
      );
      console.log("Save result:", saveResult);

      // If save was successful (not rejected due to subscription limits)
      if (saveResult) {
        // Refresh experiments from context to ensure we have the latest data
        const updatedExperiments = await getExperiments(effectiveProjectId);
        console.log("Updated experiments after save:", updatedExperiments);
        setLocalExperiments(updatedExperiments);
        handleCloseModal();
        console.log("Saved experiment with assignees:", experiment.assignees);
      } else {
        console.error("Failed to save experiment - subscription limit reached");
        alert("Failed to save experiment - subscription limit reached");
      }
    } catch (error) {
      console.error("Error saving experiment:", error);
      alert("Error saving experiment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneesChange = (assignees: TeamMember[]) => {
    if (selectedExperiment) {
      setSelectedExperiment({
        ...selectedExperiment,
        assignees: assignees,
      });
    }
  };

  // Function to filter experiments based on search query
  const filteredExperiments = searchQuery
    ? localExperiments.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.hypothesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.success_criteria
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (exp.results &&
            exp.results.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : localExperiments;

  // Function to retry loading experiments
  const retryLoadExperiments = () => {
    setError(null);
    if (effectiveProjectId) {
      setLoading(true);
      getExperiments(effectiveProjectId)
        .then((projectExperiments) => {
          setLocalExperiments(projectExperiments);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching experiments:", err);
          setError("Failed to load experiments. Please try again.");
          setLoading(false);
        });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Experiment Board
          </h2>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors opacity-50 cursor-not-allowed">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Experiment
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6 h-[calc(100%-4rem)]">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`${column.color} rounded-xl p-4 border ${column.borderColor}`}
            >
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <span
                  className={`h-2 w-2 rounded-full mr-2 ${column.id === "backlog" ? "bg-gray-400" : column.id === "running" ? "bg-blue-400" : "bg-green-400"}`}
                ></span>
                {column.title}
              </h3>
              <div className="space-y-3 flex flex-col items-center justify-center min-h-[200px]">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-4 border-gray-100 border-t-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500/20 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mt-3">
                  Loading experiments...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show full-page error state only for critical errors that prevent the board from loading
  if (error && localExperiments.length === 0) {
    return (
      <div className="w-full h-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Experiment Board
          </h2>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors"
            onClick={retryLoadExperiments}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            Retry
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] text-center">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="font-medium">{error}</p>
          </div>
          <p className="text-gray-500 max-w-md">
            There was a problem loading your experiments. This could be due to a
            network issue or a problem with the database connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-gray-900 mr-4">
            Experiments
          </h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "board" ? "default" : "ghost"}
              size="sm"
              className={`rounded-md ${viewMode === "board" ? "bg-white shadow-sm" : "bg-transparent"}`}
              onClick={() => {
                setViewMode("board");
                setExperimentViewMode("board");
              }}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Board
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className={`rounded-md ${viewMode === "table" ? "bg-white shadow-sm" : "bg-transparent"}`}
              onClick={() => {
                setViewMode("table");
                setExperimentViewMode("table");
              }}
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
        </div>
        <div className="flex items-center">
          {/* Search input */}
          <div className="relative mr-4">
            <Input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 pl-9 rounded-full bg-gray-50 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Show toast-style error for non-critical errors */}
          {error && localExperiments.length > 0 && (
            <div className="mr-4 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="mr-2">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors"
            onClick={() => handleOpenModal()}
            disabled={loading}
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Add Experiment
          </Button>
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid grid-cols-3 gap-6 h-[calc(100%-4rem)]">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`${column.color} rounded-xl p-4 border ${column.borderColor}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as Experiment["status"])}
            >
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <span
                  className={`h-2 w-2 rounded-full mr-2 ${column.id === "backlog" ? "bg-gray-400" : column.id === "running" ? "bg-blue-400" : "bg-green-400"}`}
                ></span>
                {column.title}
              </h3>
              <div className="space-y-3">
                {filteredExperiments.length === 0 && column.id === "backlog" ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery
                      ? "No experiments match your search."
                      : 'No experiments yet. Click "Add Experiment" to create one.'}
                  </div>
                ) : (
                  filteredExperiments
                    .filter((experiment) => experiment.status === column.id)
                    .map((experiment) => (
                      <motion.div
                        key={experiment.id}
                        layoutId={experiment.id}
                        draggable={
                          !(experiment.isLoading || experiment.isDeleting)
                        }
                        onDragStart={(e) =>
                          handleDragStart(e as any, experiment.id)
                        }
                        className={
                          experiment.isDeleting
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }
                      >
                        <Card className="p-4 hover:shadow-md transition-all duration-200 rounded-xl border-0 bg-white shadow-sm relative">
                          {(experiment.isLoading || experiment.isDeleting) && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl z-10">
                              <div className="h-6 w-6 rounded-full border-2 border-gray-100 border-t-blue-500 animate-spin" />
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">
                              {experiment.title}
                            </h4>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                disabled={
                                  experiment.isLoading || experiment.isDeleting
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(experiment);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={
                                  experiment.isLoading || experiment.isDeleting
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteExperiment(experiment.id);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {experiment.description}
                          </p>
                          <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
                            <div>
                              <span className="font-medium">Hypothesis:</span>{" "}
                              {experiment.hypothesis.length > 60
                                ? `${experiment.hypothesis.substring(0, 60)}...`
                                : experiment.hypothesis}
                            </div>
                            <div>
                              <span className="font-medium">
                                Success Criteria:
                              </span>{" "}
                              {experiment.success_criteria.length > 60
                                ? `${experiment.success_criteria.substring(0, 60)}...`
                                : experiment.success_criteria}
                            </div>
                            {experiment.results && (
                              <div className="text-green-600">
                                <span className="font-medium">Results:</span>{" "}
                                {experiment.results.length > 60
                                  ? `${experiment.results.substring(0, 60)}...`
                                  : experiment.results}
                              </div>
                            )}
                            {experiment.priority && (
                              <div className="flex items-center">
                                <span className="font-medium mr-1">
                                  Priority:
                                </span>{" "}
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${experiment.priority === "high" ? "bg-red-100 text-red-700" : experiment.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                                >
                                  {experiment.priority.charAt(0).toUpperCase() +
                                    experiment.priority.slice(1)}
                                </span>
                              </div>
                            )}
                            {experiment.due_date && (
                              <div>
                                <span className="font-medium">Due:</span>{" "}
                                {new Date(
                                  experiment.due_date,
                                ).toLocaleDateString()}
                              </div>
                            )}
                            {experiment.created_at && (
                              <div>
                                <span className="font-medium">Created:</span>{" "}
                                {new Date(
                                  experiment.created_at,
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {/* Show assignees */}
                          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                            {experiment.assignees &&
                            experiment.assignees.length > 0 ? (
                              <div className="flex -space-x-2 overflow-hidden">
                                {experiment.assignees
                                  .slice(0, 3)
                                  .map((member) => (
                                    <img
                                      key={member.id}
                                      src={member.avatar}
                                      alt={member.name}
                                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                                      title={member.name}
                                    />
                                  ))}
                                {experiment.assignees.length > 3 && (
                                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-500">
                                    +{experiment.assignees.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No assignees
                              </span>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[calc(100%-4rem)] overflow-auto">
          <ExperimentsTable
            experiments={filteredExperiments}
            onExperimentClick={handleOpenModal}
          />
        </div>
      )}

      <ExperimentModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        experiment={selectedExperiment}
        onSave={handleSaveExperiment}
        onAssigneesChange={handleAssigneesChange}
      />
    </div>
  );
};

export default ExperimentBoard;
