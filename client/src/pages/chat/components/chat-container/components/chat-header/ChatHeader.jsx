import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { RiCloseFill } from "react-icons/ri";

function ChatHeader() {
  const { closeChat, selectedChatData, selectedChatType, onlineUsers } =
    useAppStore();

  return (
    <div className="h-20 md:h-20 lg:h-24 max-h-[90px] border-b-2 border-[#2f303b] flex items-center justify-between px-4 sm:px-10 md:px-14">
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 w-full justify-between">
        {/* Avatar and User Info */}
        <div className="flex gap-4 sm:gap-6 items-center">
          {selectedChatType === "contact" ? (
            <div className="relative">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full overflow-hidden">
                {selectedChatData?.image ? (
                  <AvatarImage
                    src={`${HOST.replace(/\/$/, "")}/${selectedChatData.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold border-[3px] sm:border-[4px] md:border-[5px] flex items-center justify-center rounded-full ${getColor(
                      selectedChatData?.color || "defaultColor"
                    )}`}
                  >
                    {selectedChatData?.firstName
                      ? selectedChatData.firstName.charAt(0)
                      : selectedChatData?.email?.charAt(0) || "?"}
                  </div>
                )}
              </Avatar>
              {onlineUsers.has(selectedChatData?._id) && (
                <div className="absolute -bottom-0 -right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-[#1c1d25]"></div>
              )}
            </div>
          ) : (
            <div className="bg-[#ffffff22] h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center rounded-full">
              #
            </div>
          )}

          {/* Display Contact Name or Email */}
          {selectedChatType === "channel" && (
            <span className="text-lg sm:text-xl md:text-xl font-medium truncate max-w-[180px] sm:max-w-[220px] md:max-w-[250px]">
              {selectedChatData.name}
            </span>
          )}
          {selectedChatType === "contact" && (
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl md:text-xl font-medium truncate max-w-[180px] sm:max-w-[220px] md:max-w-[250px]">
                {selectedChatData?.firstName && selectedChatData?.lastName
                  ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                  : selectedChatData?.email || "Unknown"}
              </span>
              <span className="text-xs sm:text-sm text-neutral-400">
                {onlineUsers.has(selectedChatData?._id) ? "Online" : "Offline"}
              </span>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          className="text-neutral-500 hover:text-white transition-all duration-300 focus:outline-none"
          onClick={closeChat}
        >
          <RiCloseFill className="text-3xl sm:text-4xl " />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
