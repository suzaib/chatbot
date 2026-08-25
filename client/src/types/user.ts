export interface User{
    _id:string;
    username?:string;
    email:string;
    emailOtp?:string;
    emailOtpExpiry?:string;
    profilePicture?:string;
    about?:string;
    lastSeen?:string;
    isOnline:boolean;
    isVerified:boolean;
    agreed:boolean;
    createdAt?:string;
    updatedAt?:string;
}