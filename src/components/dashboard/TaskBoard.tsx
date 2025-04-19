import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, LayoutGrid, List } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";
import ExperimentModal from "./ExperimentModal";
import ExperimentsTable from "./ExperimentsTable";
import { useProject } from "@/contexts/ProjectContext";

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

const defaultExperiments: Experiment[] = [
  {
    id: "1",
    title: "Customer Segment Validation",
    description: "Validate our primary customer segment assumptions",
    hypothesis:
      "Startup founders are our primary customer segment with the highest conversion rate",
    test_description:
      "Run targeted ads to different segments and measure click-through and signup rates",
    success_criteria:
      "Startup segment shows >2% conversion vs <1% for other segments",
    status: "backlog",
    priority: "high",
    created_at: "2023-07-01",
    due_date: "2023-07-15",
    assignee: null,
    assignees: [
      {
        id: "1",
        name: "Alice Smith",
        email: "alice@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        role: "owner",
      },
      {
        id: "2",
        name: "Bob Johnson",
        email: "bob@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        role: "admin",
      },
    ],
    project_id: "1",
  },
  {
    id: "2",
    title: "Pricing Model Test",
    description: "Test different pricing tiers to optimize conversion",
    hypothesis:
      "A three-tier pricing model will convert better than a two-tier model",
    test_description:
      "A/B test the pricing page with different tier structures",
    success_criteria: ">15% improvement in conversion rate for the test group",
    status: "running",
    priority: "medium",
    created_at: "2023-07-05",
    due_date: "2023-07-20",
    assignee: null,
    assignees: [
      {
        id: "3",
        name: "Carol Williams",
        email: "carol@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
        role: "member",
      },
    ],
    project_id: "1",
  },
  {
    id: "3",
    title: "Onboarding Flow Optimization",
    description: "Simplify the onboarding process to improve completion rates",
    hypothesis:
      "Reducing onboarding steps from 5 to 3 will increase completion by 30%",
    test_description:
      "Create a streamlined onboarding flow and measure completion rates",
    success_criteria: "Onboarding completion increases from 65% to >80%",
    results: "Completion rate increased to 83%, confirming our hypothesis",
    status: "completed",
    priority: "low",
    created_at: "2023-06-15",
    due_date: "2023-07-10",
    assignee: null,
    assignees: [
      {
        id: "1",
        name: "Alice Smith",
        email: "alice@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
        role: "owner",
      },
      {
        id: "2",
        name: "Bob Johnson",
        email: "bob@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
        role: "admin",
      },
      {
        id: "3",
        name: "Carol Williams",
        email: "carol@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
        role: "member",
      },
    ],
    project_id: "1",
  },
];

const ExperimentBoard = ({
  experiments = defaultExperiments,
  onExperimentMove = () => {},
  onExperimentClick = () => {},
  isLoading = false,
  projectId: propProjectId,
}: ExperimentBoardProps) => {
  const { selectedProject, experimentViewMode, setExperimentViewMode } =
    useProject();
  const effectiveProjectId = propProjectId || selectedProject?.id;
  const [loading, setLoading] = useState(isLoading);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] =
    useState<Experiment | null>(null);
  const [localExperiments, setLocalExperiments] =
    useState<Experiment[]>(experiments);
  const [viewMode, setViewMode] = useState<"board" | "table">(
    experimentViewMode,
  );

  // Simulate loading for demo purposes
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // In a real app, this would fetch experiments based on projectId
  useEffect(() => {
    if (effectiveProjectId) {
      console.log(`Fetching experiments for project: ${effectiveProjectId}`);
      // This would be an API call in a real implementation
      // For now, we'll just use the default experiments
    }
  }, [effectiveProjectId]);

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

    // Update local state
    setLocalExperiments((prev) =>
      prev.map((exp) => (exp.id === experimentId ? { ...exp, status } : exp)),
    );

    // Call the prop callback
    onExperimentMove(experimentId, status);
  };

  const handleOpenModal = (experiment: Experiment | null = null) => {
    setSelectedExperiment(experiment);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedExperiment(null);
  };

  const handleSaveExperiment = (experiment: Experiment) => {
    if (selectedExperiment) {
      // Update existing experiment
      setLocalExperiments((prev) =>
        prev.map((exp) => (exp.id === experiment.id ? experiment : exp)),
      );
    } else {
      // Add new experiment
      setLocalExperiments((prev) => [...prev, experiment]);
    }
    handleCloseModal();
    console.log("Saved experiment with assignees:", experiment.assignees);
  };

  const handleAssigneesChange = (assignees: TeamMember[]) => {
    if (selectedExperiment) {
      setSelectedExperiment({
        ...selectedExperiment,
        assignees: assignees,
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
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4 h-9 shadow-sm transition-colors"
          onClick={() => handleOpenModal()}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Experiment
        </Button>
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
                {localExperiments
                  .filter((experiment) => experiment.status === column.id)
                  .map((experiment) => (
                    <motion.div
                      key={experiment.id}
                      layoutId={experiment.id}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e as any, experiment.id)
                      }
                    >
                      <Card className="p-4 hover:shadow-md transition-all duration-200 rounded-xl border-0 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">
                            {experiment.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(experiment);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[calc(100%-4rem)] overflow-auto">
          <ExperimentsTable
            experiments={localExperiments}
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
