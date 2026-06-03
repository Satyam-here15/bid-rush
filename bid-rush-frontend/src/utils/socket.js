import { io } from "socket.io-client";

const socket = io("https://bidrush-notification.onrender.com", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;