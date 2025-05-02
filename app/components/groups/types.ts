import { ReactNode } from "react";

export interface Member {
  _id: string;
  name: string;
  photos: string[];
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  bio?: string;
  members: Member[];
  interests: string[];
  isPrivate: boolean;
  maxMembers: number;
  creator: string;
  inviteCode: string;
  photos?: string[];
}
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
