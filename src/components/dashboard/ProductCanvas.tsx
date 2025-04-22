import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";
import {
  CanvasItem,
  CanvasItemStatus,
  ProductCanvasData,
  TeamMember,
} from "@/types/project";
import TeamMemberSelector from "@/components/teams/TeamMemberSelector";

// Default data for the canvas
export const sampleProductCanvasData: ProductCanvasData = {
  problem: [
    {
      text: "Businesses struggle to validate product ideas quickly",
      status: "assumption",
    },
    {
      text: "Teams lack structured approach to product development",
      status: "testing",
    },
  ],
  solution: [
    {
      text: "Lean canvas tool for rapid idea validation",
      status: "validated",
    },
    {
      text: "Structured framework for product development",
      status: "testing",
    },
  ],
  key_metrics: [
    { text: "User activation rate", status: "assumption" },
    { text: "Feature adoption percentage", status: "testing" },
  ],
  unique_value_proposition: [
    { text: "All-in-one product validation platform", status: "validated" },
    {
      text: "Seamless integration with existing workflows",
      status: "testing",
    },
  ],
  unfair_advantage: [
    { text: "Proprietary validation methodology", status: "assumption" },
    {
      text: "Industry partnerships with leading accelerators",
      status: "testing",
    },
  ],
  channels: [
    { text: "Direct sales to product teams", status: "validated" },
    { text: "Content marketing through product blogs", status: "testing" },
  ],
  customer_segments: [
    { text: "Early-stage startups", status: "assumption" },
    { text: "Product teams in mid-size companies", status: "testing" },
  ],
  cost_structure: [
    { text: "Development team salaries", status: "validated" },
    { text: "Cloud infrastructure costs", status: "testing" },
  ],
  revenue_streams: [
    { text: "Tiered subscription model", status: "assumption" },
    { text: "Enterprise licensing", status: "testing" },
  ],
};

// Default data used by the component when no initialData is provided
const defaultCanvasData: ProductCanvasData = {
  problem: [
    {
      text: "Businesses struggle to validate product ideas quickly",
      status: "assumption",
    },
    {
      text: "Teams lack structured approach to product development",
      status: "testing",
    },
  ],
  solution: [
    {
      text: "Lean canvas tool for rapid idea validation",
      status: "validated",
    },
    {
      text: "Structured framework for product development",
      status: "testing",
    },
  ],
  key_metrics: [
    { text: "User activation rate", status: "assumption" },
    { text: "Feature adoption percentage", status: "testing" },
  ],
  unique_value_proposition: [
    { text: "All-in-one product validation platform", status: "validated" },
    {
      text: "Seamless integration with existing workflows",
      status: "testing",
    },
  ],
  unfair_advantage: [
    { text: "Proprietary validation methodology", status: "assumption" },
    {
      text: "Industry partnerships with leading accelerators",
      status: "testing",
    },
  ],
  channels: [
    { text: "Direct sales to product teams", status: "validated" },
    { text: "Content marketing through product blogs", status: "testing" },
  ],
  customer_segments: [
    { text: "Early-stage startups", status: "assumption" },
    { text: "Product teams in mid-size companies", status: "testing" },
  ],
  cost_structure: [
    { text: "Development team salaries", status: "validated" },
    { text: "Cloud infrastructure costs", status: "testing" },
  ],
  revenue_streams: [
    { text: "Tiered subscription model", status: "assumption" },
    { text: "Enterprise licensing", status: "testing" },
  ],
};

interface ProductCanvasProps {
  isLoading?: boolean;
  projectId: string;
  initialData?: ProductCanvasData;
  onSave?: (data: ProductCanvasData) => void;
  assignees?: TeamMember[];
  onAssigneesChange?: (assignees: TeamMember[]) => void;
}

const ProductCanvas: React.FC<ProductCanvasProps> = ({
  isLoading = false,
  projectId,
  initialData = defaultCanvasData,
  onSave,
  assignees = [],
  onAssigneesChange,
}) => {
  const [canvasData, setCanvasData] = useState<ProductCanvasData>(initialData);
  const [newItemText, setNewItemText] = useState("");
  const [selectedSection, setSelectedSection] = useState<
    keyof ProductCanvasData | null
  >(null);
  const [isDirty, setIsDirty] = useState(false);

  const handleAddItem = () => {
    if (!selectedSection || !newItemText.trim()) return;

    const newItem: CanvasItem = {
      text: newItemText,
      status: "assumption",
    };

    setCanvasData((prev) => ({
      ...prev,
      [selectedSection]: [...prev[selectedSection], newItem],
    }));

    setNewItemText("");
    setSelectedSection(null);
    setIsDirty(true);
  };

  const handleStatusChange = (
    sectionKey: keyof ProductCanvasData,
    itemIndex: number,
    newStatus: CanvasItemStatus,
  ) => {
    setCanvasData((prev) => {
      const updatedSection = [...prev[sectionKey]];
      updatedSection[itemIndex] = {
        ...updatedSection[itemIndex],
        status: newStatus,
      };
      return {
        ...prev,
        [sectionKey]: updatedSection,
      };
    });
    setIsDirty(true);
  };

  const handleSaveCanvas = () => {
    // Save to localStorage
    localStorage.setItem("productCanvas", JSON.stringify(canvasData));

    // Call onSave callback if provided
    if (onSave) {
      onSave(canvasData);
    }

    setIsDirty(false);

    // User-friendly notification
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

  const renderCanvasSection = (
    title: string,
    sectionKey: keyof ProductCanvasData,
  ) => {
    return (
      <Card className="p-4 h-full">
        <h3 className="font-medium mb-2">{title}</h3>
        <div className="space-y-2">
          {canvasData[sectionKey].map((item, index) => (
            <div
              key={index}
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
                  handleStatusChange(
                    sectionKey,
                    index,
                    nextStatus[item.status],
                  );
                }}
              >
                {item.status}
              </Badge>
            </div>
          ))}
          {selectedSection === sectionKey && (
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
          {selectedSection !== sectionKey && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => setSelectedSection(sectionKey)}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {renderCanvasSection("Problem", "problem")}
        {renderCanvasSection("Solution", "solution")}
        {renderCanvasSection("Key Metrics", "key_metrics")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {renderCanvasSection(
          "Unique Value Proposition",
          "unique_value_proposition",
        )}
        {renderCanvasSection("Unfair Advantage", "unfair_advantage")}
        {renderCanvasSection("Channels", "channels")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderCanvasSection("Customer Segments", "customer_segments")}
        {renderCanvasSection("Cost Structure", "cost_structure")}
        {renderCanvasSection("Revenue Streams", "revenue_streams")}
      </div>
    </div>
  );
};

export default ProductCanvas;
