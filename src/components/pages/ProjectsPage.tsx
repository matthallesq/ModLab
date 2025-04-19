import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, Users, BarChart2 } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { format } from "date-fns";
import Toolbar from "../dashboard/layout/Toolbar";
import CreateProjectModal from "../dashboard/CreateProjectModal";

const ProjectsPage = () => {
  const { projects, createProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Check if we should open the modal from navigation state
  useEffect(() => {
    if (location.state?.openCreateProjectModal) {
      setIsCreateModalOpen(true);
      // Clear the state to prevent reopening on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleProjectClick = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleCreateProjectClick = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Toolbar />
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          {/* Blue 'New Project' button removed */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add New Project Card */}
          <Card
            className="bg-white/90 backdrop-blur-sm border border-dashed border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col items-center justify-center h-[280px]"
            onClick={handleCreateProjectClick}
            onMouseEnter={() => setIsHovering("new")}
            onMouseLeave={() => setIsHovering(null)}
          >
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div
                className={`h-16 w-16 rounded-full ${isHovering === "new" ? "bg-blue-100" : "bg-gray-100"} flex items-center justify-center mb-4 transition-colors duration-200`}
              >
                <PlusCircle
                  className={`h-8 w-8 ${isHovering === "new" ? "text-blue-500" : "text-gray-400"} transition-colors duration-200`}
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Create New Project
              </h3>
              <p className="text-sm text-gray-500">
                Start a new business modeling project
              </p>
            </div>
          </Card>

          {/* Project Cards */}
          {projects.map((project) => (
            <Card
              key={project.id}
              className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
              onMouseEnter={() => setIsHovering(project.id)}
              onMouseLeave={() => setIsHovering(null)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-gray-900">
                  {project.name}
                </CardTitle>
                <div
                  className={`h-8 w-8 rounded-full ${isHovering === project.id ? "bg-blue-50" : "bg-gray-50"} flex items-center justify-center transition-colors duration-200`}
                >
                  <BarChart2
                    className={`h-4 w-4 ${isHovering === project.id ? "text-blue-500" : "text-gray-500"} transition-colors duration-200`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {project.description || "No description provided"}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(project.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>Project</span>
                  </div>
                </div>
                {project.analytics && (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <div className="font-medium text-gray-900">
                        {project.analytics.totalExperiments}
                      </div>
                      <div className="text-gray-500">Experiments</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <div className="font-medium text-gray-900">
                        {project.analytics.validatedExperiments}
                      </div>
                      <div className="text-gray-500">Validated</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <div className="font-medium text-gray-900">
                        {project.analytics.totalInsights}
                      </div>
                      <div className="text-gray-500">Insights</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default ProjectsPage;
