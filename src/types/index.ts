// User and Auth Types
export type UserRole = 'voter' | 'candidate' | 'admin';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  studentId?: string;
  role: UserRole;
  avatarUrl?: string;
  hasVoted?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Candidate Types
export interface Candidate {
  _id?: string;
  id: string;
  name: string;
  party?: string;
  imageUrl?: string;
  manifesto?: string;
  voteCount?: number;
}

// Voting Types
export interface Vote {
  id: string;
  voterId: string;
  candidateId: string | null;
  reason?: string;
  timestamp: string;
  imageHash?: string;
}

export interface VoteReceipt {
  voteId: string;
  timestamp: string;
  imageHash?: string;
}

// Registration Types
export interface RegistrationData {
  name: string;
  studentId: string;
  email?: string;
  phone?: string;
  role: 'voter';
  image: string;
  imageHash: string;
}

// Results Types
export interface ElectionResults {
  candidates: CandidateResult[];
  totalVotes: number;
  abstainVotes: number;
  publishedAt?: string;
  isPublished: boolean;
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  party?: string;
  voteCount: number;
  percentage: number;
}

// Admin Types
export interface VoterRecord {
  id: string;
  name: string;
  studentId: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  imageHash?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  hasVoted: boolean;
  registeredAt: string;
  verifiedAt?: string;
}

export interface DashboardStats {
  totalRegistered: number;
  totalVerified: number;
  totalPending: number;
  totalVotesCast: number;
  totalCandidates: number;
  resultsPublished: boolean;
}

export interface ElectionConfig {
  _id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  updatedAt?: string;
}
