import { clients, users } from "./server";
import { WebSocket } from "ws";

export const finishGame = (ws: WebSocket, current: string | undefined, loser: string) => {
    const user = users.find((item) => item.id !== loser);
    ws.send(JSON.stringify({
      type: "update_winners",
      data: JSON.stringify(
        [
          {
              name: user?.name,
              wins: 1,
          }
      ],),
      id: 0,
    }));
    ws.send(JSON.stringify({
      type: "finish",
      data: JSON.stringify(
          {
            winPlayer: user?.id
          }),
      id: 0,
    }));
    const anotherClient = clients.find((item: any ) => item.userId === current).ws;
    anotherClient.send(JSON.stringify({
      type: "finish",
      data: JSON.stringify(
          {
            winPlayer: user?.id
          }),
      id: 0,
    }));
  }