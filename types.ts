export interface Topic {
  id: string;
  title: string;
  notes: string;
  imageUrls?: string[];
  createdAt: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
  createdAt: number;
  userEmail: string; // Added to associate course with a user
}

export interface User {
  email: string;
  username: string;
  profilePicture?: string | null;
  createdAt: number;
}