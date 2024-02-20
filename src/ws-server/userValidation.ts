import { users } from "./server";
import { UserItem } from "./types";

export const validatePassword = (name: string, password: string) => {
    let res = true;
    users.forEach((item: UserItem) => {
        if (item.name === name && item.password === password) {
            res = true;
        } else {
            res = false;
        }
    });
    console.log('valid: ', res);
    return !!res;
}