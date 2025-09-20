export interface UserPayload {
  id: number;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: UserPayload;
}
