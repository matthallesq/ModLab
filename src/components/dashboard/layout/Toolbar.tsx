import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Settings, HelpCircle, CreditCard } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProjectsButton from "./ProjectsButton";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
}

interface ToolbarProps {
  items?: NavItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
  onProjectClick?: (projectId: string) => void;
}

const defaultNavItems: NavItem[] = [
  { icon: <Users size={20} />, label: "Team", href: "/team" },
];

const defaultBottomItems: NavItem[] = [
  { icon: <Settings size={20} />, label: "Settings" },
  { icon: <HelpCircle size={20} />, label: "Help" },
];

const Toolbar = ({
  items = defaultNavItems,
  activeItem = "Dashboard",
  onItemClick = () => {},
  onProjectClick,
}: ToolbarProps) => {
  const { projects } = useProject();

  return (
    <TooltipProvider>
      <div className="h-16 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 z-10">
        <div className="flex items-center space-x-2">
          {/* Logo or Brand */}
          <Link to="/" className="font-semibold text-xl mr-4">
            ModelLab
          </Link>

          {/* Main Navigation Items */}
          <div className="flex space-x-1">
            {items.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  {item.href ? (
                    <Button
                      variant={"ghost"}
                      className={`h-10 px-3 rounded-xl ${item.label === activeItem ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "text-gray-700 hover:bg-gray-100"}`}
                      asChild
                    >
                      <Link to={item.href}>
                        <span
                          className={`${item.label === activeItem ? "text-blue-600" : "text-gray-500"}`}
                        >
                          {item.icon}
                        </span>
                        <span className="ml-2">{item.label}</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant={"ghost"}
                      className={`h-10 px-3 rounded-xl ${item.label === activeItem ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "text-gray-700 hover:bg-gray-100"}`}
                      onClick={() => onItemClick(item.label)}
                    >
                      <span
                        className={`${item.label === activeItem ? "text-blue-600" : "text-gray-500"}`}
                      >
                        {item.icon}
                      </span>
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Projects Button as a separate component */}
            <ProjectsButton />
          </div>
        </div>

        {/* Right Side Items */}
        <div className="flex space-x-1">
          {defaultBottomItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-10 h-10 p-0 rounded-full"
                  onClick={() => onItemClick(item.label)}
                >
                  <span className="text-gray-500">{item.icon}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Toolbar;
