import React from "react";
import { TimelineEvent } from "@/types/project";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Clock,
  Lightbulb,
  LayoutDashboard,
  PlayCircle,
  CheckCircle,
  PlusCircle,
  RefreshCw,
} from "lucide-react";

interface TimelineProps {
  events: TimelineEvent[];
  maxHeight?: string;
  isLoading?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({
  events = [],
  maxHeight = "400px",
  isLoading = false,
}) => {
  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case "model_added":
        return <PlusCircle className="h-5 w-5 text-blue-500" />;
      case "model_updated":
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case "experiment_created":
        return <LayoutDashboard className="h-5 w-5 text-green-500" />;
      case "experiment_running":
        return <PlayCircle className="h-5 w-5 text-amber-500" />;
      case "experiment_completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "insight_added":
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "model_added":
      case "model_updated":
        return "bg-blue-100 text-blue-800";
      case "experiment_created":
        return "bg-green-100 text-green-800";
      case "experiment_running":
        return "bg-amber-100 text-amber-800";
      case "experiment_completed":
        return "bg-green-100 text-green-800";
      case "insight_added":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatEventType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-40">
          <div className="animate-pulse flex flex-col space-y-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (sortedEvents.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
          <Clock className="h-12 w-12 mb-2" />
          <p>No timeline events yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <ScrollArea style={{ maxHeight }}>
        <div className="relative pl-8 pb-1 pr-4">
          {/* Vertical timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {sortedEvents.map((event, index) => (
            <div key={event.id} className="mb-6 relative">
              {/* Timeline dot */}
              <div className="absolute left-[-24px] top-1 z-10 rounded-full bg-white p-1">
                {getEventIcon(event.type)}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center mb-1">
                  <Badge
                    variant="outline"
                    className={getEventColor(event.type)}
                  >
                    {formatEventType(event.type)}
                  </Badge>
                  <span className="text-xs text-gray-500 ml-2">
                    {format(
                      new Date(event.timestamp),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </span>
                </div>

                <h4 className="text-sm font-medium">{event.title}</h4>

                {event.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>
                )}

                {event.userName && (
                  <p className="text-xs text-gray-500 mt-1">
                    By {event.userName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default Timeline;
