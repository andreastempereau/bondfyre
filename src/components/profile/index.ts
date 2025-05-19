export * from "./ProfileHeader";
export { default as InterestTags } from "./InterestTags";
export * from "./ProfileEditForm";
// Replaced UnauthenticatedView with AuthScreen from app/auth
import { AuthScreen } from "../../../app/auth";
export { AuthScreen };

// Adding default export to prevent Expo Router from treating this as a route
export default {};
