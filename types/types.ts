export type ApiResponseType = {
  success: boolean;
  error: string | null;
};

export const enum PossibleUsers {
    STUDENT = "student",
    STAFF = "staff",
    ADMIN = "admin"
}