import React, { useState, useEffect } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Save,
  Trash2,
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
  CanvasData,
  Insight,
  CanvasItemStatus,
  TeamMember,
} from "@/types/project";
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
import TeamMemberSelector from "@/components/teams/TeamMemberSelector";

interface CanvasItemWithId {
  id: string;
  text: string;
  status: CanvasItemStatus;
}

interface CanvasSection {
  id: string;
  title: string;
  items: CanvasItemWithId[];
  key: keyof CanvasData;
}

interface BusinessModelCanvasProps {
  isLoading?: boolean;
  onSave?: (data: CanvasData) => void;
  initialData?: CanvasData;
  projectId?: string;
  assignees?: TeamMember[];
  onAssigneesChange?: (assignees: TeamMember[]) => void;
}

const mapSectionToCanvasData = (sections: CanvasSection[]): CanvasData => {
  const canvasData: CanvasData = {
    customer_segments: [],
    value_propositions: [],
    channels: [],
    customer_relationships: [],
    revenue_streams: [],
    key_resources: [],
    key_activities: [],
    key_partners: [],
    cost_structure: [],
  };

  sections.forEach((section) => {
    canvasData[section.key] = section.items.map((item) => ({
      text: item.text,
      status: item.status,
    }));
  });

  return canvasData;
};

const mapCanvasDataToSections = (canvasData: CanvasData): CanvasSection[] => {
  return [
    {
      id: "key-partners",
      title: "Key Partners",
      key: "key_partners",
      items: canvasData.key_partners.map((item, index) => ({
        id: `key-partners-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "key-activities",
      title: "Key Activities",
      key: "key_activities",
      items: canvasData.key_activities.map((item, index) => ({
        id: `key-activities-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "key-resources",
      title: "Key Resources",
      key: "key_resources",
      items: canvasData.key_resources.map((item, index) => ({
        id: `key-resources-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "value-propositions",
      title: "Value Propositions",
      key: "value_propositions",
      items: canvasData.value_propositions.map((item, index) => ({
        id: `value-propositions-${index}`,
        text: item.text,
        status: item.status || "assumption",
      })),
    },
    {
      id: "customer-relationships",
      title: "Customer Relationships",
      key: "customer_relationships",
      items: canvasData.customer_relationships.map((item, index) => ({
        id: `customer-relationships-${index}`,
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

const defaultCanvasData: CanvasData = {
  customer_segments: [],
  value_propositions: [],
  channels: [],
  customer_relationships: [],
  revenue_streams: [],
  key_resources: [],
  key_activities: [],
  key_partners: [],
  cost_structure: [],
};

const getStatusColor = (status: CanvasItemStatus) => {
  switch (status) {
    case "assumption":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "testing":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "validated":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const BusinessModelCanvas = ({
  isLoading = false,
  onSave,
  initialData = defaultCanvasData,
  projectId: propProjectId,
  assignees = [],
  onAssigneesChange,
}: BusinessModelCanvasProps) => {
  const { selectedProject } = useProject();
  const projectId = propProjectId || selectedProject?.id;
  const [sections, setSections] = useState<CanvasSection[]>(
    mapCanvasDataToSections(initialData),
  );
  const [newItemText, setNewItemText] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [showInsightDialog, setShowInsightDialog] = useState(false);

  // Load from localStorage on initial render
  useEffect(() => {
    const savedCanvas = localStorage.getItem("businessModelCanvas");
    if (savedCanvas) {
      try {
        const parsedData = JSON.parse(savedCanvas) as CanvasData;
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
      key_partners: ["partner", "supplier", "alliance", "collaboration"],
      key_activities: ["activity", "operation", "process", "production"],
      key_resources: ["resource", "asset", "infrastructure", "technology"],
      value_propositions: ["value", "benefit", "solution", "offering"],
      customer_relationships: [
        "relationship",
        "retention",
        "support",
        "service",
      ],
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

  const handleViewInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setShowInsightDialog(true);
  };

  const handleAddItem = () => {
    if (!selectedSection || !newItemText.trim()) return;

    const newItem: CanvasItemWithId = {
      id: `${selectedSection}-${Date.now()}`,
      text: newItemText,
      status: "assumption",
    };

    setSections(
      sections.map((section) => {
        if (section.id === selectedSection) {
          return {
            ...section,
            items: [...section.items, newItem],
          };
        }
        return section;
      }),
    );

    setNewItemText("");
    setSelectedSection(null);
    setIsDirty(true);
  };

  // Handle status change for an item
  const handleStatusChange = (
    sectionId: string,
    itemIndex: number,
    newStatus: CanvasItemStatus,
  ) => {
    setSections(
      sections.map((section) => {
        if (section.id === sectionId) {
          const updatedItems = [...section.items];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            status: newStatus,
          };
          return {
            ...section,
            items: updatedItems,
          };
        }
        return section;
      }),
    );
    setIsDirty(true);
  };

  const handleSaveCanvas = () => {
    const canvasData = mapSectionToCanvasData(sections);

    // Save to localStorage
    localStorage.setItem("businessModelCanvas", JSON.stringify(canvasData));

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

  const renderCanvasSection = (
    title: string,
    sectionId: string,
    sectionKey: keyof CanvasData,
  ) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return null;

    return (
      <Card className="p-4 h-full">
        <h3 className="font-medium mb-2">{title}</h3>
        <div className="space-y-2">
          {section.items.map((item, index) => (
            <div
              key={item.id}
              className="p-2 bg-white border rounded-md flex justify-between items-center"
            >
              <span className="text-sm">{item.text}</span>
              <Badge
                className={`cursor-pointer ${getStatusColor(item.status)}`}
                onClick={() => {
                  const nextStatus: Record<CanvasItemStatus, CanvasItemStatus> =
                    {
                      assumption: "testing",
                      testing: "validated",
                      validated: "assumption",
                    };
                  handleStatusChange(sectionId, index, nextStatus[item.status]);
                }}
              >
                {item.status}
              </Badge>
            </div>
          ))}
          {selectedSection === sectionId && (
            <div className="mt-2 flex space-x-2">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add new item"
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddItem}>
                Add
              </Button>
            </div>
          )}
          {selectedSection !== sectionId && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => setSelectedSection(sectionId)}
            >
              + Add Item
            </Button>
          )}
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading canvas...</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Business Model Canvas</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {renderCanvasSection("Key Partners", "key-partners", "key_partners")}
        {renderCanvasSection(
          "Key Activities",
          "key-activities",
          "key_activities",
        )}
        {renderCanvasSection("Key Resources", "key-resources", "key_resources")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {renderCanvasSection(
          "Value Propositions",
          "value-propositions",
          "value_propositions",
        )}
        {renderCanvasSection(
          "Customer Relationships",
          "customer-relationships",
          "customer_relationships",
        )}
        {renderCanvasSection("Channels", "channels", "channels")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderCanvasSection(
          "Cost Structure",
          "cost-structure",
          "cost_structure",
        )}
        {renderCanvasSection(
          "Revenue Streams",
          "revenue-streams",
          "revenue_streams",
        )}
        {renderCanvasSection(
          "Customer Segments",
          "customer-segments",
          "customer_segments",
        )}
      </div>

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

export default BusinessModelCanvas;
