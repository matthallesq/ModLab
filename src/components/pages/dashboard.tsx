import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Toolbar from "../dashboard/layout/Toolbar";
import DashboardGrid from "../dashboard/DashboardGrid";
import ProjectDetails from "../dashboard/ProjectDetails";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectProvider, useProject } from "@/contexts/ProjectContext";
import { SUBSCRIPTION_TIERS } from "@/types/project";

const DashboardContent = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { selectedProject, projects, createProject, setSelectedProject } =
    useProject();
  const [loading, setLoading] = useState(false);
  const [insightsView, setInsightsView] = useState<"board" | "table">("board");
  const [experimentsView, setExperimentsView] = useState<"board">("board");
  const [modelsView, setModelsView] = useState<"business" | "product">(
    "business",
  );
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  // Subscription tier is now at account level

  // Function to trigger loading state for demonstration
  const handleRefresh = () => {
    setLoading(true);
    // Reset loading after 2 seconds
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  // Set the selected project based on the URL parameter
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projectId, projects, setSelectedProject]);

  const handleCreateProject = () => {
    if (newProjectName.trim() === "") return;

    createProject(newProjectName, newProjectDescription, true);

    // Reset form and close modal
    setNewProjectName("");
    setNewProjectDescription("");
    setIsCreateProjectModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Toolbar
        onProjectClick={(projectId) => {
          const project = projects.find((p) => p.id === projectId);
          if (project) {
            setSelectedProject(project);
          }
        }}
      />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <main className="flex-1 overflow-auto">
          <div
            className={cn(
              "container mx-auto p-6 space-y-8",
              "transition-all duration-300 ease-in-out",
            )}
          >
            {!selectedProject ? (
              <></>
            ) : (
              <ProjectDetails project={selectedProject} loading={loading} />
            )}
          </div>
        </main>
      </div>
      {/* Create Project Modal */}
      <Dialog
        open={isCreateProjectModalOpen}
        onOpenChange={setIsCreateProjectModalOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Home = () => {
  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  );
};

export default Home;
