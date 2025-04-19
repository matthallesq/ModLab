import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Insight, TeamMember } from "@/types/project";
import TeamMemberSelector from "@/components/teams/TeamMemberSelector";
import { X } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

interface InsightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    insight: Omit<Insight, "id" | "created_at" | "updated_at"> & {
      assignees?: TeamMember[];
    },
    insightId?: string,
  ) => void;
  projectId: string;
  insightTypes: string[];
  assignees?: TeamMember[];
  onAssigneesChange?: (assignees: TeamMember[]) => void;
  editingInsight?: Insight;
  mode?: "create" | "edit" | "view";
}

const InsightModal: React.FC<InsightModalProps> = ({
  open,
  onOpenChange,
  onSave,
  projectId,
  insightTypes = [
    "User Research",
    "Market Analysis",
    "Experiment Result",
    "Customer Feedback",
  ],
  assignees = [],
  onAssigneesChange,
  editingInsight,
  mode = "create",
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("");
  const [hypothesis, setHypothesis] = useState<string>("");
  const [observation, setObservation] = useState<string>("");
  const [insightText, setInsightText] = useState<string>("");
  const [nextSteps, setNextSteps] = useState<string>("");
  const [selectedAssignees, setSelectedAssignees] =
    useState<TeamMember[]>(assignees);
  const { removeInsightAssignee } = useProject();

  // Initialize form with editing insight data if provided
  useEffect(() => {
    if (editingInsight && (mode === "edit" || mode === "view")) {
      setTitle(editingInsight.title);
      setType(editingInsight.type || "");
      setHypothesis(editingInsight.hypothesis || "");
      setObservation(editingInsight.observation || "");
      setInsightText(editingInsight.insight_text);
      setNextSteps(editingInsight.next_steps || "");
      setSelectedAssignees(editingInsight.assignees || []);
    } else {
      resetForm();
      setSelectedAssignees(assignees);
    }
  }, [editingInsight, mode, assignees]);

  const handleAssigneesChange = (members: TeamMember[]) => {
    console.log("InsightModal - assignees changed:", members);
    setSelectedAssignees(members);
    if (onAssigneesChange) {
      onAssigneesChange(members);
    }
  };

  const handleRemoveAssignee = (memberId: string) => {
    if (editingInsight?.id) {
      // Call the context function to remove the assignee
      removeInsightAssignee(projectId, editingInsight.id, memberId);

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

  const handleSave = () => {
    if (!title || !insightText) return;

    const insightData = {
      title,
      type,
      hypothesis,
      observation,
      insight_text: insightText,
      next_steps: nextSteps,
      project_id: projectId,
      experiment_id: editingInsight?.experiment_id || null,
      assignees: selectedAssignees, // Make sure assignees are included
    };

    console.log("Saving insight with assignees:", selectedAssignees);
    onSave(insightData, editingInsight?.id);

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setType("");
    setHypothesis("");
    setObservation("");
    setInsightText("");
    setNextSteps("");
    setSelectedAssignees([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Add New Insight"
              : mode === "edit"
                ? "Edit Insight"
                : "View Insight"}
          </DialogTitle>
          <DialogDescription>
            {mode === "view"
              ? "Review the details of this insight."
              : "Document your learnings and insights to inform your business model."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Brief title for your insight"
              required
              disabled={mode === "view"}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={type}
              onValueChange={setType}
              disabled={mode === "view"}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select insight type" />
              </SelectTrigger>
              <SelectContent>
                {insightTypes.map((insightType) => (
                  <SelectItem key={insightType} value={insightType}>
                    {insightType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hypothesis" className="text-right">
              Hypothesis
            </Label>
            <Textarea
              id="hypothesis"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="col-span-3"
              placeholder="What was your initial hypothesis?"
              disabled={mode === "view"}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="observation" className="text-right">
              Observation
            </Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="col-span-3"
              placeholder="What did you observe?"
              disabled={mode === "view"}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="insight" className="text-right">
              Insight *
            </Label>
            <Textarea
              id="insight"
              value={insightText}
              onChange={(e) => setInsightText(e.target.value)}
              className="col-span-3"
              placeholder="What did you learn?"
              required
              disabled={mode === "view"}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextSteps" className="text-right">
              Next Steps
            </Label>
            <Textarea
              id="nextSteps"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="col-span-3"
              placeholder="What actions will you take based on this insight?"
              disabled={mode === "view"}
            />
          </div>
        </div>

        <div className="flex flex-col pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            {mode !== "view" && (
              <TeamMemberSelector
                selectedMembers={selectedAssignees}
                onChange={handleAssigneesChange}
                buttonText="Assign Team Members"
              />
            )}
            {mode === "view" &&
              selectedAssignees &&
              selectedAssignees.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Assigned to:</span>
                  <div className="flex -space-x-2 overflow-hidden">
                    {selectedAssignees.slice(0, 3).map((member) => (
                      <img
                        key={member.id}
                        src={member.avatar}
                        alt={member.name}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        title={member.name}
                      />
                    ))}
                    {selectedAssignees.length > 3 && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-500">
                        +{selectedAssignees.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          {mode !== "view" && selectedAssignees.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">Assigned Members:</p>
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

        <DialogFooter>
          {mode === "view" ? (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title || !insightText}>
                {mode === "edit" ? "Update Insight" : "Save Insight"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsightModal;
