export interface User {
    id: string;
    uid: string;
    email: string;
    fullName: string;
    photo: string;
    createdAt: Date;
}

export interface UserData {
    fullName: string;
    photo: string;
}