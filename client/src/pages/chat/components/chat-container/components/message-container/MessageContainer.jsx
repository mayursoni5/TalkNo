import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTES,
  GET_CHANNEL_MESSAGES_ROUTE,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowRoundDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";

function MessageContainer() {
  const scrollRef = useRef();
  const messagesContainerRef = useRef();
  const {
    selectedChatData,
    selectedChatType,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    setIsDownloading,
    setFileDownloadProgress,
    messagesPagination,
    setMessagesPagination,
    setIsLoadingMore,
    loadMoreMessages,
    isNewMessage,
  } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  useEffect(() => {
    const getMessages = async () => {
      try {
        setIsInitialLoad(true);
        const res = await apiClient.post(
          GET_ALL_MESSAGES_ROUTES,
          { id: selectedChatData._id, page: 1, limit: 20 },
          { withCredentials: true }
        );
        if (res.data.messages) {
          setSelectedChatMessages(res.data.messages);
          setMessagesPagination({
            hasMore: res.data.hasMore,
            currentPage: res.data.currentPage,
            isLoadingMore: false,
            totalMessages: res.data.totalMessages,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    const getChannelMessages = async () => {
      try {
        setIsInitialLoad(true);
        const res = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}?page=1&limit=20`,
          { withCredentials: true }
        );
        if (res.data.messages) {
          setSelectedChatMessages(res.data.messages);
          setMessagesPagination({
            hasMore: res.data.hasMore,
            currentPage: res.data.currentPage,
            isLoadingMore: false,
            totalMessages: res.data.totalMessages,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (selectedChatData._id) {
      if (selectedChatType === "contact") {
        getMessages();
      }
      if (selectedChatType === "channel") {
        getChannelMessages();
      }
    }
  }, [
    selectedChatData,
    selectedChatType,
    setSelectedChatMessages,
    setMessagesPagination,
  ]);

  useEffect(() => {
    if (
      scrollRef.current &&
      (isInitialLoad || isNewMessage) &&
      !messagesPagination.isLoadingMore &&
      !isLoadingOlder
    ) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    selectedChatMessages.length,
    isInitialLoad,
    isNewMessage,
    messagesPagination.isLoadingMore,
    isLoadingOlder,
  ]);

  const loadOlderMessages = async () => {
    if (messagesPagination.isLoadingMore || !messagesPagination.hasMore) return;

    const container = messagesContainerRef.current;
    const previousScrollHeight = container.scrollHeight;

    setIsLoadingMore(true);
    setIsInitialLoad(false);
    setIsLoadingOlder(true);
    const nextPage = messagesPagination.currentPage + 1;

    try {
      if (selectedChatType === "contact") {
        const res = await apiClient.post(
          GET_ALL_MESSAGES_ROUTES,
          { id: selectedChatData._id, page: nextPage, limit: 20 },
          { withCredentials: true }
        );
        if (res.data.messages) {
          loadMoreMessages(res.data.messages, {
            hasMore: res.data.hasMore,
            currentPage: res.data.currentPage,
            totalMessages: res.data.totalMessages,
          });

          setTimeout(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
            setIsLoadingOlder(false);
          }, 0);
        }
      } else if (selectedChatType === "channel") {
        const res = await apiClient.get(
          `${GET_CHANNEL_MESSAGES_ROUTE}/${selectedChatData._id}?page=${nextPage}&limit=20`,
          { withCredentials: true }
        );
        if (res.data.messages) {
          loadMoreMessages(res.data.messages, {
            hasMore: res.data.hasMore,
            currentPage: res.data.currentPage,
            totalMessages: res.data.totalMessages,
          });

          setTimeout(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
            setIsLoadingOlder(false);
          }, 0);
        }
      }
    } catch (error) {
      console.log(error);
      setIsLoadingMore(false);
    }
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      if (
        scrollTop <= 0 &&
        messagesPagination.hasMore &&
        !messagesPagination.isLoadingMore
      ) {
        loadOlderMessages();
      }
    }
  };

  const checkIfImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;
      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessages(message)}
          {selectedChatType === "channel" && renderChannelMessages(message)}
        </div>
      );
    });
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    const res = await apiClient.get(`${HOST}${url}`, {
      responseType: "blob",
      onDownloadProgress: (ProgressEvent) => {
        const { loaded, total } = ProgressEvent;
        const percentCompleted = Math.round((loaded * 100) / total);
        setFileDownloadProgress(percentCompleted);
      },
    });
    const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = urlBlob;
    link.setAttribute("download", url.split("/").pop());
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);
    setIsDownloading(false);
    setFileDownloadProgress(0);
  };

  const renderDMMessages = (message) => (
    <div
      className={`${
        message.sender._id === userInfo.id ? "text-right" : "text-left"
      }`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender._id === userInfo.id
              ? " bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : " bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-2 sm:p-3 md:p-4 rounded my-1 max-w-[75%] sm:max-w-[65%] md:max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && (
        <div
          className={`${
            message.sender._id === userInfo.id
              ? " bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : " bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-2 sm:p-3 md:p-4 rounded my-1 max-w-[75%] sm:max-w-[65%] md:max-w-[50%] break-words`}
        >
          {checkIfImage(message.fileUrl) ? (
            <div
              className=" cursor-pointer"
              onClick={() => {
                setShowImage(true);
                setImageURL(message.fileUrl);
              }}
            >
              <img
                src={`${HOST}${message.fileUrl}`}
                alt="!!Image Not Loaded!!"
                height={300}
                width={300}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                <MdFolderZip />
              </span>
              <span
                className="break-words max-w-full w-full mt-2 overflow-hidden"
                style={{ wordBreak: "break-word", whiteSpace: "normal" }}
              >
                {message.fileUrl.split("/").pop().length > 35
                  ? message.fileUrl.split("/").pop().slice(0, 20) + "..."
                  : message.fileUrl.split("/").pop()}
              </span>
              <span
                className=" bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                onClick={() => downloadFile(message.fileUrl)}
              >
                <IoMdArrowRoundDown />
              </span>
            </div>
          )}
        </div>
      )}
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  const renderChannelMessages = (message) => {
    return (
      <div
        className={`mt-3 sm:mt-4 md:mt-5 ${
          message.sender._id !== userInfo.id ? "text-left" : "text-right"
        }`}
      >
        {message.messageType === "text" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? " bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : " bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-2 sm:p-3 md:p-4 rounded my-1 max-w-[75%] sm:max-w-[65%] md:max-w-[50%] break-words ml-4 sm:ml-6 md:ml-8 mr-1 sm:mr-2`}
          >
            {message.content}
          </div>
        )}
        {message.messageType === "file" && (
          <div
            className={`${
              message.sender._id === userInfo.id
                ? " bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
                : " bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-2 sm:p-3 md:p-4 rounded my-1 max-w-[75%] sm:max-w-[65%] md:max-w-[50%] break-words`}
          >
            {checkIfImage(message.fileUrl) ? (
              <div
                className=" cursor-pointer"
                onClick={() => {
                  setShowImage(true);
                  setImageURL(message.fileUrl);
                }}
              >
                <img
                  src={`${HOST}${message.fileUrl}`}
                  alt="!!Image Not Loaded!!"
                  height={300}
                  width={300}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolderZip />
                </span>
                <span
                  className="break-words max-w-full w-full mt-2 overflow-hidden"
                  style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                >
                  {message.fileUrl.split("/").pop().length > 35
                    ? message.fileUrl.split("/").pop().slice(0, 20) + "..."
                    : message.fileUrl.split("/").pop()}
                </span>
                <span
                  className=" bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
                  onClick={() => downloadFile(message.fileUrl)}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        {message.sender._id !== userInfo.id ? (
          <div className="flex items-center justify-start gap-3">
            <Avatar className="h-8 w-8  rounded-full overflow-hidden">
              {message.sender?.image && (
                <AvatarImage
                  src={`${HOST.replace(/\/$/, "")}/${message.sender.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black"
                />
              )}{" "}
              {
                <AvatarFallback
                  className={`uppercase h-8 w-8 text-xl font-semibold border-[5px] flex items-center justify-center rounded-full ${getColor(
                    message.sender?.color || "defaultColor"
                  )}`}
                >
                  {message.sender?.firstName
                    ? message.sender.firstName.charAt(0)
                    : message.sender?.email?.charAt(0) || "?"}
                </AvatarFallback>
              }
            </Avatar>
            <span className="text-sm text-white/60">{`${message.sender.firstName}`}</span>
            <span className="text-xs text-white/60">
              {moment(message.timestamp).format("LT")}
            </span>
          </div>
        ) : (
          <div className="text-xs text-white/60 mt-1">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto scrollbar-hidden custom-scrollbar p-4 px-4 sm:px-6 md:px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full"
      onScroll={handleScroll}
    >
      {messagesPagination.isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="text-neutral-400 text-sm">
            Loading older messages...
          </div>
        </div>
      )}
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
          <div className="w-[90%] sm:w-[80%] md:w-[70%] max-h-[80vh] overflow-hidden">
            <img
              src={`${HOST}${imageURL}`}
              alt=""
              className="max-h-[70vh] w-full object-contain"
            />
          </div>
          <div className="flex gap-3 sm:gap-5 fixed top-2 sm:top-5 right-2 sm:right-5">
            <button
              className="bg-black/20 p-2 sm:p-3 text-xl sm:text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => downloadFile(imageURL)}
            >
              <IoMdArrowRoundDown />
            </button>
            <button
              className="bg-black/20 p-2 sm:p-3 text-xl sm:text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageContainer;
