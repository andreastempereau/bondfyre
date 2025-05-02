export interface Member {
  id: string;
  name: string;
  age: number;
  gender: string;
  image: string;
}

export interface GroupProfile {
  id: string;
  name: string;
  members: Member[];
  bio: string;
  interests: string[];
  photos: string[];
}

export type SwipeDirection = "left" | "right";
