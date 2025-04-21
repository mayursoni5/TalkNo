# TalkNo

<img src="client\public\TalkNo_Logo.png" alt="TalkNo Logo" width="300" height="300">

TalkNO is a modern, full-stack real-time chat application that supports private messaging, group chats, user authentication, WebSocket-based real-time communication, and file uploads. Built using the **MERN stack**, it's designed to provide a fast and seamless chatting experience.

Live Demo:

- 🌐 Frontend: [talkno.vercel.app](https://talkno.vercel.app)
- 🌐 Backend: [talkno-backend](https://talkno-api.up.railway.app/)

---

## Features

- 💬 One-on-one private messaging
- ✅ Group chat functionality
- 💬 Real-time messaging using WebSockets (Socket.IO)
- 📤 File sharing (images, videos, documents)
- 🔐 User authentication (Sign up / Login)
- ✅ Toast notifications
- 🌙 Beautiful dark UI with gradient theme

## Tech Stack

**Frontend:**

- React
- Tailwind CSS + ShadCN UI
- Vite
- Zustand for state management
- Axios
- Vercel (Deployment)

**Backend:**

- Node.js + Express
- MongoDB + Mongoose
- Real-time Communication with WebSocket (Socket.IO)
- Cookie-based Authentication by JWT (JSON Web Token)
- Railway (Deployment)

---

## 🗂️ Project Structure

```
talkno/
├── client/        # Frontend (React)
└── server/        # Backend (Express)
```

---

## Installation

### Prerequisites

Make sure you have the following installed:

- Node.js & npm
- MongoDB (or MongoDB Atlas)

### Steps to Run Locally

### 📁 Clone the Repository

```bash
git clone https://github.com/mayursoni5/TalkNo
cd talkno
```

---

## 🖥️ Frontend Setup

```bash
cd client
npm install
```

### ➕ Create `.env` File

```env
VITE_BACKEND_URL=http://localhost:3000
```

### ▶️ Run the Frontend

```bash
npm run dev
```

---

## 🖱️ Backend Setup

```bash
cd server
npm install
```

### ➕ Create `.env` File

```env
PORT=3000
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/talkno
ORIGIN=http://localhost:5173
```

### ▶️ Run the Backend

```bash
npm run dev
```

---

## 📥 Important Dependencies

### Frontend

- `axios`
- `zustand`
- `sonner`
- `react-router-dom`
- `tailwindcss`
- `shadcn/ui`

### Backend

- `express`
- `mongoose`
- `cors`
- `dotenv`
- `cookie-parser`
- `socket.io`
- `multer`

---

## 📸 Screenshots

### Here are some screenshots, for example:

- Login Page

 <img src="client\public/auth-image.png" alt="TalkNo Logo">

---

- Profile Setup Page

 <img src="client\public/profileSetup-image.png" alt="TalkNo Logo">

---

- Dashboard

<img src="client\public/dashboard-image.png" alt="TalkNo Logo" >

---

- Chat Interface

<img src="client\public/chat-image.png" alt="TalkNo Logo" >

---

- Group Chat

<img src="client\public/channel-chat-image.png" alt="TalkNo Logo" >

---

## 🙇‍♂️ Author

Made by [Mayur](https://github.com/mayursoni5)

---
