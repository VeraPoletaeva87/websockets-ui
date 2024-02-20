export interface UserItem {
    name: string;
    password: string;
}

export interface Winner {
    name: string;
    wins: number;
}

export interface Ship {
    position: {
        x: number;
        y: number;
    },
    direction: boolean;
    length: number;
    type: string;
}

export interface Player {
    idPlayer: string
}

export interface Attack {
        gameId: number;
        x: number;
        y: number;
        indexPlayer: number;
}