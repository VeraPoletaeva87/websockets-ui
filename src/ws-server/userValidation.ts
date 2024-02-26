import { users } from "./server";
import { UserItem } from "./types";

export const validatePassword = (name: string, password: string) => {
    let res = true;
    const user = users.find((item: UserItem) => item.name === name);
    if (user && user.password === password) {
        res = true;
    } else {
        res = false;
    }
    console.log('valid: ', res);
    return !!res;
}