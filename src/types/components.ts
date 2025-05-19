import { ReactNode } from "react";
import { ViewStyle, TextStyle, TouchableOpacityProps } from "react-native";
import { Group, Member } from "./entities";

/**
 * Group components props
 */
export interface GroupCardProps {
  group: Group;
  onPress: (group: Group) => void;
  onLeaveGroup: (groupId: string) => void;
}

export interface GroupListProps {
  groups: Group[];
  onGroupPress: (group: Group) => void;
  onLeaveGroup: (groupId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  maxGroups?: number;
}

export interface JoinGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupJoined?: () => void;
  userGroupsCount?: number;
  maxGroups?: number;
}

export interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
  userGroupsCount: number;
  maxGroups: number;
}

export interface GroupEmptyStateProps {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

export interface InviteCodeCardProps {
  inviteCode: string;
  onCopy: () => void;
}

export interface GroupHeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: ReactNode;
}

export interface GroupSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  onLeave: () => void;
  onUpdate: (updates: Partial<Group>) => void;
  isCreator: boolean;
}

export interface GroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
}

/**
 * Discover components props
 */
export interface DiscoverMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  image: string;
}

export interface GroupProfile {
  id: string;
  name: string;
  members: DiscoverMember[];
  bio: string;
  interests: string[];
  photos: string[];
  // Additional discovery data
  relevanceScore?: number;
  matchingInterests?: string[];
  mutualConnections?: number;
  isGroupConnection?: boolean;
}

export interface SwipeCardProps {
  profile: GroupProfile;
  currentPhotoIndex: number;
  onPhotoPress: () => void;
  onGestureEvent: any;
  onHandlerStateChange: any;
  cardStyle: any;
}

export interface MatchProfileInfoProps {
  profile: GroupProfile;
}

export interface ActionButtonsProps {
  onSwipe: (direction: "left" | "right") => void;
}

export interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: string;
}

/**
 * UI Component props
 */
export interface HapticTabProps {
  onPress: () => void;
  hapticType?:
    | "light"
    | "medium"
    | "heavy"
    | "success"
    | "warning"
    | "error"
    | "none";
  style?: ViewStyle;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export interface CardProps {
  variant?: "elevated" | "outlined" | "filled";
  elevation?: "none" | "sm" | "md" | "lg" | "xl";
  radius?: string | number;
  padding?: string | number;
}

export interface HelloWaveProps {
  size?: number;
  color?: string;
  duration?: number;
}

export interface ExternalLinkProps {
  url?: string;
  text?: string;
  href?: string;
  icon?: boolean;
  color?: string;
  children?: React.ReactNode;
}

/**
 * Profile components props
 */
export interface InterestTagsProps {
  interests: string[];
}

export interface ProfileHeaderProps {
  user: any;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

// Adding default export to prevent Expo Router from treating this as a route
export default {};
