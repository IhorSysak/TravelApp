export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fistName: string;
    LastName: string;
    email: string;
    password: string;
    isDriver: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthError {
    message: string;
    code?: string;
    details?: string
}

export enum UserRole {
    DRIVER = 'DRIVER',
    USER = 'USER'
}