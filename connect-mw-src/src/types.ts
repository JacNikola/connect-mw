export interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  team: string;
  location: string;
  bio: string;
  interests: string[];
  joined: number;
  hue: number;
  photo?: string;
  pronouns?: string;
}

export type Visibility = 'everyone' | 'connections';

export interface Settings {
  participating: boolean;
  visibility: Visibility;
  showLocation: boolean;
  surprise: boolean;
  allowRequests: boolean;
}

export type ConnStatus = 'incoming' | 'outgoing' | 'connected';

export interface Connection {
  status: ConnStatus;
  at: number;
  note?: string;
  surprise?: boolean;
}

export type EventMode = 'In person' | 'Virtual' | 'Hybrid';

export interface EventItem {
  id: string;
  title: string;
  communityId: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  endTime: string;
  location: string;
  city: string;
  mode: EventMode;
  description: string;
  capacity: number;
  hostId: string;
  attendees: string[];
}

export interface Community {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  tags: string[];
  schedule: string;
  leadId: string;
  gradient: string;
}

export interface Account {
  email: string;
  name: string;
  title: string;
  department: string;
  location: string;
  passHash: string;
  createdAt: number;
}

export interface CoffeeChat {
  id: string;
  withId: string;
  date: string;
  time: string;
  mode: 'In person' | 'Virtual';
  place: string;
  note: string;
  status: 'proposed' | 'confirmed';
  createdAt: number;
}

export interface Report {
  id: string;
  targetId: string;
  reason: string;
  details: string;
  at: number;
}

export interface AppState {
  version: 1;
  onboarded: boolean;
  me: Employee;
  settings: Settings;
  connections: Record<string, Connection>;
  /** Incoming requests newer than this timestamp count as unseen notifications. */
  requestsSeenAt: number;
  communities: Community[];
  joined: string[];
  events: EventItem[];
  registered: string[];
  coffee: CoffeeChat[];
  blocked: string[];
  reports: Report[];
}
