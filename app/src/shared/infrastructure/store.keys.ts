export const STORE_KEYS = {
  userId: "user_id",
  partnerId: "partner_id",
  partnerName: "partner_name",
  connectionId: "connection_id",
  connectionRequestLink: "connection_request_link",
  selectedMicId: "selectedMicId",
  selectedSpeakerId: "selectedSpeakerId",
  windowBehavior: "window_behavior",
  firstLaunch: "firstLaunch",
} as const;

export type StoreKey = (typeof STORE_KEYS)[keyof typeof STORE_KEYS];
