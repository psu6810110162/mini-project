// src/types.ts

export interface IUser {
  id: number;
  username: string;
  role: string; 
}

export interface Device {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
  greenhouseId?: number;
}

export interface Greenhouse {
  id: number;
  name: string;
  description?: string;
  temp: number;
  humidity: number;
  light?: number;
  devices: Device[];
  users: IUser[]; 
}