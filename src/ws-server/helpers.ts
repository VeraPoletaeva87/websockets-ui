import { gameShips } from "./server";
import { GameShip, Ship } from "./types";

const SIZE = 10;
const MAX_SHOTS = 20; // total number of cells with ships of both players

let loser = '';

let myBoard = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
let enemyBoard = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
let boards: any = [];

export const calcAttackStatus = (x: number, y: number, player: string) => {
    let res = 'miss';

    const enemy = boards.find((item: any) => item.id !== player);
    const index = boards.indexOf(enemy);

    const board = enemy.board;

    for (let i=0; i < SIZE; i++) {
        for (let j=0; j < SIZE; j++) {
            if (i === x && j === y && board[x][y] !== 0) {
                board[x][y] = 2;
                let shots = boards[index].shots;
                shots++;
                boards[index].shots = shots;
                res = 'shot';
            }
        }
    }
    
    console.log('attack status: ', res);
    return res;
}

// fill all the board cells with 1 if there is a ship
export const fillGameBoard = (current: string) => {
    myBoard = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
    enemyBoard = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
    const ships = gameShips.find((item: GameShip) => item.playerId === current)?.userShips;
    ships?.forEach((ship: Ship) => {
        const { position, direction, length } = ship;
        const { x, y } = position;

        if (direction) { // vertical
            for (let i = y; i < y + length; i++) {
                myBoard[x][i] = 1;
            }
        } else { // horizontal
            for (let i = x; i < x + length; i++) {
                myBoard[i][y] = 1;
            }
        }
    });

    boards.push({id: current, board: myBoard, shots: 0});
    const enemy = gameShips.find((item: GameShip) => item.playerId !== current);
    const enemyShips = gameShips.find((item: GameShip) => item.playerId !== current)?.userShips;
    enemyShips?.forEach((ship: Ship) => {
        const { position, direction, length } = ship;
        const { x, y } = position;

        if (direction) { // vertical
            for (let i = y; i < y + length; i++) {
                enemyBoard[x][i] = 1;
            }
        } else { // horizontal
            for (let i = x; i < x + length; i++) {
                enemyBoard[i][y] = 1;
            }
        }
    });

    boards.push({id: enemy?.playerId, board: enemyBoard, shots: 0});
}

export const getRandomCoordinates = () => {
    let x,y;
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
    return {x: x, y: y};
}

// if all ships are shot - no cells with 1
export const isGameFinished = () => {
    let res = false;
    boards.forEach((item: any) => {
        console.log(item.shots);
        if (item.shots === MAX_SHOTS) {
            res = true;
            loser = item.id;
        }
    })
    return {finished: res, loser: loser};
}