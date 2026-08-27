import type { User } from "./user";
interface Reaction{
    user:User;
    emoji:string;
}
export interface Message{
    conversation:string;
    sender:User;
    receiver:User;
    content?:string;
    imageOrVideoURL?:string;
    contentType?:"image"|"video"|"text";
    reactions:Reaction[];
    messageStatus:string;
    createdAt:string;
    updatedAt:string;
}