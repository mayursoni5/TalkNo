# TalkNo

<img src="client\public\TalkNo_Logo.png" alt="TalkNo Logo" width="300" height="300">

TalkNo is a real-time chat application that allows users to chat, share images/videos, send file attachments, and make voice/video calls. It also supports group chat functionality.

## Features

- ✅ One-on-one private messaging
- ✅ Group chat functionality
- ✅ Real-time messaging using WebSockets (Socket.IO)
- ✅ File sharing (images, videos, documents)
- ✅ User authentication (Sign up / Login)
- ✅ Notifications for new messages and calls

## Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-time Communication:** Socket.IO, WebRTC
- **Authentication:** JWT (JSON Web Token)
- **Storage:** Cloud storage (AWS S3 or Firebase Storage)

## Installation

### Prerequisites

Make sure you have the following installed:

- Node.js & npm
- MongoDB (or MongoDB Atlas)

### Steps to Run Locally

1. **Clone the repository:**
   ```sh
   git clone https://github.com/mayursoni5/TalkNo.git
   cd TalkNo
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root directory
   - Add the required environment variables (MongoDB URI, JWT Secret, etc.)
4. **Run the backend server:**
   ```sh
   npm start
   ```
5. **Run the frontend:**
   - Navigate to the client folder and install dependencies:
     ```sh
     cd client
     npm install
     npm start
     ```
6. Open your browser and go to `http://localhost:3000`
