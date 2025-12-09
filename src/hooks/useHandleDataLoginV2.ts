import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { loginWifiApi } from 'api/loginWifi.api';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { formatDateFullTime } from 'utils/handleData';

export interface ActivitiesCampaignData {
  click_count: number
  ctr_count: number
  impression_count: number
  unique_user_count: number
}


interface Metric {
  date: string;
  clicks?: number;
  impressions?: number;
  new_users?: number;
}

export interface Top3Data {
  clicks: Metric[];
  impressions: Metric[];
  new_customers: Metric[];
}
export interface ParamsDataLogin {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId: string;
  adId?: number;
  adDataInput: string;
}

export interface ParamsChartLogin {
  type: 'wifi_access_activities' | 'user_browser_usage' | 'user_device_type' | 'user_os_type' | 'user_behavior' | 'visit_frequency';
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adId?: number;
  adDataInput?: string;
}

export interface ParamsLoginCount {
  type: 'access' | 'error' | 'login' | 'login_duplicate';
  siteId: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  adId?: number;
  adDataInput?: string;
}

export interface ParamsActivitiesCampaign {
  startDate: string | Date;
  endDate: string | Date;
  adId?: number;
  adDataInput: string;
}

const useHandleDataLoginV2 = () => {
  const intl = useIntl();
  const showError = () => {
    enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });
  };

  // --- LOGIN LIST ---
  const useDataLogin = (params: ParamsDataLogin, enabled = true) =>
    useQuery({
      queryKey: ['dataLogin', params],
      queryFn: async () => {
        const { data } = await loginWifiApi.fetchDataLogin(params);
        if (data.code !== 0) throw new Error('Fetch failed');
        return { list: data.data, total: data.total, totalPages: data.totalPages };
      },
      enabled,
      staleTime: 1000 * 60, // 1 phút
      meta: { onError: showError },
      refetchOnWindowFocus: true,
    });

  // --- ACTIVITIES ---
  const useDataActivities = (params: ParamsDataLogin, enabled = true) =>
    useQuery({
      queryKey: ['dataActivities', params],
      queryFn: async () => {
        const { data } = await loginWifiApi.fetchDataActivities(params);
        if (data.code !== 0) throw new Error('Fetch failed');
        const formatted = formatDateFullTime(data.data, ['created_date']);
        return { list: formatted, total: data.total, totalPages: data.totalPages };
      },
      staleTime: 0,
      enabled,
      meta: { onError: showError },
      refetchOnWindowFocus: true,
    });

  // --- CHART ---
  const useChartLogin = <T = any[]>(params: ParamsChartLogin, enabled = true): UseQueryResult<T, Error> =>
    useQuery({
      queryKey: ['chartLogin', params],
      queryFn: async () => {
        const { data } = await loginWifiApi.fetchDataChartLogin(params);
        if (data.code !== 0) throw new Error('Fetch failed');
        return data.data;
      },
      staleTime: 0,
      enabled,
      meta: { onError: showError },
      refetchOnWindowFocus: true,

    });

  // --- COUNT ---
  const useLoginCount = (params: ParamsLoginCount, enabled = true) =>
    useQuery({
      queryKey: ['loginCount', params],
      queryFn: async () => {
        const { data } = await loginWifiApi.fetchDataLoginCount(params);
        if (data.code !== 0) throw new Error('Fetch failed');
        return data.data;
      },
      staleTime: 0,
      enabled,
      meta: { onError: showError },
      refetchOnWindowFocus: true,
    });

  // --- TOP3 ---
  const useTop3 = (params: { siteId?: string; adId?: number; adDataInput?: string }, enabled = true) =>
    useQuery<Top3Data, Error>({
      queryKey: ['top3', params],
      queryFn: async () => {
        const { data } = await loginWifiApi.fetchDataTop3(params);
        if (data.code !== 0) throw new Error('Fetch failed');
        return data.data;
      },
      enabled,
      staleTime: 0,
      meta: { onError: showError },
      refetchOnWindowFocus: true,
    });

  // --- ACTIVITIES CAMPAIGN ---
  const useActivitiesCampaign = (params: ParamsActivitiesCampaign, enabled = true) =>
    useQuery<ActivitiesCampaignData, Error>({
      queryKey: ['activitiesCampaign', params],
      queryFn: async () => {
        const { data } = await loginWifiApi.fetchDataActivitiesCampaign(params);
        if (data.code !== 0) throw new Error('Fetch failed');
        return data.data;
      },
      enabled,
      staleTime: 0,
      meta: { onError: showError },
      refetchOnWindowFocus: true,
      refetchInterval: 1000 * 15,
    });

  return {
    useDataLogin,
    useDataActivities,
    useChartLogin,
    useLoginCount,
    useTop3,
    useActivitiesCampaign
  };
};

export default useHandleDataLoginV2;
