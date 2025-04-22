import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Team, TeamMember } from "@/types/project";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, UserPlus, UserMinus, Users } from "lucide-react";

interface TeamManagementProps {
  teams: Team[];
  createTeam: (name: string, description?: string) => Team;
  deleteTeam: (teamId: string) => void;
  addTeamMember: (
    teamId: string,
    member: Omit<TeamMember, "id">,
  ) => TeamMember | null;
  removeTeamMember: (teamId: string, memberId: string) => void;
  onTeamSelect?: (teamId: string) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({
  teams,
  createTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  onTeamSelect,
}) => {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<TeamMember["role"]>("member");

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setTeamName("");
    setTeamDescription("");
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description || "");
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = () => {
    if (!teamName.trim()) return;

    if (selectedTeam) {
      // Edit existing team - not implemented in context yet
      // For now, we'll just close the modal
    } else {
      // Create new team
      createTeam(teamName, teamDescription);
    }

    setIsTeamModalOpen(false);
  };

  const handleAddMember = (team: Team) => {
    setSelectedTeam(team);
    setMemberName("");
    setMemberEmail("");
    setMemberRole("member");
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async () => {
    if (!selectedTeam || !memberName.trim() || !memberEmail.trim()) return;

    await addTeamMember(selectedTeam.id, {
      name: memberName,
      email: memberEmail,
      role: memberRole,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberName}`,
    });

    setIsMemberModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Button onClick={handleCreateTeam} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>{team.name}</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditTeam(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => deleteTeam(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <p className="text-sm text-gray-500">{team.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" /> Team Members (
                    {team.members.length})
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleAddMember(team)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" /> Add Member
                  </Button>
                </div>

                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {member.role}
                        </span>
                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeTeamMember(team.id, member.id)}
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {onTeamSelect && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => onTeamSelect(team.id)}
                  >
                    Select Team
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Modal */}
      <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTeam ? "Edit Team" : "Create New Team"}
            </DialogTitle>
            <DialogDescription>
              {selectedTeam
                ? "Update the team details below."
                : "Fill in the details to create a new team."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="teamName" className="text-right text-sm">
                Team Name
              </label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="teamDescription" className="text-right text-sm">
                Description
              </label>
              <Textarea
                id="teamDescription"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTeamModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTeam}>
              {selectedTeam ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Modal */}
      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to {selectedTeam?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="memberName" className="text-right text-sm">
                Name
              </label>
              <Input
                id="memberName"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="memberEmail" className="text-right text-sm">
                Email
              </label>
              <Input
                id="memberEmail"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="memberRole" className="text-right text-sm">
                Role
              </label>
              <select
                id="memberRole"
                value={memberRole}
                onChange={(e) =>
                  setMemberRole(e.target.value as TeamMember["role"])
                }
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMemberModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
