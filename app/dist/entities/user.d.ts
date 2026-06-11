import { BaseEntity } from 'typeorm';
export declare class User extends BaseEntity {
    id: string;
    email: string;
    hasVerifiedEmail: boolean;
    static findByName(email: string): Promise<User | null>;
    static findById(id: string): Promise<User | null>;
}
