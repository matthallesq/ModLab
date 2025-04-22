import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TeamMemberSelector from "@/components/teams/TeamMemberSelector";
import { ChevronLeft, ChevronRight, Users, X } from "lucide-react";
import { TeamMember } from "@/types/project";
import { useProject } from "@/contexts/ProjectContext";

interface Experiment {
  id: string;
  title: string;
  description: string;
  hypothesis: string;
  test_description: string;
  success_criteria: string;
  results?: string;
  status: "backlog" | "running" | "completed";
  priority: "high" | "medium" | "low";
  created_at?: string;
  due_date?: string;
  assignee?: {
    name: string;
    avatar: string;
  };
  project_id: string;
  assignees?: TeamMember[];
}

interface ExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  experiment: Experiment | null;
  onSave: (experiment: Experiment) => void;
  onAssigneesChange?: (assignees: TeamMember[]) => void;
}

const ExperimentModal = ({
  isOpen,
  onClose,
  experiment,
  onSave,
  onAssigneesChange,
}: ExperimentModalProps) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = React.useState<Experiment>({
    id: "",
    title: "",
    description: "",
    hypothesis: "",
    test_description: "",
    success_criteria: "",
    status: "backlog",
    priority: "medium",
    created_at: new Date().toISOString(),
    due_date: "",
    project_id: "",
    assignees: [],
  });

  const [selectedAssignees, setSelectedAssignees] = React.useState<
    TeamMember[]
  >([]);

  React.useEffect(() => {
    if (experiment) {
      setFormData(experiment);
      setSelectedAssignees(experiment.assignees || []);
    } else {
      // Reset form for new experiment
      setFormData({
        id: String(Date.now()),
        title: "",
        description: "",
        hypothesis: "",
        test_description: "",
        success_criteria: "",
        status: "backlog",
        priority: "medium",
        created_at: new Date().toISOString(),
        due_date: "",
        project_id: experiment?.project_id || "",
        assignees: [],
      });
      setSelectedAssignees([]);
    }
  }, [experiment]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const { removeExperimentAssignee } = useProject();

  const handleAssigneesChange = (members: TeamMember[]) => {
    setSelectedAssignees(members);
    if (onAssigneesChange) {
      onAssigneesChange(members);
    }
  };

  const handleRemoveAssignee = (memberId: string) => {
    if (experiment?.id && experiment?.project_id) {
      // Call the context function to remove the assignee
      removeExperimentAssignee(experiment.project_id, experiment.id, memberId);

      // Update local state
      const updatedAssignees = selectedAssignees.filter(
        (member) => member.id !== memberId,
      );
      setSelectedAssignees(updatedAssignees);
      if (onAssigneesChange) {
        onAssigneesChange(updatedAssignees);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure assignees and timestamps are included in the saved data
    const experimentToSave = {
      ...formData,
      assignees: selectedAssignees,
      updated_at: new Date().toISOString(),
      // If this is a new experiment, set created_at
      created_at: formData.created_at || new Date().toISOString(),
    };
    console.log(
      "Saving experiment with assignees:",
      experimentToSave.assignees,
    );
    await onSave(experimentToSave);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Title & Description";
      case 2:
        return "Hypothesis";
      case 3:
        return "Test Description";
      case 4:
        return "Success Criteria";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {experiment ? "Edit Experiment" : "Create New Experiment"} - Step{" "}
            {currentStep}: {getStepTitle()}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            {/* Common fields that are always visible */}
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="created_at">Created Date</Label>
                    <Input
                      id="created_at"
                      name="created_at"
                      type="date"
                      value={
                        formData.created_at
                          ? new Date(formData.created_at)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: value as "backlog" | "running" | "completed",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="backlog">Backlog</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: value as "high" | "medium" | "low",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      name="due_date"
                      type="date"
                      value={
                        formData.due_date
                          ? new Date(formData.due_date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {/* Step 2: Hypothesis */}
            {currentStep === 2 && (
              <div className="grid gap-2">
                <Label htmlFor="hypothesis">Hypothesis</Label>
                <Textarea
                  id="hypothesis"
                  name="hypothesis"
                  value={formData.hypothesis}
                  onChange={handleChange}
                  required
                  className="min-h-[200px]"
                />
              </div>
            )}

            {/* Step 3: Test Description */}
            {currentStep === 3 && (
              <div className="grid gap-2">
                <Label htmlFor="test_description">Test Description</Label>
                <Textarea
                  id="test_description"
                  name="test_description"
                  value={formData.test_description}
                  onChange={handleChange}
                  required
                  className="min-h-[200px]"
                />
              </div>
            )}

            {/* Step 4: Success Criteria */}
            {currentStep === 4 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="success_criteria">Success Criteria</Label>
                  <Textarea
                    id="success_criteria"
                    name="success_criteria"
                    value={formData.success_criteria}
                    onChange={handleChange}
                    required
                    className="min-h-[200px]"
                  />
                </div>
                {formData.status === "completed" && (
                  <div className="grid gap-2">
                    <Label htmlFor="results">Results</Label>
                    <Textarea
                      id="results"
                      name="results"
                      value={formData.results || ""}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="flex flex-col pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <TeamMemberSelector
                      selectedMembers={selectedAssignees}
                      onChange={handleAssigneesChange}
                      buttonText="Assign Team Members"
                    />
                  </div>

                  {selectedAssignees.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">
                        Assigned Members:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAssignees.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center bg-gray-100 rounded-full pl-1 pr-2 py-1"
                          >
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-6 h-6 rounded-full mr-1"
                            />
                            <span className="text-xs">{member.name}</span>
                            <button
                              onClick={() => handleRemoveAssignee(member.id)}
                              className="ml-1 text-gray-500 hover:text-red-500"
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex justify-between w-full">
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="mr-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit">Save Experiment</Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExperimentModal;
