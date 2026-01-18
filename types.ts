
export enum Language {
  EN = 'en',
  KN = 'kn',
}

export enum ReportType {
  Emergency = 'emergency',
  Abuse = 'abuse',
  MissingPet = 'missing_pet',
  FoundPet = 'found_pet',
  Sterilization = 'sterilization',
}

export interface Case {
  _id: string; // Changed from 'id' to match MongoDB's default
  type: ReportType;
  description: string;
  location: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  submittedAt: string;
  reporterName: string;
  reporterPhone: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  coordinates: { latitude: number; longitude: number };
  aiPriority: 'High' | 'Medium' | 'Low' | 'Manual Review';
  aiJustification: string;
}

export interface Volunteer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  interests: string[];
  registeredAt: string;
}

export interface Ward {
    id: string;
    name: string;
    risk: 'high' | 'moderate' | 'low' | 'safe';
}

export interface AdoptionAnimal {
    id: string;
    name: string;
    age: string;
    breed: string;
    imageUrl: string;
    description: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  image_query: string;
  imageUrl?: string;
}