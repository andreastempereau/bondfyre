import {
  DiscoverMember,
  GroupProfile,
  SwipeCardProps,
  ActionButtonsProps,
  MatchProfileInfoProps,
  EmptyStateProps,
} from "../../types/components";

// Re-export types from centralized types
export type {
  DiscoverMember,
  GroupProfile,
  SwipeCardProps,
  ActionButtonsProps,
  MatchProfileInfoProps,
  EmptyStateProps,
};

// Re-export the SwipeDirection type
export type { SwipeDirection } from "../../types/entities";

// Adding default export to prevent Expo Router from treating this as a route
export default {};
