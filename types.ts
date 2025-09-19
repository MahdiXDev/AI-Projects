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
}

export interface User {
  email: string;
  username: string;
}
