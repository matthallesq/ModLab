import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, Edit, Trash2, Link, Eye } from "lucide-react";
import { Insight } from "@/types/project";
import { sampleInsights } from "./sampleInsights";
import InsightModal from "./InsightModal";
import { format } from "date-fns";
import { useProject } from "@/contexts/ProjectContext";

interface InsightTableProps {
  isLoading?: boolean;
  projectId?: string;
}

const InsightTable: React.FC<InsightTableProps> = ({
  isLoading = false,
  projectId: propProjectId,
}) => {
  const { selectedProject } = useProject();
  const projectId = propProjectId || selectedProject?.id;
  const [insights, setInsights] = useState<Insight[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load insights (from sample data for now)
  useEffect(() => {
    // In a real app, this would fetch from an API based on projectId
    setInsights(sampleInsights);
  }, [projectId]);

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
    // This would open an edit modal in a real implementation
    console.log("Edit insight:", insight);
  };

  const handleDeleteInsight = (insightId: string) => {
    // This would show a confirmation dialog in a real implementation
    console.log("Delete insight:", insightId);
    setInsights(insights.filter((insight) => insight.id !== insightId));
  };

  const handleCreateInsight = () => {
    setIsModalOpen(true);
  };

  const handleSaveInsight = (
    newInsight: Omit<Insight, "id" | "created_at" | "updated_at">,
  ) => {
    // In a real app, this would be an API call
    const createdInsight: Insight = {
      ...newInsight,
      id: `insight-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setInsights([createdInsight, ...insights]);
  };

  const handleViewInsight = (insight: Insight) => {
    // This would open a detail view in a real implementation
    console.log("View insight details:", insight);
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
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insight</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Linked Experiment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsights.map((insight) => (
                <TableRow key={insight.id}>
                  <TableCell className="font-medium">{insight.title}</TableCell>
                  <TableCell>
                    {insight.type && (
                      <Badge variant="outline">{insight.type}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {insight.created_at
                      ? format(new Date(insight.created_at), "dd/MM/yyyy")
                      : ""}
                  </TableCell>
                  <TableCell>
                    {insight.experiment_id ? (
                      <div className="flex items-center">
                        <Link className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-500">Linked</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewInsight(insight)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditInsight(insight)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteInsight(insight.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InsightModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveInsight}
        projectId={projectId || ""}
        insightTypes={insightTypes.filter((type) => type !== "all")}
      />
    </div>
  );
};

export default InsightTable;
