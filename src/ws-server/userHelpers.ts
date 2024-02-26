import { users } from "./server";

export const getEnemyId = (attackerId: string, clientId: string) => {
    let currentPlayer: string | undefined = '';
if (attackerId === clientId) {
    currentPlayer = users.find((item) => item.id !== attackerId)?.id;
  } else {
    currentPlayer = attackerId;
  }
  return currentPlayer;
}  