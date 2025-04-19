import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Insight } from "@/types/project";
import { format } from "date-fns";
import { Edit, Trash2, Link, Users } from "lucide-react";

interface InsightCardProps {
  insight: Insight;
  onEdit?: (insight: Insight) => void;
  onDelete?: (insightId: string) => void;
  onView?: (insight: Insight) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onEdit,
  onDelete,
  onView,
}) => {
  const formattedDate = insight.created_at
    ? format(new Date(insight.created_at), "dd/MM/yyyy")
    : "";

  return (
    <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">
            {insight.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{formattedDate}</span>
            {insight.type && (
              <Badge variant="outline" className="text-xs">
                {insight.type}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(insight)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(insight.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {insight.hypothesis && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">
                Hypothesis
              </h4>
              <p className="text-sm text-gray-700">{insight.hypothesis}</p>
              {insight.experiment_id && (
                <div className="mt-1 flex items-center">
                  <Link className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-500">
                    Linked to experiment
                  </span>
                </div>
              )}
            </div>
          )}

          {insight.observation && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">
                Observation
              </h4>
              <p className="text-sm text-gray-700">{insight.observation}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Insight
            </h4>
            <p className="text-sm text-gray-700">{insight.insight_text}</p>
          </div>

          {insight.next_steps && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">
                Next Steps
              </h4>
              <p className="text-sm text-gray-700">{insight.next_steps}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 border-t">
        <div className="w-full">
          {insight.assignees && insight.assignees.length > 0 ? (
            <div className="flex items-center mb-2">
              <Users className="h-3 w-3 text-gray-500 mr-1" />
              <div className="flex -space-x-2 overflow-hidden">
                {insight.assignees.slice(0, 3).map((member) => (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt={member.name}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    title={member.name}
                  />
                ))}
                {insight.assignees.length > 3 && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border-2 border-white text-xs font-medium text-gray-500">
                    +{insight.assignees.length - 3}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center mb-2">
              <Users className="h-3 w-3 text-gray-500 mr-1" />
              <span className="text-xs text-gray-400">No assignees</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onView && onView(insight)}
            disabled={!onView}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InsightCard;
