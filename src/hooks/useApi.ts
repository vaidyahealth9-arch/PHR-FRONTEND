import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi, recordsApi, medicationsApi, ocrApi } from '../api/client';

// Profiles hooks
export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await profilesApi.list();
      return response.data;
    },
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
    mutationFn: (data: any) => profilesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

// Records hooks
export function useRecords(profileId: string, recordType?: string) {
  return useQuery({
    queryKey: ['records', profileId, recordType],
    queryFn: async () => {
      const response = await recordsApi.listByProfile(profileId, recordType);
      return response.data;
    },
    enabled: !!profileId,
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

// Medications hooks
export function useMedications(profileId: string, activeOnly: boolean = true) {
  return useQuery({
    queryKey: ['medications', profileId, activeOnly],
    queryFn: async () => {
      const response = await medicationsApi.list(profileId, activeOnly);
      return response.data;
    },
    enabled: !!profileId,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => medicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
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
