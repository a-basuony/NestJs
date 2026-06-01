import { UserType } from './enums';

export type JWTPayloadType = {
  id: number;
  userType: UserType;
};

export type AccessTokenType = {
  accessToken: string;
};

export type ReviewResponse = {
  id: number;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    username: string;
  };
};
