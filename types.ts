export interface Topic {
  id: string;
  title: string;
  notes: string;
  imageUrl?: string;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}