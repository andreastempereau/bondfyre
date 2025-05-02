// Export all group components
export { default as GroupCard } from "./GroupCard";
export { default as GroupList } from "./GroupList";
export { default as GroupEmptyState } from "./GroupEmptyState";
export { default as InviteCodeCard } from "./InviteCodeCard";
export { default as JoinGroupModal } from "./JoinGroupModal";
export { default as CreateGroupModal } from "./CreateGroupModal";
export { default as GroupsLoadingState } from "./GroupsLoadingState";
export { default as GroupHeader } from "./GroupHeader";

// Explicitly define and export the Group interface to avoid circular dependencies
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
