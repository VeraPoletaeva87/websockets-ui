import { randomUUID } from "crypto";
import { WebSocketServer } from "ws";
import { UserItem, Winner, Ship } from "./types";
import { validatePassword } from "./userValidation";

export const users: UserItem[] = [];
export const winners: Winner[] = [];
export const roomUsers = [];
export const ships: Ship[] = [];

const wss = new WebSocketServer({ port: 3000 });

wss.on('listening', function () {
    console.log('WebSocket server is listening on port', wss.options.port);
  });

wss.on('connection', function connection(ws) {
  ws.on('message', (data) => {
    const command = JSON.parse(data.toString());
    if (command.type === 'reg') {
        const userInfo = JSON.parse(command.data.toString());

        //if user exists - check if password is valid
        if (users.find((item) => item.name === userInfo.name)) {
          if (validatePassword(userInfo.name, userInfo.password)) {
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
          ws.send(JSON.stringify({
            type: "update_winners",
            data: JSON.stringify({
                name: userInfo.name,
                wins: 0
            }),
            id: 0,
        }));
          } else {
            ws.send(JSON.stringify({
              type: "reg",
              data: JSON.stringify({
                  name: userInfo.name,
                  index: 100,
                  error: true,
                  errorText: 'Invalid password',
              }),
              id: 0,
          }));
          }
        } else { // else add new user to array
          users.push({name:  userInfo.name, password: userInfo.password});
        }
        console.log(users);
        console.log('received: ', command.type, 'name: ', userInfo.name, 'password: ', userInfo.password);
    }
    if (command.type === 'create_room') {
        console.log('create room');

        ws.send(JSON.stringify({
            type: "update_room",
            data: JSON.stringify([
              {
                roomId: randomUUID(),
                roomUsers:
                    [{
                        name: users[0].name,
                        index: 100,
                    }
                ],
            }
            ]),
            id: 0,
        }));
    }

    if (command.type === 'add_user_to_room') {
      const roomInfo = JSON.parse(command.data.toString());
      const roomId = roomInfo.indexRoom;
      console.log('add user to room');
      ws.send(JSON.stringify({
        type: "create_game",
        data: JSON.stringify(
          {
            idGame: roomId,
            idPlayer: randomUUID(),
        }
        ),
        id: 0,
    }));
    }

    if (command.type === 'add_ships') {
      const shipsInfo = JSON.parse(command.data.toString());
      const ships = shipsInfo.ships;
      console.log('add ships');
      ws.send(JSON.stringify({
        type: "start_game",
        data: JSON.stringify(
          {
            idGame: roomId,
            idPlayer: randomUUID(),
        }
        ),
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