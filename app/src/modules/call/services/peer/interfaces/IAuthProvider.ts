export interface IAuthProvider {
  getUserId(): Promise<string>;
}
