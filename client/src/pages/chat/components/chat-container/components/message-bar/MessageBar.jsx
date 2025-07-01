import { useSocket } from "@/context/SocketContext";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";

function MessageBar() {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const socket = useSocket();
  const {
    selectedChatData,
    selectedChatType,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
  } = useAppStore();
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message.trim(),
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message.trim(),
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
    }
    setMessage("");
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const res = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          withCredentials: true,
          onUploadProgress: (data) => {
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
          },
        });

        if (res.status === 200 && res.data) {
          setIsUploading(false);
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: res.data.filePath,
            });
          }
        }
        if (selectedChatType === "channel") {
          socket.emit("send-channel-message", {
            sender: userInfo.id,
            content: undefined,
            messageType: "file",
            fileUrl: res.data.filePath,
            channelId: selectedChatData._id,
          });
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.log({ error });
    }
  };

  return (
    <div className="h-auto min-h-[50px] sm:min-h-[60px] md:min-h-[70px] lg:min-h-[80px] bg-[#1c1d25] flex justify-center items-center px-2 sm:px-5 md:px-8 py-2 sm:py-3 mb-2 sm:mb-4 md:mb-0 lg:mb-0 xl:mb-0 gap-1 sm:gap-3 md:gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-1 sm:gap-2 md:gap-3 lg:gap-5 pr-1 sm:pr-2 md:pr-3 lg:pr-5">
        <input
          type="text"
          placeholder="Enter Message"
          className="flex-1 py-2 px-2 sm:py-3 sm:px-3 md:p-4 lg:p-5 bg-transparent rounded-md focus:border-none focus:outline-none text-xs sm:text-sm md:text-base"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all p-1 sm:p-2"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-xl sm:text-2xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all p-1 sm:p-2"
            onClick={() => setEmojiPickerOpen(true)}
          >
            <RiEmojiStickerLine className="text-xl sm:text-2xl" />
          </button>
          <div
            className="absolute bottom-10 sm:bottom-12 md:bottom-16 right-0 z-50"
            ref={emojiRef}
          >
            {/* Desktop and tablet emoji picker */}
            <div className="hidden sm:block">
              <EmojiPicker
                theme="dark"
                open={emojiPickerOpen}
                onEmojiClick={handleAddEmoji}
                autoFocusSearch={false}
                width={300}
                height={400}
              />
            </div>
            {/* Mobile emoji picker */}
            <div className="block sm:hidden">
              <EmojiPicker
                theme="dark"
                open={emojiPickerOpen}
                onEmojiClick={handleAddEmoji}
                autoFocusSearch={false}
                width={250}
                height={300}
              />
            </div>
          </div>
        </div>
      </div>
      <button
        className="bg-[#8417ff] rounded-md flex justify-center items-center p-2 sm:p-3 md:p-5 focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all"
        onClick={handleSendMessage}
      >
        <IoSend className="text-lg sm:text-xl md:text-2xl" />
      </button>
    </div>
  );
}

export default MessageBar;
