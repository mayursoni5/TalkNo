import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { RiCloseFill } from "react-icons/ri";

function ChatHeader() {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();

  return (
    <div className="h-20 md:h-20 lg:h-24 max-h-[90px] border-b-2 border-[#2f303b] flex items-center justify-between px-10 sm:px-10 md:px-14">
      <div className="flex items-center gap-4 sm:gap-6 w-full justify-between">
        {/* Avatar and User Info */}
        <div className="flex gap-4 sm:gap-6 items-center">
          {selectedChatType === "contact" ? (
            <Avatar className="h-14 w-14 lg:h-16 lg:w-16 rounded-full overflow-hidden">
              {selectedChatData?.image ? (
                <AvatarImage
                  src={`${HOST.replace(/\/$/, "")}/${selectedChatData.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              ) : (
                <div
                  className={`uppercase h-14 w-14 lg:h-16 lg:w-16 text-2xl md:text-3xl font-semibold border-[5px] flex items-center justify-center rounded-full ${getColor(
                    selectedChatData?.color || "defaultColor"
                  )}`}
                >
                  {selectedChatData?.firstName
                    ? selectedChatData.firstName.charAt(0)
                    : selectedChatData?.email?.charAt(0) || "?"}
                </div>
              )}
            </Avatar>
          ) : (
            <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
              #
            </div>
          )}

          {/* Display Contact Name or Email */}
          {selectedChatType === "channel" && selectedChatData.name}
          {selectedChatType === "contact" && (
            <span className="text-lg sm:text-xl md:text-xl font-medium truncate max-w-[180px] sm:max-w-[220px] md:max-w-[250px]">
              {selectedChatData?.firstName && selectedChatData?.lastName
                ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                : selectedChatData?.email || "Unknown"}
            </span>
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
