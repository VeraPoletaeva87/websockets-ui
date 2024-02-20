import { ships } from "./server";

export const calcAttackStatus = (x: number, y: number) => {
    let res = 'miss';

    ships.forEach((item) => {
        if (item.position.x === x && item.position.y === y) {
            if (item.length === 1) {
                res = 'killed';
            } else {
                res = 'shot';
            } 
        }
    });
    
    console.log('attack status: ', res);
    return res;
}