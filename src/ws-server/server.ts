import { WebSocketServer } from "ws";

const users = [];
const rooms = [];

const wss = new WebSocketServer({ port: 3000 });

wss.on('listening', function () {
    console.log('WebSocket server is listening on port', wss.options.port);
  });

wss.on('connection', function connection(ws) {
  ws.on('message', (data) => {
    const command = JSON.parse(data.toString());
    if (command.type === 'reg') {
        const userInfo = JSON.parse(command.data.toString());
        users.push({name:  userInfo.name, password: userInfo.password});
        ws.send(JSON.stringify({
            type: "reg",
            data: JSON.stringify({
                name: userInfo.name,
                index: 100,
                error: false,
                errorText: '',
            }),
            id: 0,
        }));
        console.log('received: ', command.type, 'name: ', userInfo.name, 'password: ', userInfo.password);
    }
    if (command.type === 'create_room') {
        console.log('create room');
        rooms.push({
            roomId: ,
            roomUsers:
                [{
                    name: <string>,
                    index: <number>,
                }
            ],
        });
        ws.send(JSON.stringify({
            type: "update_room",
            data: JSON.stringify(rooms),
            id: 0,
        }));
    }
  });

 // ws.send('something');
});

process.on('SIGINT', function () {
    console.log("Closing WebSocket server...");
    wss.close(function () {
      console.log("WebSocket server closed.");
      process.exit();
    });
  });
  
  process.on('SIGTERM', function () {
    console.log("Closing WebSocket server...");
    wss.close(function () {
      console.log("WebSocket server closed.");
      process.exit();
    });
  });