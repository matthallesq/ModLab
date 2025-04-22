import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";
import {
  CanvasItem,
  CanvasItemStatus,
  SocialBusinessCanvasData,
  TeamMember,
} from "@/types/project";
import TeamMemberSelector from "@/components/teams/TeamMemberSelector";

interface SocialBusinessCanvasProps {
  isLoading?: boolean;
  projectId: string;
  initialData?: SocialBusinessCanvasData;
  onSave?: (data: SocialBusinessCanvasData) => void;
  assignees?: TeamMember[];
  onAssigneesChange?: (assignees: TeamMember[]) => void;
}

const defaultCanvasData: SocialBusinessCanvasData = {
  local_communities: [
    { text: "Local neighborhood associations", status: "validated" },
    { text: "Community centers", status: "testing" },
  ],
  governance: [
    { text: "Transparent decision making", status: "assumption" },
    { text: "Community representation", status: "testing" },
  ],
  team_and_partners: [
    { text: "Local NGOs", status: "validated" },
    { text: "Social entrepreneurs", status: "testing" },
  ],
  social_value: [
    { text: "Improved community wellbeing", status: "assumption" },
    { text: "Increased social cohesion", status: "testing" },
  ],
  social_impacts: [
    { text: "Reduced inequality", status: "assumption" },
    { text: "Environmental sustainability", status: "testing" },
  ],
  social_benefits: [
    { text: "Skills development", status: "validated" },
    { text: "Community empowerment", status: "testing" },
  ],
  costs: [
    { text: "Program implementation", status: "validated" },
    { text: "Community outreach", status: "testing" },
  ],
  funding: [
    { text: "Social impact investors", status: "assumption" },
    { text: "Foundation grants", status: "testing" },
  ],
  affected_people: [
    { text: "Underserved communities", status: "validated" },
    { text: "Marginalized groups", status: "testing" },
  ],
};

const SocialBusinessCanvas: React.FC<SocialBusinessCanvasProps> = ({
  isLoading = false,
  projectId,
  initialData = defaultCanvasData,
  onSave,
  assignees = [],
  onAssigneesChange,
}) => {
  // State management
  const [canvasData, setCanvasData] =
    useState<SocialBusinessCanvasData>(initialData);
  const [newItemText, setNewItemText] = useState("");
  const [selectedSection, setSelectedSection] = useState<
    keyof SocialBusinessCanvasData | null
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
    sectionKey: keyof SocialBusinessCanvasData,
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
    localStorage.setItem("socialBusinessCanvas", JSON.stringify(canvasData));

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
    sectionKey: keyof SocialBusinessCanvasData,
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
        <h2 className="text-2xl font-bold">Social Business Canvas</h2>
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
        {renderCanvasSection("Local Communities", "local_communities")}
        {renderCanvasSection("Governance", "governance")}
        {renderCanvasSection("Team & Partners", "team_and_partners")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {renderCanvasSection("Social Value", "social_value")}
        {renderCanvasSection("Social Impacts", "social_impacts")}
        {renderCanvasSection("Social Benefits", "social_benefits")}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderCanvasSection("Costs", "costs")}
        {renderCanvasSection("Funding", "funding")}
        {renderCanvasSection("Affected People", "affected_people")}
      </div>
    </div>
  );
};

export default SocialBusinessCanvas;
