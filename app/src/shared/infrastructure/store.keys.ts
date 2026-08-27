export const STORE_KEYS = {
  // session
  userId: "user_id",
  partnerId: "partner_id",
  partnerName: "partner_name",
  connectionId: "connection_id",
  connectionRequestLink: "connection_request_link",
  // devices
  selectedMicId: "selectedMicId",
  selectedSpeakerId: "selectedSpeakerId",
  // settings
  theme: "theme",
  themeColor: "themeColor",
  windowBehavior: "window_behavior",
  compactWindowSize: "compactWindowSize",
  compactMode: "compactMode",
  windowControlsPosition: "windowControlsPosition",
  sectionLayout: "sectionLayout",
  hiddenSections: "hiddenSections",
  dateFormat: "dateFormat",
  clockFormat: "clockFormat",
  weatherBorder: "weatherBorder",
  weatherIconColor: "weatherIconColor",
  // onboarding
  firstLaunch: "firstLaunch",
  introductionCompleted: "introduction_completed",
} as const;

export type StoreKey = (typeof STORE_KEYS)[keyof typeof STORE_KEYS];

/**
 * Tipo persistido por clave. El provider tipado (`IStorageProvider`) lo usa
 * para devolver el tipo correcto por clave; las claves del dominio
 * (ThemeType, Behavior...) se validan/castean en su repository.
 */
export interface StoreValueMap {
  user_id: string;
  partner_id: string;
  partner_name: string;
  connection_id: string;
  connection_request_link: string;
  selectedMicId: string;
  selectedSpeakerId: string;
  theme: string;
  themeColor: string;
  window_behavior: string;
  compactWindowSize: { width: number; height: number };
  compactMode: boolean;
  windowControlsPosition: string;
  sectionLayout: { left: string[]; right: string[] };
  hiddenSections: string[];
  dateFormat: string;
  clockFormat: string;
  weatherBorder: boolean;
  weatherIconColor: string;
  firstLaunch: boolean;
  introduction_completed: boolean;
}
