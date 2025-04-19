import React, { useState, useEffect } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import InsightCard from "./InsightCard";
import InsightModal from "./InsightModal";
import { Insight, TeamMember } from "@/types/project";
import { sampleInsights } from "./sampleInsights";

interface InsightBoardProps {
  isLoading?: boolean;
  projectId?: string;
}

const InsightBoard: React.FC<InsightBoardProps> = ({
  isLoading = false,
  projectId: propProjectId,
}) => {
  const { selectedProject } = useProject();
  const effectiveProjectId = propProjectId || selectedProject?.id;
  const [insights, setInsights] = useState<Insight[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<Insight | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [currentAssignees, setCurrentAssignees] = useState<TeamMember[]>([]);

  // Load insights (from sample data for now)
  useEffect(() => {
    // In a real app, this would fetch from an API based on projectId
    console.log(`Fetching insights for project: ${effectiveProjectId}`);
    setInsights(sampleInsights);
  }, [effectiveProjectId]);

  // Filter insights based on search term and type filter
  const filteredInsights = insights.filter((insight) => {
    const matchesSearch =
      searchTerm === "" ||
      insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (insight.insight_text &&
        insight.insight_text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      !filterType || filterType === "all" || insight.type === filterType;

    return matchesSearch && matchesType;
  });

  // Get unique insight types for filter dropdown
  const insightTypes = [
    "all",
    ...new Set(insights.map((insight) => insight.type).filter(Boolean)),
  ] as string[];

  const handleEditInsight = (insight: Insight) => {
    setCurrentInsight(insight);
    setCurrentAssignees(insight.assignees || []);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteInsight = (insightId: string) => {
    // This would show a confirmation dialog in a real implementation
    console.log("Delete insight:", insightId);
    setInsights(insights.filter((insight) => insight.id !== insightId));
  };

  const handleCreateInsight = () => {
    setCurrentInsight(null);
    setCurrentAssignees([]);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleViewInsight = (insight: Insight) => {
    setCurrentInsight(insight);
    setCurrentAssignees(insight.assignees || []);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAssigneesChange = (assignees: TeamMember[]) => {
    console.log("InsightBoard - assignees changed:", assignees);
    setCurrentAssignees(assignees);
  };

  const handleSaveInsight = (
    newInsight: Omit<Insight, "id" | "created_at" | "updated_at"> & {
      assignees?: TeamMember[];
    },
    insightId?: string,
  ) => {
    if (insightId) {
      // Update existing insight
      const updatedInsights = insights.map((insight) =>
        insight.id === insightId
          ? {
              ...insight,
              ...newInsight,
              assignees: currentAssignees, // Use currentAssignees instead of newInsight.assignees
              updated_at: new Date().toISOString(),
            }
          : insight,
      );
      setInsights(updatedInsights);
      console.log("Updated insight with assignees:", currentAssignees);
    } else {
      // Create new insight
      const createdInsight: Insight = {
        ...newInsight,
        id: `insight-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignees: currentAssignees, // Use currentAssignees
      };
      setInsights([createdInsight, ...insights]);
      console.log("Created new insight with assignees:", currentAssignees);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Insights</h2>
        <Button
          onClick={handleCreateInsight}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" /> New Insight
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search insights..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filterType || "all"}
            onValueChange={setFilterType}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {insightTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500">
            {searchTerm || filterType
              ? "No insights match your filters"
              : "No insights yet. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onEdit={handleEditInsight}
              onDelete={handleDeleteInsight}
              onView={handleViewInsight}
            />
          ))}
        </div>
      )}

      <InsightModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveInsight}
        projectId={effectiveProjectId || ""}
        insightTypes={insightTypes.filter((type) => type !== "all")}
        assignees={currentAssignees}
        onAssigneesChange={handleAssigneesChange}
        editingInsight={currentInsight || undefined}
        mode={modalMode}
      />
    </div>
  );
};

export default InsightBoard;
