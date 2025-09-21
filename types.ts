
export interface Subject {
  id: string;
  title: string;
  notes: string;
  imageUrls?: string[];
  createdAt: number;
  sortOrder: number;
}

export interface Topic {
  id: string;
  title: string;
  subjects: Subject[];
  createdAt: number;
  sortOrder: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
  createdAt: number;
  userEmail: string; // Added to associate course with a user
  sortOrder: number;
}

export interface User {
  email: string;
  username: string;
  profilePicture?: string | null;
  createdAt: number;
}