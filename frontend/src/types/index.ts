export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  credits: number;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface Meeting {
  id: number;
  user_email: string;
  title: string;
  transcript: string;
  duration_minutes: number | null;
  word_count: number;
  status: "pending" | "processing" | "completed" | "failed";
  status_display: string;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Meeting[];
}

export interface ActionItem {
  task: string;
  owner: string;
}

export interface Summary {
  id: number;
  content: string;
  short_summary: string;
  decisions: string[];
  action_items: ActionItem[];
  key_points: string[];
  attendees: string[];
  sentiment_score: number;
  confidence_score: number;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
}

export interface MeetingStatistics {
  total_meetings: number;
  completed_meetings: number;
  processing_meetings: number;
  failed_meetings: number;
  credits_used: number;
  credits_remaining: number;
  meetings_this_month: number;
}

export interface CreateMeetingInput {
  title: string;
  transcript: string;
  duration_minutes?: number;
}

export interface MeetingFilters {
  page?: number;
  status?: string;
  search?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface ChangePasswordInput {
  old_password: string;
  new_password: string;
}

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}
