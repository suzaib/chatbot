import type { User } from "./user";

export interface Reaction{
    user:User;
    emoji:string;
}