import React, { useState, useEffect } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Save,
  GripVertical,
  X,
  Edit,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  ProductCanvasData,
  Insight,
  CanvasItemStatus,
  TeamMember,
} from "@/types/project";
import TeamMemberSelector from "@/components/teams/TeamMemberSelector";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { sampleInsights } from "@/components/insights/sampleInsights";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CanvasItem {
  id: string;
  text: string;
  status: CanvasItemStatus;
}

interface CanvasSection {
  id: string;
  title: string;
  items: CanvasItem[];
  key: keyof ProductCanvasData;
}

interface ProductCanvasProps {
  isLoading?: boolean;
  onSave?: (data: ProductCanvasData) => void;
  initialData?: ProductCanvasData;
  projectId?: string;
  assignees?: TeamMember[];
  onAssigneesChange?: (assignees: TeamMember[]) => void;
}

const mapSectionToCanvasData = (
  sections: CanvasSection[],
): ProductCanvasData => {
  const canvasData: ProductCanvasData = {
    problem: [],
    solution: [],
    key_metrics: [],
    unique_value_proposition: [],
    unfair_advantage: [],
    channels: [],
    customer_segments: [],
    cost_structure: [],
    revenue_streams: [],
  };

  sections.forEach((section) => {
    canvasData[section.key] = section.items.map((item) => ({
      text: item.text,
      status: item.status,
    }));
  });

  return canvasData;
};

const mapCanvasDataToSections = (
  canvasData: ProductCanvasData,
): CanvasSection[] => {
  return [
    {
      id: "problem",
      title: "Problem",
      key: "problem",
      items: canvasData.problem.map((item, index) => ({
        id: `problem-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "solution",
      title: "Solution",
      key: "solution",
      items: canvasData.solution.map((item, index) => ({
        id: `solution-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "key-metrics",
      title: "Key Metrics",
      key: "key_metrics",
      items: canvasData.key_metrics.map((item, index) => ({
        id: `key-metrics-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "unique-value-proposition",
      title: "Unique Value Proposition",
      key: "unique_value_proposition",
      items: canvasData.unique_value_proposition.map((item, index) => ({
        id: `unique-value-proposition-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "unfair-advantage",
      title: "Unfair Advantage",
      key: "unfair_advantage",
      items: canvasData.unfair_advantage.map((item, index) => ({
        id: `unfair-advantage-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "channels",
      title: "Channels",
      key: "channels",
      items: canvasData.channels.map((item, index) => ({
        id: `channels-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "customer-segments",
      title: "Customer Segments",
      key: "customer_segments",
      items: canvasData.customer_segments.map((item, index) => ({
        id: `customer-segments-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "cost-structure",
      title: "Cost Structure",
      key: "cost_structure",
      items: canvasData.cost_structure.map((item, index) => ({
        id: `cost-structure-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "revenue-streams",
      title: "Revenue Streams",
      key: "revenue_streams",
      items: canvasData.revenue_streams.map((item, index) => ({
        id: `revenue-streams-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
  ];
};

// Sample data for the Product Canvas
export const sampleProductCanvasData: ProductCanvasData = {
  problem: [
    {
      text: "Businesses struggle to validate product ideas quickly",
      status: "assumption",
    },
    {
      text: "Teams lack structured approach to product development",
      status: "assumption",
    },
    {
      text: "Difficult to track product hypotheses and learnings",
      status: "assumption",
    },
  ],
  solution: [
    {
      text: "Lean canvas tool for rapid idea validation",
      status: "assumption",
    },
    {
      text: "Structured framework for product development",
      status: "assumption",
    },
    {
      text: "Integrated hypothesis tracking and testing",
      status: "assumption",
    },
  ],
  key_metrics: [
    { text: "User activation rate", status: "assumption" },
    { text: "Feature adoption percentage", status: "assumption" },
    { text: "Customer retention rate", status: "assumption" },
    { text: "Revenue per customer", status: "assumption" },
  ],
  unique_value_proposition: [
    { text: "All-in-one product validation platform", status: "assumption" },
    {
      text: "Seamless integration with existing workflows",
      status: "assumption",
    },
    { text: "Data-driven decision making tools", status: "assumption" },
  ],
  unfair_advantage: [
    { text: "Proprietary validation methodology", status: "assumption" },
    {
      text: "Industry partnerships with leading accelerators",
      status: "assumption",
    },
    { text: "Expert product advisory network", status: "assumption" },
  ],
  channels: [
    { text: "Direct sales to product teams", status: "assumption" },
    { text: "Content marketing through product blogs", status: "assumption" },
    { text: "Referrals from existing customers", status: "assumption" },
    { text: "Product management communities", status: "assumption" },
  ],
  customer_segments: [
    { text: "Early-stage startups", status: "assumption" },
    { text: "Product teams in mid-size companies", status: "assumption" },
    { text: "Enterprise innovation departments", status: "assumption" },
    { text: "Solo entrepreneurs", status: "assumption" },
  ],
  cost_structure: [
    { text: "Development team salaries", status: "assumption" },
    { text: "Cloud infrastructure costs", status: "assumption" },
    { text: "Marketing and sales expenses", status: "assumption" },
    { text: "Customer support operations", status: "assumption" },
  ],
  revenue_streams: [
    { text: "Tiered subscription model", status: "assumption" },
    { text: "Enterprise licensing", status: "assumption" },
    { text: "Professional services", status: "assumption" },
    { text: "Training and certification", status: "assumption" },
  ],
};

const defaultCanvasData: ProductCanvasData = {
  problem: [],
  solution: [],
  key_metrics: [],
  unique_value_proposition: [],
  unfair_advantage: [],
  channels: [],
  customer_segments: [],
  cost_structure: [],
  revenue_streams: [],
};

// Status color mapping
const statusColors = {
  assumption: {
    bg: "#f9fafb", // gray-50
    border: "#e5e7eb", // gray-200
    icon: HelpCircle,
    iconColor: "#9ca3af", // gray-400
  },
  testing: {
    bg: "#fffbeb", // amber-50
    border: "#fcd34d", // amber-300
    icon: AlertCircle,
    iconColor: "#d97706", // amber-600
  },
  validated: {
    bg: "#ecfdf5", // green-50
    border: "#6ee7b7", // green-300
    icon: CheckCircle,
    iconColor: "#059669", // green-600
  },
};

// Get status icon component based on status
const getStatusIcon = (status: CanvasItemStatus) => {
  const { icon: Icon, iconColor } = statusColors[status];
  return <Icon className="h-4 w-4" style={{ color: iconColor }} />;
};

const ProductCanvas = ({
  isLoading = false,
  onSave,
  initialData = defaultCanvasData,
  projectId: propProjectId,
  assignees = [],
  onAssigneesChange,
}: ProductCanvasProps) => {
  const { selectedProject } = useProject();
  const projectId = propProjectId || selectedProject?.id;
  const [sections, setSections] = useState<CanvasSection[]>(
    mapCanvasDataToSections(initialData),
  );
  const [editingItem, setEditingItem] = useState<{
    sectionId: string;
    itemId: string | null;
  } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [showInsightDialog, setShowInsightDialog] = useState(false);

  // Load from localStorage on initial render
  useEffect(() => {
    const savedCanvas = localStorage.getItem("productCanvas");
    if (savedCanvas) {
      try {
        const parsedData = JSON.parse(savedCanvas) as ProductCanvasData;
        setSections(mapCanvasDataToSections(parsedData));
      } catch (e) {
        console.error("Failed to parse saved canvas data", e);
      }
    }
  }, []);

  // Load insights
  useEffect(() => {
    // In a real app, this would fetch from an API based on projectId
    // For now, we'll use the sample insights
    setInsights(sampleInsights);
  }, [projectId]);

  // Map insights to canvas sections
  const getInsightsForSection = (sectionKey: string): Insight[] => {
    // This is a simple mapping based on keywords in the insight text
    // In a real app, you might have a more structured relationship
    const keywordMap: Record<string, string[]> = {
      problem: ["problem", "pain point", "challenge", "issue"],
      solution: ["solution", "resolve", "fix", "address"],
      key_metrics: ["metric", "measure", "KPI", "indicator"],
      unique_value_proposition: ["value", "proposition", "unique", "offering"],
      unfair_advantage: ["advantage", "competitive", "unique", "edge"],
      channels: ["channel", "distribution", "delivery", "communication"],
      customer_segments: ["segment", "customer", "market", "audience"],
      cost_structure: ["cost", "expense", "pricing", "financial"],
      revenue_streams: ["revenue", "monetization", "pricing", "payment"],
    };

    const keywords = keywordMap[sectionKey] || [];

    return insights.filter((insight) => {
      const text = `${insight.title} ${insight.hypothesis || ""} ${insight.observation || ""} ${insight.insight_text} ${insight.next_steps || ""}`;
      return keywords.some((keyword) =>
        text.toLowerCase().includes(keyword.toLowerCase()),
      );
    });
  };

  // Handle status change for an item
  const handleStatusChange = (
    sectionId: string,
    itemId: string,
    status: CanvasItemStatus,
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, status } : item,
              ),
            }
          : section,
      ),
    );
    setIsDirty(true);
  };

  const handleViewInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setShowInsightDialog(true);
  };

  const handleAddItem = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    setEditingItem({
      sectionId,
      itemId: null, // null means we're adding a new item
    });
    setEditContent("");
  };

  const handleEditItem = (
    sectionId: string,
    itemId: string,
    content: string,
  ) => {
    setEditingItem({
      sectionId,
      itemId,
    });
    setEditContent(content);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            }
          : section,
      ),
    );
    setIsDirty(true);
  };

  const handleSaveItem = () => {
    if (!editingItem) return;

    const { sectionId, itemId } = editingItem;

    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;

        if (itemId === null) {
          // Adding a new item
          return {
            ...section,
            items: [
              ...section.items,
              {
                id: `${sectionId}-${Date.now()}`,
                text: editContent,
                status: "assumption", // Default status for new items
              },
            ],
          };
        } else {
          // Editing an existing item
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, text: editContent } : item,
            ),
          };
        }
      }),
    );

    setEditingItem(null);
    setEditContent("");
    setIsDirty(true);
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditContent("");
  };

  const handleSaveCanvas = () => {
    const canvasData = mapSectionToCanvasData(sections);

    // Save to localStorage
    localStorage.setItem("productCanvas", JSON.stringify(canvasData));

    // Call onSave callback if provided
    if (onSave) {
      onSave(canvasData);
    }

    setIsDirty(false);

    // Use a more user-friendly notification instead of alert
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md z-50 animate-fade-in";
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>Canvas saved successfully!</span>
      </div>
    `;
    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
      notification.classList.add("animate-fade-out");
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find source and destination sections
    const sourceSection = sections.find((s) => s.id === source.droppableId);
    const destSection = sections.find((s) => s.id === destination.droppableId);

    if (!sourceSection || !destSection) return;

    // Create a new sections array to update state
    const newSections = [...sections];

    // Handle moving within the same section
    if (source.droppableId === destination.droppableId) {
      const sectionIndex = newSections.findIndex(
        (s) => s.id === source.droppableId,
      );
      const items = [...newSections[sectionIndex].items];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);

      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        items,
      };
    }
    // Handle moving between different sections
    else {
      const sourceIndex = newSections.findIndex(
        (s) => s.id === source.droppableId,
      );
      const destIndex = newSections.findIndex(
        (s) => s.id === destination.droppableId,
      );

      const sourceItems = [...newSections[sourceIndex].items];
      const destItems = [...newSections[destIndex].items];

      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      newSections[sourceIndex] = {
        ...newSections[sourceIndex],
        items: sourceItems,
      };

      newSections[destIndex] = {
        ...newSections[destIndex],
        items: destItems,
      };
    }

    setSections(newSections);
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Canvas</h2>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-sm text-amber-600 animate-pulse mr-2">
              Unsaved changes
            </span>
          )}
          <TeamMemberSelector
            selectedMembers={assignees}
            onChange={(members) => onAssigneesChange?.(members)}
            buttonText="Assign Team"
          />
          <Button
            variant={isDirty ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={handleSaveCanvas}
            disabled={isLoading || !isDirty}
          >
            <Save className="h-4 w-4" /> Save Canvas
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {sections.map((section) => (
            <Card
              key={section.id}
              className={`shadow-sm transition-opacity ${isLoading ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium flex justify-between items-center">
                  <span>{section.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleAddItem(section.id)}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editingItem?.sectionId === section.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px] text-sm"
                      placeholder={`Add your ${section.title.toLowerCase()} here...`}
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveItem}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Related Insights */}
                    {getInsightsForSection(section.key).length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold uppercase text-blue-500 mb-1 flex items-center">
                          <Lightbulb className="h-3 w-3 mr-1" /> Related
                          Insights
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {getInsightsForSection(section.key).map((insight) => (
                            <TooltipProvider key={insight.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs bg-blue-50 border-blue-100 hover:bg-blue-100 px-2"
                                    onClick={() => handleViewInsight(insight)}
                                  >
                                    {insight.title.length > 20
                                      ? `${insight.title.substring(0, 20)}...`
                                      : insight.title}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">{insight.title}</p>
                                  <p className="text-xs">
                                    {insight.insight_text.substring(0, 100)}...
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.items.length > 0 ? (
                      <Droppable droppableId={section.id}>
                        {(provided, snapshot) => (
                          <div
                            className="space-y-2 min-h-[50px] transition-colors duration-200"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{
                              backgroundColor: snapshot.isDraggingOver
                                ? "rgba(236, 253, 245, 0.4)"
                                : "transparent",
                              borderRadius: "0.375rem",
                              padding: snapshot.isDraggingOver ? "0.5rem" : "0",
                            }}
                          >
                            {section.items.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`p-2 text-sm border rounded-md group flex flex-col transition-all duration-200`}
                                    style={{
                                      backgroundColor:
                                        statusColors[item.status].bg,
                                      borderColor:
                                        statusColors[item.status].border,
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-grow">
                                        <p className="whitespace-pre-wrap">
                                          {item.text}
                                        </p>
                                      </div>
                                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-grab p-1 hover:bg-gray-100 rounded"
                                        >
                                          <GripVertical className="h-3 w-3 text-gray-500" />
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 hover:bg-gray-100 rounded"
                                          onClick={() =>
                                            handleEditItem(
                                              section.id,
                                              item.id,
                                              item.text,
                                            )
                                          }
                                          disabled={isLoading}
                                        >
                                          <Edit className="h-3 w-3 text-gray-500" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                          onClick={() =>
                                            handleDeleteItem(
                                              section.id,
                                              item.id,
                                            )
                                          }
                                          disabled={isLoading}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Status indicators */}
                                    <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                                      <span className="text-xs text-gray-500 mr-2 flex items-center">
                                        {getStatusIcon(item.status)}
                                        <span className="ml-1 capitalize">
                                          {item.status}
                                        </span>
                                      </span>
                                      <div className="flex space-x-1 ml-auto">
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-6 w-6 p-0 rounded-full ${item.status === "assumption" ? "bg-gray-100" : ""}`}
                                                onClick={() =>
                                                  handleStatusChange(
                                                    section.id,
                                                    item.id,
                                                    "assumption",
                                                  )
                                                }
                                                disabled={isLoading}
                                              >
                                                <HelpCircle className="h-3 w-3 text-gray-400" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Mark as Assumption</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-6 w-6 p-0 rounded-full ${item.status === "testing" ? "bg-amber-100" : ""}`}
                                                onClick={() =>
                                                  handleStatusChange(
                                                    section.id,
                                                    item.id,
                                                    "testing",
                                                  )
                                                }
                                                disabled={isLoading}
                                              >
                                                <AlertCircle className="h-3 w-3 text-amber-600" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Mark as Testing</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-6 w-6 p-0 rounded-full ${item.status === "validated" ? "bg-green-100" : ""}`}
                                                onClick={() =>
                                                  handleStatusChange(
                                                    section.id,
                                                    item.id,
                                                    "validated",
                                                  )
                                                }
                                                disabled={isLoading}
                                              >
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Mark as Validated</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ) : (
                      <div
                        className="min-h-[100px] p-2 text-sm border border-dashed border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 cursor-pointer flex items-center justify-center transition-all duration-200"
                        onClick={() => handleAddItem(section.id)}
                      >
                        <div className="flex flex-col items-center text-gray-400 hover:text-gray-500 transition-colors">
                          <Plus className="h-5 w-5 mb-1" />
                          <p className="italic">
                            Click to add {section.title.toLowerCase()}...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>

      {/* Insight Dialog */}
      <Dialog open={showInsightDialog} onOpenChange={setShowInsightDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedInsight?.title}</DialogTitle>
            <DialogDescription>
              {selectedInsight?.type && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                  {selectedInsight.type}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {selectedInsight?.hypothesis && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">
                  Hypothesis
                </h4>
                <p className="mt-1 text-sm">{selectedInsight.hypothesis}</p>
              </div>
            )}
            {selectedInsight?.observation && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">
                  Observation
                </h4>
                <p className="mt-1 text-sm">{selectedInsight.observation}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Insight</h4>
              <p className="mt-1 text-sm">{selectedInsight?.insight_text}</p>
            </div>
            {selectedInsight?.next_steps && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700">
                  Next Steps
                </h4>
                <p className="mt-1 text-sm">{selectedInsight.next_steps}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ProductCanvas };
