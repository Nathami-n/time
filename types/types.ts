export type ApiResponseType = {
  success: boolean;
  error: string | null;
};

export const enum PossibleUsers {
  STUDENT = "student",
  STAFF = "staff",
  ADMIN = "admin",
}

export type AuthUserType = {
  name: string;
  email: string;
  userId: string;
  role: string;
};
