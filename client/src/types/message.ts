import type { User } from "./user";
interface Reaction{
    user:User;
    emoji:string;
}

export type MessageStatus="sent"|"delivered"|"read";

export interface Message{
    conversation:string;
    sender:User;
    receiver:User;
    content?:string;
    imageOrVideoURL?:string;
    contentType?:"image"|"video"|"text";
    reactions:Reaction[];
    messageStatus:MessageStatus;
    createdAt:string;
    updatedAt:string;
}