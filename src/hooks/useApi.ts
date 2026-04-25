import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  apiClient,
  profilesApi,
  recordsApi,
  ocrApi,
  limsApi,
} from '../api/client';

export interface ProfilePayload {
  full_name: string;
  relationship: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  contact_phone?: string;
}

// Profiles hooks
export function useProfiles(enabled: boolean = true) {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await profilesApi.list();
      return response.data;
    },
    enabled,
    retry: false,
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: async () => {
      const response = await profilesApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProfilePayload) => profilesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProfilePayload> }) => profilesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profilesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// Records hooks
export function useRecords(
  profileId: string,
  params?: {
    search?: string;
    status?: string;
    record_type?: string;
    source?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    page_size?: number;
    sort_by?: 'date' | 'display_id' | 'status' | 'source' | 'type';
    sort_order?: 'asc' | 'desc';
  },
  options?: {
    refetchIntervalMs?: number;
  }
) {
  return useQuery({
    queryKey: ['records', profileId, params],
    queryFn: async () => {
      const response = await recordsApi.listByProfile(profileId, params);
      return response.data;
    },
    enabled: !!profileId,
    refetchInterval: options?.refetchIntervalMs,
  });
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: ['records', id],
    queryFn: async () => {
      const response = await recordsApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUploadRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => recordsApi.upload(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
}

// OCR hooks
export function useExtractOCR() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recordId: string) => ocrApi.extract(recordId),
    onSuccess: (_, recordId) => {
      queryClient.invalidateQueries({ queryKey: ['records', recordId] });
    },
  });
}

export function useConfirmOCR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recordId,
      payload,
    }: {
      recordId: string;
      payload: {
        title?: string;
        record_type?: string;
        issued_date?: string;
        source_facility?: string;
        source_doctor?: string;
        confirmed_tags: string[];
      };
    }) => ocrApi.confirm(recordId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['records', variables.recordId] });
    },
  });
}

// Lightweight request hook used by some feature components
export function useApi() {
  const request = async (
    url: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: unknown;
      headers?: Record<string, string>;
    }
  ) => {
    const response = await apiClient.request({
      url,
      method: options?.method || 'GET',
      data: options?.body,
      headers: options?.headers,
    });
    return response.data;
  };

  return { request };
}

export function useAnalyteHistory(profileId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['analyteHistory', profileId],
    queryFn: async () => {
      const response = await limsApi.getAnalyteHistory(profileId || undefined);
      return response.data;
    },
    enabled: enabled && typeof profileId !== 'undefined',
  });
}
