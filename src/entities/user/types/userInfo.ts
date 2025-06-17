export interface UserInfo {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  profileImg: string;
}
