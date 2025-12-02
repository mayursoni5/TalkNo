import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import { useState } from "react";
import { FiInfo, FiUsers } from "react-icons/fi";
import ChannelInfo from "@/pages/chat/components/contacts-container/components/channel-info/ChannelInfo";

function ContactList({ contacts, isChannel = false }) {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    selectedChatType,
    setSelectedChatMessages,
    onlineUsers,
  } = useAppStore();

  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState(null);

  const handleClick = (contact) => {
    if (isChannel) {
      setSelectedChatType("channel");
    } else {
      setSelectedChatType("contact");
    }

    setSelectedChatData(contact);

    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  const handleChannelInfo = (e, channelId) => {
    e.stopPropagation();
    setSelectedChannelId(channelId);
    setShowChannelInfo(true);
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer group ${
            selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(contact)}
        >
          <div className="flex gap-5 items-center justify-between text-neutral-300 w-full">
            <div className="flex gap-5 items-center flex-1">
              {!isChannel && (
                <div className="relative">
                  <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                    {contact.image ? (
                      <AvatarImage
                        src={`${HOST.replace(/\/$/, "")}/${contact.image}`}
                        alt="profile"
                        className="object-cover w-full h-full bg-black"
                      />
                    ) : (
                      <div
                        className={`uppercase h-10 w-10 text-xl font-semibold border-[2px] flex items-center justify-center rounded-full ${getColor(
                          contact.color || "defaultColor"
                        )}`}
                      >
                        {contact.firstName
                          ? contact.firstName.charAt(0)
                          : contact.email?.charAt(0) || "?"}
                      </div>
                    )}
                  </Avatar>
                  {onlineUsers.has(contact._id) && (
                    <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1b1c24]"></div>
                  )}
                </div>
              )}
              {isChannel && (
                <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                  #
                </div>
              )}
              {isChannel ? (
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="truncate font-medium">{contact.name}</span>
                  {/* <div className="text-xs text-neutral-500 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <FiUsers size={12} />
                      {contact.memberCount ||
                        (contact.members?.length
                          ? contact.members.length + 1
                          : 1)}{" "}
                      members
                    </span>
                    {contact.admin && (
                      <span className="text-purple-400 truncate">
                        • {contact.admin.firstName || "Unknown"}{" "}
                        {contact.admin.lastName || ""}
                      </span>
                    )}
                  </div> */}
                </div>
              ) : (
                <div className="flex flex-col">
                  <span>
                    {contact.firstName && contact.lastName
                      ? `${contact.firstName} ${contact.lastName}`
                      : contact.email || "Unknown"}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {onlineUsers.has(contact._id) ? "Online" : "Offline"}
                  </span>
                </div>
              )}
            </div>
            {isChannel && (
              <button
                onClick={(e) => handleChannelInfo(e, contact._id)}
                className="p-2 hover:bg-[#ffffff22] rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ml-2 flex-shrink-0"
                title="Channel Info"
              >
                <FiInfo
                  size={14}
                  className="text-neutral-400 hover:text-purple-400 transition-colors"
                />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Channel Info Modal */}
      {showChannelInfo && (
        <ChannelInfo
          isOpen={showChannelInfo}
          onClose={() => setShowChannelInfo(false)}
          channelId={selectedChannelId}
        />
      )}
    </div>
  );
}

export default ContactList;
