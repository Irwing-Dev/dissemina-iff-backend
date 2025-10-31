# dissemina-iff-backend

// Grita baixo
// import WebSocket, {WebSocketServer} from "ws" 

// console.log(WebSocket)

// // Create a WebSocket server instance on a specific port
// const wss = new WebSocketServer({ port: 8080 });

// // Event listener for new connections
// wss.on('connection', ws => {
//     console.log('Client connected');

//     // Event listener for messages received from the client
//     ws.on('message', message => {
//         console.log("recebi: "+ message)
//         // Echo the message back to the client
//         ws.send("vida:"+message);
//     });

//     // Event listener for connection closure
//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });

//     // Event listener for errors
//     ws.on('error', error => {
//         console.error(`WebSocket error: ${error}`);
//     });

//     // Send a welcome message to the newly connected client
//     ws.send('Welcome to the WebSocket server!');
// });

// console.log('WebSocket server started on ws://localhost:8080');
