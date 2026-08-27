import type { User } from "./user";
import type {Message} from "./message";

export interface Conversation{
    participants:User[];
    lastMessage?:Message;
    unreadCount:number;
}

