export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  onlineUsers: new Set(),
  messagesPagination: {
    hasMore: true,
    currentPage: 1,
    isLoadingMore: false,
    totalMessages: 0,
  },
  isNewMessage: false,
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) =>
    set({ fileDownloadProgress }),
  setOnlineUsers: (users) => set({ onlineUsers: new Set(users) }),
  addOnlineUser: (userId) => {
    const onlineUsers = get().onlineUsers;
    onlineUsers.add(userId);
    set({ onlineUsers: new Set(onlineUsers) });
  },
  removeOnlineUser: (userId) => {
    const onlineUsers = get().onlineUsers;
    onlineUsers.delete(userId);
    set({ onlineUsers: new Set(onlineUsers) });
  },
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),
  setMessagesPagination: (pagination) =>
    set({ messagesPagination: pagination }),
  setIsLoadingMore: (isLoadingMore) => {
    const messagesPagination = get().messagesPagination;
    set({ messagesPagination: { ...messagesPagination, isLoadingMore } });
  },
  loadMoreMessages: (newMessages, paginationData) => {
    const selectedChatMessages = get().selectedChatMessages;
    set({
      selectedChatMessages: [...newMessages, ...selectedChatMessages],
      messagesPagination: {
        hasMore: paginationData.hasMore,
        currentPage: paginationData.currentPage,
        isLoadingMore: false,
        totalMessages: paginationData.totalMessages,
      },
      isNewMessage: false,
    });
  },
  setIsNewMessage: (isNewMessage) => set({ isNewMessage }),
  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },
  updateChannel: (updatedChannel) => {
    const channels = get().channels;
    const channelIndex = channels.findIndex(
      (ch) => ch._id === updatedChannel._id
    );
    if (channelIndex !== -1) {
      channels[channelIndex] = updatedChannel;
      set({ channels: [...channels] });
    }
  },
  removeChannel: (channelId) => {
    const channels = get().channels;
    set({ channels: channels.filter((ch) => ch._id !== channelId) });
  },

  closeChat: () =>
    set({
      selectedChatType: undefined,
      selectedChatData: undefined,
      selectedChatMessages: [],
      messagesPagination: {
        hasMore: true,
        currentPage: 1,
        isLoadingMore: false,
        totalMessages: 0,
      },
      isNewMessage: false,
    }),
  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel" ? message.sender : message.sender,
        },
      ],
      isNewMessage: true,
    });
  },
  addChannelInChannelList: (message) => {
    const channels = get().channels;
    const data = channels.find((channel) => channel._id === message.channelId);
    const index = channels.findIndex(
      (channel) => channel._id === message.channelId
    );
    if (index !== -1 && index !== undefined) {
      channels.splice(index, 1);
      channels.unshift(data);
    }
  },
  addContactsInDMContacts: (message) => {
    const userId = get().userInfo.id;
    const fromId =
      message.sender._id === userId
        ? message.recipient._id
        : message.sender._id;

    const fromData =
      message.sender._id === userId ? message.recipient : message.sender;

    const dmContacts = get().directMessagesContacts;
    const data = dmContacts.find((contact) => contact._id === fromId);
    const index = dmContacts.findIndex((contact) => contact._id === fromId);

    if (index !== -1 && index !== undefined) {
      dmContacts.splice(index, 1);
      dmContacts.unshift(data);
    } else {
      dmContacts.unshift(fromData);
    }

    set({ directMessagesContacts: dmContacts });
  },
});
