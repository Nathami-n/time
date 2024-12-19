export type ApiResponseType = {
  success: boolean;
  error: string | null;
};

export const enum PossibleUsers {
  STUDENT = "student",
  STAFF = "teacher",
  ADMIN = "admin",
}

export type AuthUserType = {
  name: string;
  email: string;
  userId: string;
  role: string;
};
