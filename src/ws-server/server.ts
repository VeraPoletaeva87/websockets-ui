import { randomUUID } from "crypto";
import { WebSocket, WebSocketServer } from "ws";
import { UserItem, Winner, Ship, Room } from "./types";
import { validatePassword } from "./userValidation";
import { calcAttackStatus, fillGameBoard, getRandomCoordinates, isGameFinished } from "./helpers";
import { getEnemyId } from "./userHelpers";
import { finishGame } from "./gameHelpers";

export const users: UserItem[] = [];
export const winners: Winner[] = [];
export const rooms: Room[] = [];
export const ships: Ship[] = [];

let currentPlayer: string | undefined = '';
// Store connected clients
export const clients: any = [];

const wss = new WebSocketServer({ port: 3000 });

const registerUser = (ws: WebSocket, user: UserItem, id: string) => {
  ws.send(JSON.stringify({
    type: "reg",
    data: JSON.stringify({
        name: user.name,
        index: id,
        error: false,
        errorText: '',
    }),
    id: 0,
  }));
  ws.send(JSON.stringify({
      type: "update_winners",
      data: JSON.stringify([]),
      id: 0,
  }));
  console.log('update room after reg', rooms)
  ws.send(JSON.stringify({
      type: "update_room",
      data: JSON.stringify(rooms),
      id: 0,
  }));
}


wss.on('listening', function () {
    console.log('WebSocket server is listening on port', wss.options.port);
  });

wss.on('closed',  function () {
    console.log("WebSocket connection closed");
});  

wss.on('connection', function connection(ws) {
  const playerId = randomUUID();
  clients.push({ws: ws, userId: playerId});

  ws.on('message', (data) => {
    const command = JSON.parse(data.toString());
    if (command.type === 'reg') {
        const userInfo = JSON.parse(command.data.toString());

        //if user exists - check if password is valid
        const user = users.find((item) => item.name === userInfo.name);
        if (user) {
          if (validatePassword(userInfo.name, userInfo.password)) {
            registerUser(ws, user, user.id);
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
          users.push({name:  userInfo.name, password: userInfo.password, id: playerId});
          registerUser(ws, userInfo, playerId);
        }
        console.log('received: ', command.type, 'name: ', userInfo.name, 'password: ', userInfo.password);
    }
    if (command.type === 'create_room') {
        const id = randomUUID();
        console.log('create room with player ', users[0].name);
        rooms.push({roomId: id, roomUsers: [{
          name: users[0].name,
          index: users[0].id,
      }]});
        ws.send(JSON.stringify({
            type: "update_room",
            data: JSON.stringify(rooms),
            id: 0,
        }));
    }

    if (command.type === 'add_user_to_room') {
      const roomInfo = JSON.parse(command.data.toString());
      const roomId = roomInfo.indexRoom;
      console.log('add user to room', currentPlayer);
      const room = rooms.find((item) => item.roomId === roomId);
      room?.roomUsers.push({ name: users[1].name,
        index: users[1].id});
      //add user to roomUsers
      ws.send(JSON.stringify({
        type: "update_room",
        data: JSON.stringify([
          {
            roomId: roomId,
            roomUsers: room?.roomUsers
        }
        ]),
        id: 0,
    }));

      ws.send(JSON.stringify({
        type: "create_game",
        data: JSON.stringify(
          {
            idGame: roomId,
            idPlayer: playerId,
        }
        ),
        id: 0,
    }));
    }

    if (command.type === 'add_ships') {
      const shipsInfo = JSON.parse(command.data.toString());
      shipsInfo.ships.forEach((item: Ship)=> {
        ships.push(item);
      })
      //define ships on board
      fillGameBoard();
      console.log('add ships', ships);
      ws.send(JSON.stringify({
        type: "start_game",
        data: JSON.stringify(
          {
            ships: ships,
            currentPlayerIndex: shipsInfo.indexPlayer,
        }
        ),
        id: 0,
    }));
    ws.send(JSON.stringify({
      type: "turn",
      data: JSON.stringify(
          {
              currentPlayer: users[0].id
          }),
      id: 0,
    }));
    }

    if (command.type === 'attack') {
      const attackInfo = JSON.parse(command.data.toString());

      currentPlayer = getEnemyId(attackInfo.indexPlayer, playerId);

      console.log('attack on ', attackInfo.x, attackInfo.y, 'by ', attackInfo.indexPlayer);

      if (attackInfo.indexPlayer === playerId) {
        const status = calcAttackStatus(attackInfo.x, attackInfo.y);
        ws.send(JSON.stringify({
          type: "attack",
          data: JSON.stringify(
            {
              position:
              {
                  x: attackInfo.x,
                  y: attackInfo.y,
              },
              currentPlayer: attackInfo.indexPlayer, 
              status: status,
          }
          ),
          id: 0,
      }));
  
      console.log('current playerId is: ', attackInfo.indexPlayer);
    
      if (status === 'miss') {
        ws.send(JSON.stringify({
        type: "turn",
        data: JSON.stringify(
            {
                currentPlayer: currentPlayer
            }),
        id: 0,
      }));
      const anotherClient = clients.find((item: any ) => item.userId === currentPlayer).ws;
      anotherClient.send(JSON.stringify({
        type: "turn",
        data: JSON.stringify(
            {
                currentPlayer: currentPlayer
            }),
        id: 0,
      }));
      }
      } 

      // check if all ships are shot, if so - finish game update winners
      if (isGameFinished()) {
        finishGame(ws, currentPlayer);
      }
    }

    if (command.type === 'randomAttack') {
      const attackInfo = JSON.parse(command.data.toString());

      currentPlayer = getEnemyId(attackInfo.indexPlayer, playerId);

      console.log('random attack by ', attackInfo.indexPlayer);

      const {x,y} = getRandomCoordinates();
      if (attackInfo.indexPlayer === playerId) {
        const status = calcAttackStatus(x, y);
        ws.send(JSON.stringify({
          type: "attack",
          data: JSON.stringify(
            {
              position:
              {
                  x: x,
                  y: y,
              },
              currentPlayer: attackInfo.indexPlayer, 
              status: status,
          }
          ),
          id: 0,
      }));
  
      console.log('current playerId is: ', attackInfo.indexPlayer);
    
      if (status === 'miss') {
        ws.send(JSON.stringify({
        type: "turn",
        data: JSON.stringify(
            {
                currentPlayer: currentPlayer
            }),
        id: 0,
      }));
      const anotherClient = clients.find((item: any ) => item.userId === currentPlayer).ws;
      anotherClient.send(JSON.stringify({
        type: "turn",
        data: JSON.stringify(
            {
                currentPlayer: currentPlayer
            }),
        id: 0,
      }));
      }
      } 
    }
  });
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