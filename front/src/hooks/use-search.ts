import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const useSearchBuses = (params: { from_city: string; to_city: string; journey_date: string }) => {
  return useQuery({
    queryKey: ['search-buses', params],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/search-buses`, { params });
      return response.data;
    },
    enabled: !!(params.from_city && params.to_city && params.journey_date),
  });
};

export const useScheduleSeats = (scheduleId: number | null) => {
  return useQuery({
    queryKey: ['schedule-seats', scheduleId],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/seats/${scheduleId}`);
      return response.data;
    },
    enabled: !!scheduleId,
  });
};

export const useSearchCities = () => {
  return useQuery({
    queryKey: ['search-cities'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/cities`);
      return response.data;
    },
  });
};

export const usePopularRoutes = () => {
  return useQuery({
    queryKey: ['popular-routes'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/popular-routes`);
      return response.data;
    },
  });
};

export const useTopBuses = () => {
  return useQuery({
    queryKey: ['top-buses'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/top-buses`);
      return response.data;
    },
  });
};

export const usePublicBuses = () => {
  return useQuery({
    queryKey: ['public-buses'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/public-buses`);
      return response.data;
    },
  });
};

export const useScheduleDetails = (id: number | string | undefined) => {
  return useQuery({
    queryKey: ['schedule-details', id],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/schedules/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
