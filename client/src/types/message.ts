import type { User } from "./user";
import type { Reaction } from "./reaction";

export type MessageStatus="sent"|"delivered"|"read";

export interface Message{
    _id:string;
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