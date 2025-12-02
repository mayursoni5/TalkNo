import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/api-client";
import {
  GET_CHANNEL_DETAILS_ROUTE,
  JOIN_CHANNEL_ROUTE,
  LEAVE_CHANNEL_ROUTE,
} from "@/utils/constants";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import { FiUsers, FiCalendar, FiStar } from "react-icons/fi";
import { toast } from "sonner";

function ChannelInfo({ isOpen, onClose, channelId }) {
  const [channelDetails, setChannelDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { updateChannel, removeChannel } = useAppStore();

  useEffect(() => {
    if (isOpen && channelId) {
      setChannelDetails(null); // Reset previous data
      fetchChannelDetails();
    }
  }, [isOpen, channelId]);

  const fetchChannelDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `${GET_CHANNEL_DETAILS_ROUTE}/${channelId}`,
        { withCredentials: true }
      );
      if (response.data && response.data.channel) {
        setChannelDetails(response.data.channel);
      } else {
        throw new Error("Invalid channel data received");
      }
    } catch (error) {
      console.error("Error fetching channel details:", error);
      const errorMessage =
        error.response?.data ||
        error.message ||
        "Failed to load channel details";
      toast.error(errorMessage);
      setChannelDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async () => {
    try {
      setActionLoading(true);
      const response = await apiClient.post(
        `${JOIN_CHANNEL_ROUTE}/${channelId}`,
        {},
        { withCredentials: true }
      );

      updateChannel(response.data.channel);
      setChannelDetails((prev) => ({
        ...prev,
        isUserMember: true,
        memberCount: response.data.channel.memberCount || prev.memberCount + 1,
      }));

      // Refresh channel details to get updated member list
      fetchChannelDetails();

      toast.success("Successfully joined the channel!");
    } catch (error) {
      console.error("Error joining channel:", error);
      toast.error(error.response?.data || "Failed to join channel");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveChannel = async () => {
    try {
      setActionLoading(true);
      await apiClient.post(
        `${LEAVE_CHANNEL_ROUTE}/${channelId}`,
        {},
        { withCredentials: true }
      );

      removeChannel(channelId);
      toast.success("Successfully left the channel!");
      onClose();
    } catch (error) {
      console.error("Error leaving channel:", error);
      const errorMessage =
        error.response?.data || error.message || "Failed to leave channel";
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#181920] border-none text-white w-[95vw] max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="bg-[#ffffff22] h-12 w-12 flex items-center justify-center rounded-full text-lg font-bold">
              #
            </div>
            <span className="truncate">
              {channelDetails?.name || "Channel Details"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Channel information and member list
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : channelDetails ? (
          <>
            <div
              className="flex-1 overflow-y-scroll px-6"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitScrollbar: { display: "none" },
              }}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  .flex-1::-webkit-scrollbar {
                    display: none !important;
                  }
                `,
                }}
              />
              <div className="space-y-6">
                {/* Channel Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#2a2b33]/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <FiUsers size={16} />
                      <span className="text-sm font-medium">Members</span>
                    </div>
                    <p className="text-xl font-bold">
                      {channelDetails.memberCount}
                    </p>
                  </div>
                  <div className="bg-[#2a2b33]/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <FiCalendar size={16} />
                      <span className="text-sm font-medium">Created</span>
                    </div>
                    <p className="text-sm">
                      {formatDate(channelDetails.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Admin Info */}
                <div>
                  <div className="flex items-center gap-2 text-amber-400 mb-3">
                    <FiStar size={16} />
                    <span className="text-sm font-medium">Channel Admin</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#2a2b33]/30 p-3 rounded-lg">
                    <Avatar className="h-10 w-10">
                      {channelDetails.admin.image ? (
                        <AvatarImage
                          src={`${HOST.replace(/\/$/, "")}/${
                            channelDetails.admin.image
                          }`}
                          alt="Admin"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div
                          className={`h-10 w-10 text-lg font-semibold flex items-center justify-center rounded-full ${getColor(
                            channelDetails.admin.color || "defaultColor"
                          )}`}
                        >
                          {channelDetails.admin.firstName?.charAt(0) ||
                            channelDetails.admin.email?.charAt(0) ||
                            "A"}
                        </div>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {channelDetails.admin.firstName || "Unknown"}{" "}
                        {channelDetails.admin.lastName || ""}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {channelDetails.admin.email || "No email"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto border-amber-400 text-amber-400"
                    >
                      Admin
                    </Badge>
                  </div>
                </div>

                {/* Members List (only if user is a member) */}
                {channelDetails.isUserMember && channelDetails.members && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-300 mb-3">
                      Members ({channelDetails.members.length})
                    </h3>
                    <div className="h-32 pr-2 overflow-y-auto custom-scrollbar">
                      <div className="space-y-2 pb-2">
                        {channelDetails.members.map((member) => (
                          <div
                            key={member._id}
                            className="flex items-center gap-3 p-2 hover:bg-[#2a2b33]/30 rounded-lg"
                          >
                            <Avatar className="h-8 w-8">
                              {member.image ? (
                                <AvatarImage
                                  src={`${HOST.replace(/\/$/, "")}/${
                                    member.image
                                  }`}
                                  alt="Member"
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div
                                  className={`h-8 w-8 text-sm font-semibold flex items-center justify-center rounded-full ${getColor(
                                    member.color || "defaultColor"
                                  )}`}
                                >
                                  {member.firstName?.charAt(0) ||
                                    member.email?.charAt(0) ||
                                    "M"}
                                </div>
                              )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {member.firstName || "Unknown"}{" "}
                                {member.lastName || ""}
                              </p>
                              <p className="text-xs text-neutral-400 truncate">
                                {member.email || "No email"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="border-t border-[#2a2b33] p-6 pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {channelDetails.isUserAdmin ? (
                  <div className="flex items-center justify-center p-2">
                    <Badge
                      variant="outline"
                      className="border-amber-400 text-amber-400 px-4 py-2"
                    >
                      You are the admin
                    </Badge>
                  </div>
                ) : channelDetails.isUserMember ? (
                  <Button
                    variant="destructive"
                    onClick={handleLeaveChannel}
                    disabled={actionLoading}
                    className="flex-1 h-11"
                  >
                    {actionLoading ? "Leaving..." : "Leave Channel"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoinChannel}
                    disabled={actionLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 h-11"
                  >
                    {actionLoading ? "Joining..." : "Join Channel"}
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-neutral-400">
              Failed to load channel details
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ChannelInfo;
