export interface IAuthProvider {
  getUserId(): Promise<string>;
  getAccessToken(): Promise<string>;
}
