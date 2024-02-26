import { clients, users } from "./server";
import { WebSocket } from "ws";

export const finishGame = (ws: WebSocket, current: string | undefined) => {
    ws.send(JSON.stringify({
      type: "update_winners",
      data: JSON.stringify(
        [
          {
              name: users[0].name,
              wins: 1,
          }
      ],),
      id: 0,
    }));
    ws.send(JSON.stringify({
      type: "finish",
      data: JSON.stringify(
          {
            winPlayer: current
          }),
      id: 0,
    }));
    const anotherClient = clients.find((item: any ) => item.userId === current).ws;
    anotherClient.send(JSON.stringify({
      type: "finish",
      data: JSON.stringify(
          {
            winPlayer: current
          }),
      id: 0,
    }));
  }