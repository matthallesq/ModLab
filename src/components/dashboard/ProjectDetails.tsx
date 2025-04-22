import React from "react";
import { Button } from "@/components/ui/button";
import { Project, ModelType } from "@/types/project";
import BusinessModelCanvas from "./BusinessModelCanvas";
import ProductCanvas from "./ProductCanvas";
import SocialBusinessCanvas from "./SocialBusinessCanvas";
import TaskBoard from "./TaskBoard";
import InsightBoard from "../insights/InsightBoard";
import Timeline from "./Timeline";
import { useProject } from "@/contexts/ProjectContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionLimitWarning } from "../subscription/SubscriptionLimitWarning";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectDetailsProps {
  project: Project;
  loading?: boolean;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { assignTeamToProject, setProjectModelType } = useProject();
  const [modelType, setModelType] = useState<ModelType>(
    project.modelType || "business",
  );
  const [hasModel, setHasModel] = useState<boolean>(!!project.modelType);

  const handleTeamSelect = (teamId: string) => {
    assignTeamToProject(project.id, teamId);
  };

  const handleModelTypeChange = (value: ModelType) => {
    setModelType(value);
    setProjectModelType(project.id, value);
    setHasModel(true);
  };

  const handleAddModel = () => {
    setProjectModelType(project.id, modelType);
    setHasModel(true);
    // Automatically update the local state to match the context
    setModelType(modelType);
  };

  const renderModelSelection = () => {
    // Get subscription tier info - in a real app, this would come from a context
    const subscriptionTier = {
      name: project.subscriptionTier || "Startup",
      modelLimit: Infinity,
      modelTypes: ["business", "product", "social"],
    };

    // Check if user has reached model limit
    const currentModelCount = project.modelType ? 1 : 0;
    const hasReachedLimit = currentModelCount >= subscriptionTier.modelLimit;

    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">Select a Model Type</h2>

        {hasReachedLimit && (
          <SubscriptionLimitWarning
            resourceType="Model"
            currentCount={currentModelCount}
            maxAllowed={subscriptionTier.modelLimit}
            tierName={subscriptionTier.name}
          />
        )}

        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Available Models</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentModelCount} of{" "}
                {subscriptionTier.modelLimit === Infinity
                  ? "∞"
                  : subscriptionTier.modelLimit}{" "}
                models used
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className={`cursor-pointer hover:shadow-md transition-shadow ${modelType === "business" ? "ring-2 ring-blue-500" : ""} ${subscriptionTier.modelTypes.includes("business") ? "" : "opacity-50"}`}
              onClick={() => {
                if (subscriptionTier.modelTypes.includes("business")) {
                  setModelType("business");
                  setProjectModelType(project.id, "business");
                }
              }}
            >
              <CardContent className="p-6 flex flex-col items-center">
                <div className="h-32 w-32 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="7"
                      width="20"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Business Model Canvas
                </h3>
                <p className="text-center text-gray-500">
                  Define your business model components
                </p>
                {!subscriptionTier.modelTypes.includes("business") && (
                  <div className="mt-3 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    Available in Professional & Unlimited
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer hover:shadow-md transition-shadow ${modelType === "product" ? "ring-2 ring-green-500" : ""} ${subscriptionTier.modelTypes.includes("product") ? "" : "opacity-50"}`}
              onClick={() => {
                if (subscriptionTier.modelTypes.includes("product")) {
                  setModelType("product");
                  setProjectModelType(project.id, "product");
                }
              }}
            >
              <CardContent className="p-6 flex flex-col items-center">
                <div className="h-32 w-32 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Product Canvas</h3>
                <p className="text-center text-gray-500">
                  Define your product strategy and features
                </p>
                {!subscriptionTier.modelTypes.includes("product") && (
                  <div className="mt-3 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    Available in Professional & Unlimited
                  </div>
                )}
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer hover:shadow-md transition-shadow ${modelType === "social" ? "ring-2 ring-purple-500" : ""} ${subscriptionTier.modelTypes.includes("social") ? "" : "opacity-50"}`}
              onClick={() => {
                if (subscriptionTier.modelTypes.includes("social")) {
                  setModelType("social");
                  setProjectModelType(project.id, "social");
                }
              }}
            >
              <CardContent className="p-6 flex flex-col items-center">
                <div className="h-32 w-32 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-purple-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Social Business Canvas
                </h3>
                <p className="text-center text-gray-500">
                  Define your social impact business model
                </p>
                {!subscriptionTier.modelTypes.includes("social") && (
                  <div className="mt-3 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                    Available in Unlimited
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3">
          <Button
            size="lg"
            onClick={handleAddModel}
            className="px-8"
            disabled={
              hasReachedLimit ||
              !subscriptionTier.modelTypes.includes(modelType)
            }
          >
            Create Model
          </Button>

          {hasReachedLimit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/subscription")}
            >
              Upgrade to add more models
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderModelCanvas = () => {
    // Use project.modelType if available, otherwise use local state
    const currentModelType = project.modelType || modelType;

    return (
      <div className="space-y-6">
        {currentModelType === "business" && (
          <BusinessModelCanvas isLoading={loading} projectId={project.id} />
        )}
        {currentModelType === "product" && (
          <ProductCanvas isLoading={loading} projectId={project.id} />
        )}
        {currentModelType === "social" && (
          <SocialBusinessCanvas isLoading={loading} projectId={project.id} />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{project.name}</h1>
          <p className="text-sm text-gray-500">{project.description}</p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        {/* Project Analytics Summary */}
        <h2 className="text-base font-semibold mb-2">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
            <h3 className="text-xs font-medium text-gray-500 mb-0.5">
              Validated Experiments
            </h3>
            <p className="text-xl font-bold text-blue-600">
              {project.analytics?.validatedExperiments || 0}
            </p>
            <p className="text-xs text-gray-500">
              out of {project.analytics?.totalExperiments || 0} total
            </p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-green-100 shadow-sm">
            <h3 className="text-xs font-medium text-gray-500 mb-0.5">
              Total Experiments
            </h3>
            <p className="text-xl font-bold text-green-600">
              {project.analytics?.totalExperiments || 0}
            </p>
            <p className="text-xs text-gray-500">across all models</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-purple-100 shadow-sm">
            <h3 className="text-xs font-medium text-gray-500 mb-0.5">
              Total Insights
            </h3>
            <p className="text-xl font-bold text-purple-600">
              {project.analytics?.totalInsights || 0}
            </p>
            <p className="text-xs text-gray-500">documented learnings</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="mb-3">
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent
          value="models"
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        >
          {hasModel ? renderModelCanvas() : renderModelSelection()}
        </TabsContent>

        <TabsContent
          value="experiments"
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        >
          <TaskBoard isLoading={loading} projectId={project.id} />
        </TabsContent>

        <TabsContent
          value="insights"
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        >
          <InsightBoard isLoading={loading} projectId={project.id} />
        </TabsContent>

        <TabsContent
          value="history"
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        >
          <h2 className="text-base font-semibold mb-2">Project History</h2>
          <Timeline events={project.timelineEvents || []} isLoading={loading} />
          {/* Debug info */}
          <div className="mt-4 p-4 border border-gray-200 rounded bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Debug Info:</h3>
            <p className="text-xs">
              Timeline Events Count: {(project.timelineEvents || []).length}
            </p>
            <pre className="text-xs mt-2 overflow-auto max-h-32">
              {JSON.stringify(project.timelineEvents || [], null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
