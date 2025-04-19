import React, { useState, useEffect } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamMember } from "@/types/project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TeamMemberSelectorProps {
  selectedMembers: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  buttonText?: string;
  maxHeight?: string;
}

const TeamMemberSelector: React.FC<TeamMemberSelectorProps> = ({
  selectedMembers = [],
  onChange,
  buttonText = "Assign Team Members",
  maxHeight = "300px",
}) => {
  const { teams } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedMembers, setLocalSelectedMembers] =
    useState<TeamMember[]>(selectedMembers);

  // Flatten all team members into a single array
  const allMembers = teams.flatMap((team) => team.members);

  // Remove duplicates (members who are in multiple teams)
  const uniqueMembers = allMembers.filter(
    (member, index, self) =>
      index === self.findIndex((m) => m.id === member.id),
  );

  // Filter members based on search query
  const filteredMembers = uniqueMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Check if a member is selected
  const isMemberSelected = (memberId: string) => {
    return localSelectedMembers.some((member) => member.id === memberId);
  };

  // Toggle member selection
  const toggleMemberSelection = (member: TeamMember) => {
    if (isMemberSelected(member.id)) {
      setLocalSelectedMembers(
        localSelectedMembers.filter((m) => m.id !== member.id),
      );
    } else {
      setLocalSelectedMembers([...localSelectedMembers, member]);
    }
  };

  // Apply changes when dialog is closed
  const handleApply = () => {
    onChange(localSelectedMembers);
    setIsOpen(false);
  };

  // Reset local state when selected members prop changes
  useEffect(() => {
    setLocalSelectedMembers(selectedMembers);
  }, [selectedMembers]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {buttonText}
          {selectedMembers.length > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {selectedMembers.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Team Members</DialogTitle>
          <DialogDescription>
            Select team members to assign to this item.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="h-[300px] pr-4" style={{ maxHeight }}>
          <div className="space-y-4">
            {teams.map((team) => {
              // Filter team members based on search query
              const teamFilteredMembers = team.members.filter(
                (member) =>
                  member.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  member.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
              );

              // Only show teams that have members matching the search query
              if (teamFilteredMembers.length === 0) return null;

              return (
                <div key={team.id} className="mb-4">
                  <h3 className="text-sm font-medium mb-2">{team.name}</h3>
                  <div className="space-y-2">
                    {teamFilteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
                      >
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={isMemberSelected(member.id)}
                          onCheckedChange={() => toggleMemberSelection(member)}
                        />
                        <div className="flex items-center flex-1">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-8 w-8 rounded-full mr-2"
                          />
                          <div>
                            <label
                              htmlFor={`member-${member.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {member.name}
                            </label>
                            <p className="text-xs text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No members found matching your search.
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <div className="flex items-center mr-auto">
            <span className="text-sm text-gray-500">
              {localSelectedMembers.length} member(s) selected
            </span>
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberSelector;
