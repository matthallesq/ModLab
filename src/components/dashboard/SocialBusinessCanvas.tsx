import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CanvasItem,
  CanvasItemStatus,
  SocialBusinessCanvasData,
} from "@/types/project";

interface SocialBusinessCanvasProps {
  isLoading?: boolean;
  projectId: string;
}

const SocialBusinessCanvas: React.FC<SocialBusinessCanvasProps> = ({
  isLoading = false,
  projectId,
}) => {
  // Sample data - in a real app, this would be fetched from an API or context
  const [canvasData, setCanvasData] = useState<SocialBusinessCanvasData>({
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
  });

  const [newItemText, setNewItemText] = useState("");
  const [selectedSection, setSelectedSection] = useState<
    keyof SocialBusinessCanvasData | null
  >(null);

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
