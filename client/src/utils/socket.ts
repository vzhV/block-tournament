import { io } from "socket.io-client";
export const socket = io("https://api.adrtest.com.ua", { autoConnect: true, transports: ["websocket"] });
// Or your local server url
