import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/api-client";
import { GET_ALL_CHANNELS_ROUTE, JOIN_CHANNEL_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import { FiUsers, FiSearch, FiPlus } from "react-icons/fi";
import { toast } from "sonner";

function BrowseChannels({ isOpen, onClose }) {
  const [allChannels, setAllChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [joiningChannels, setJoiningChannels] = useState(new Set());
  const { addChannel, channels, userInfo } = useAppStore();

  useEffect(() => {
    if (isOpen) {
      fetchAllChannels();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredChannels(allChannels);
    } else {
      const filtered = allChannels.filter(
        (channel) =>
          channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          channel.admin.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          channel.admin.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredChannels(filtered);
    }
  }, [searchTerm, allChannels]);

  const fetchAllChannels = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(GET_ALL_CHANNELS_ROUTE, {
        withCredentials: true,
      });

      // Filter out channels user is already a member of
      const userChannelIds = new Set(channels.map((ch) => ch._id));
      const availableChannels = response.data.channels.filter(
        (channel) =>
          !userChannelIds.has(channel._id) &&
          !channel.members.some((member) => member._id === userInfo.id) &&
          channel.admin._id !== userInfo.id
      );

      setAllChannels(availableChannels);
      setFilteredChannels(availableChannels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async (channelId) => {
    try {
      setJoiningChannels((prev) => new Set([...prev, channelId]));

      const response = await apiClient.post(
        `${JOIN_CHANNEL_ROUTE}/${channelId}`,
        {},
        { withCredentials: true }
      );

      addChannel(response.data.channel);

      // Remove the channel from available channels
      setAllChannels((prev) => prev.filter((ch) => ch._id !== channelId));
      setFilteredChannels((prev) => prev.filter((ch) => ch._id !== channelId));

      toast.success("Successfully joined the channel!");
    } catch (error) {
      console.error("Error joining channel:", error);
      toast.error(error.response?.data || "Failed to join channel");
    } finally {
      setJoiningChannels((prev) => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#181920] border-none text-white w-[95vw] max-w-[650px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FiSearch className="text-purple-400" size={24} />
            Browse Channels
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Discover and join channels that interest you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={16}
            />
            <Input
              placeholder="Search channels by name or admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#2a2b33] border-none text-white placeholder-neutral-400 h-11"
            />
          </div>

          {/* Channels List */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <ScrollArea className="h-[420px] pr-4">
              <div className="space-y-3 pb-4">
                {filteredChannels.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-neutral-400 mb-4">
                      {searchTerm
                        ? "No channels match your search"
                        : "No available channels to join"}
                    </div>
                    {!searchTerm && (
                      <p className="text-sm text-neutral-500">
                        Create a new channel or wait for others to create public
                        channels
                      </p>
                    )}
                  </div>
                ) : (
                  filteredChannels.map((channel) => (
                    <div
                      key={channel._id}
                      className="bg-[#2a2b33]/30 p-4 rounded-lg hover:bg-[#2a2b33]/50 transition-all duration-300 border border-transparent hover:border-purple-500/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="bg-[#ffffff22] h-12 w-12 flex items-center justify-center rounded-full text-lg font-semibold flex-shrink-0">
                            #
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">
                              {channel.name}
                            </h3>

                            {/* Channel Stats */}
                            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
                              <div className="flex items-center gap-1">
                                <FiUsers size={14} />
                                <span>
                                  {channel.members.length + 1} members
                                </span>
                              </div>
                              <span>•</span>
                              <span>
                                Created {formatDate(channel.createdAt)}
                              </span>
                            </div>

                            {/* Admin Info */}
                            <div className="flex items-center gap-2 mt-3">
                              <Avatar className="h-6 w-6">
                                {channel.admin.image ? (
                                  <AvatarImage
                                    src={`${HOST.replace(/\/$/, "")}/${
                                      channel.admin.image
                                    }`}
                                    alt="Admin"
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div
                                    className={`h-6 w-6 text-xs font-semibold flex items-center justify-center rounded-full ${getColor(
                                      channel.admin.color || "defaultColor"
                                    )}`}
                                  >
                                    {channel.admin.firstName?.charAt(0) ||
                                      channel.admin.email?.charAt(0) ||
                                      "A"}
                                  </div>
                                )}
                              </Avatar>
                              <span className="text-sm text-neutral-300">
                                Admin: {channel.admin.firstName || "Unknown"}{" "}
                                {channel.admin.lastName || ""}
                              </span>
                              <Badge
                                variant="outline"
                                className="border-amber-400 text-amber-400 text-xs"
                              >
                                Admin
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Join Button */}
                        <Button
                          onClick={() => handleJoinChannel(channel._id)}
                          disabled={joiningChannels.has(channel._id)}
                          className="bg-purple-600 hover:bg-purple-700 flex-shrink-0 min-w-[80px]"
                          size="sm"
                        >
                          {joiningChannels.has(channel._id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Joining...
                            </>
                          ) : (
                            <>
                              <FiPlus size={14} className="mr-2" />
                              Join
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-[#2a2b33] mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BrowseChannels;
