export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}