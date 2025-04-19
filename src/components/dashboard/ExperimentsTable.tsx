import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TeamMember } from "@/types/project";
import { format } from "date-fns";

interface Experiment {
  id: string;
  title: string;
  description: string;
  hypothesis: string;
  test_description: string;
  success_criteria: string;
  results?: string;
  status: "backlog" | "running" | "completed";
  priority?: "low" | "medium" | "high";
  created_date?: string | Date;
  due_date?: string | Date;
  assignee?: {
    name: string;
    avatar: string;
  };
  assignees?: TeamMember[];
}

interface ExperimentsTableProps {
  experiments: Experiment[];
  onExperimentClick: (experiment: Experiment) => void;
}

const ExperimentsTable = ({
  experiments,
  onExperimentClick,
}: ExperimentsTableProps) => {
  const getStatusColor = (status: Experiment["status"]) => {
    switch (status) {
      case "backlog":
        return "bg-gray-100 text-gray-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Experiment["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Title</TableHead>
            <TableHead>Hypothesis</TableHead>
            <TableHead>Success Criteria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiments.map((experiment) => (
            <TableRow key={experiment.id}>
              <TableCell className="font-medium">{experiment.title}</TableCell>
              <TableCell className="max-w-[300px] truncate">
                {experiment.hypothesis}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {experiment.success_criteria}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(experiment.status)}>
                  {experiment.status.charAt(0).toUpperCase() +
                    experiment.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {experiment.priority ? (
                  <Badge className={getPriorityColor(experiment.priority)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {experiment.priority.charAt(0).toUpperCase() +
                      experiment.priority.slice(1)}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm">Not set</span>
                )}
              </TableCell>
              <TableCell>
                {experiment.due_date ? (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                    {typeof experiment.due_date === "string"
                      ? format(new Date(experiment.due_date), "MMM d, yyyy")
                      : format(experiment.due_date, "MMM d, yyyy")}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Not set</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex -space-x-2 overflow-hidden">
                  {experiment.assignee && (
                    <img
                      src={experiment.assignee.avatar}
                      alt={experiment.assignee.name}
                      className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                      title={experiment.assignee.name}
                    />
                  )}
                  {experiment.assignees &&
                    experiment.assignees
                      .slice(0, 3)
                      .map((member) => (
                        <img
                          key={member.id}
                          src={member.avatar}
                          alt={member.name}
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                          title={member.name}
                        />
                      ))}
                  {experiment.assignees && experiment.assignees.length > 3 && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-500">
                      +{experiment.assignees.length - 3}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onExperimentClick(experiment)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExperimentsTable;
