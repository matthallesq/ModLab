import React from "react";
import { Button } from "@/components/ui/button";
import { FolderKanban } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ProjectsButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Use React Router navigation instead of direct URL change
    navigate("/projects");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-10 px-3 rounded-xl"
            onClick={handleClick}
          >
            <FolderKanban className="mr-2" size={20} />
            <span>Projects</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Projects</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ProjectsButton;
