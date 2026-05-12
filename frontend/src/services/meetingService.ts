import api from "@/lib/axios";
import type {
  Meeting, MeetingListResponse, Summary,
  CreateMeetingInput, MeetingFilters, MeetingStatistics,
} from "@/types";

export const meetingService = {
  list: async (filters: MeetingFilters = {}): Promise<MeetingListResponse> => {
    const res = await api.get<MeetingListResponse>("/api/meet/meetings/", { params: filters });
    return res.data;
  },

  get: async (id: number): Promise<Meeting> => {
    const res = await api.get<Meeting>(`/api/meet/meetings/${id}/`);
    return res.data;
  },

  create: async (data: CreateMeetingInput): Promise<Meeting> => {
    const res = await api.post<Meeting>("/api/meet/meetings/", data);
    return res.data;
  },

  update: async (id: number, data: Partial<CreateMeetingInput>): Promise<Meeting> => {
    const res = await api.put<Meeting>(`/api/meet/meetings/${id}/`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/meet/meetings/${id}/`);
  },

  getSummary: async (id: number): Promise<Summary> => {
    const res = await api.get<Summary>(`/api/meet/meetings/${id}/summary/`);
    return res.data;
  },

  generateSummary: async (id: number): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>(`/api/meet/meetings/${id}/generate-summary/`);
    return res.data;
  },

  getStatistics: async (): Promise<MeetingStatistics> => {
    const res = await api.get<MeetingStatistics>("/api/meet/meetings/statistics/");
    return res.data;
  },
};
