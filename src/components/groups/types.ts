import { ReactNode } from "react";
import {
  CreateGroupModalProps,
  GroupCardProps,
  GroupEmptyStateProps,
  GroupHeaderProps,
  GroupListProps,
  InviteCodeCardProps,
  JoinGroupModalProps,
} from "../../types/components";

// Re-export types from centralized types
export type {
  CreateGroupModalProps,
  GroupCardProps,
  GroupEmptyStateProps,
  GroupHeaderProps,
  GroupListProps,
  InviteCodeCardProps,
  JoinGroupModalProps,
};

// Adding default export to prevent Expo Router from treating this as a route
export default {};
