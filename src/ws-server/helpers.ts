import { ships } from "./server";
import { ShipCoords } from "./types";

const SIZE = 10;

const board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));

// array of ships with start and end points
const shipsCoord: ShipCoords[] = [];

const calcShipsCoords = () => {
    ships.forEach(ship => {
        const { position, direction, length } = ship;
        const { x, y } = position;
        let startX, startY, endX, endY;

        if (direction) {
            startX = x;
            startY = y;
            endX = x + length - 1;
            endY = y;
        } else {
            startX = x;
            startY = y;
            endX = x;
            endY = y + length - 1;
        }

        shipsCoord.push({ start: { x: startX, y: startY }, end: { x: endX, y: endY } });
    });
}

// check if current attack killed one of the ships
const ifShipSunk = () => {
    let res = false;
    const killedShips: number[] = [];
    shipsCoord.forEach((ship, index) => {
        let isKilled = true;
        const { start, end } = ship;

        if (start.x === end.x) { // Ship is vertical
            for (let i = start.y; i <= end.y; i++) {
                if (board[start.x][i] !== 2) {
                    isKilled = false;
                    break;
                }
            }
        } 
        if (start.y === end.y)  { // Ship is horizontal
            for (let i = start.x; i <= end.x; i++) {
                if (board[i][start.y] !== 2) {
                    isKilled = false;
                    break;
                }
            }
        }

        if (isKilled) {
            ships.splice(index, 1);
            res = true;
           // killedShips.push(index);
        }
    });

    //console.log(killedShips);
   // res = !!killedShips.length;

    // Remove killed ships from the initial array
    // killedShips.reverse().forEach(index => {
    //     ships.splice(index, 1);
    // });

    return res;
}

export const calcAttackStatus = (x: number, y: number) => {
    let res = 'miss';

    for (let i=0; i < 10; i++) {
        for (let j=0; j < 10; j++) {
            if (i === x && j === y && board[x][y] !== 0) {
                board[x][y] = 2;
                res = 'shot';
                // if (ifShipSunk()) {
                //     res = 'killed'
                // } else {
                //     res = 'shot';
                // }
            }
        }
    }
    
    console.log('attack status: ', res);
    return res;
}

// fill all the board cells with 1 if there is a ship
export const fillGameBoard = () => {
    calcShipsCoords();
    //console.log(shipsCoord);
    ships.forEach(ship => {
        const { position, direction, length } = ship;
        const { x, y } = position;

        if (direction) { // vertical
            for (let i = y; i < y + length; i++) {
                board[x][i] = 1;
            }

        } else { // horizontal
            for (let i = x; i < x + length; i++) {
                board[i][y] = 1;
            }
        }
    });

   // console.log(board);
}