import { useQuery } from '@tanstack/react-query';
import { loginWifiApi } from 'api/loginWifi.api';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

// ================== TYPES ==================
export interface PercentageUsageQuery {
  startDate?: string | Date;
  endDate?: string | Date;
  siteId?: string;
  adDataInput?: string;
}

export interface AverageUsageQuery {
  startDate?: string | Date;
  endDate?: string | Date;
  siteId?: string;
  adDataInput?: string;
}

export interface PercentageUsage {
  slot: string;
  percentage: number;
  avg_users_per_day: number;
}

export interface DataAverageUsage {
  total_users: number;
  avg_users_per_day: number;
}

// ================== HOOK ==================
const useHandleLoginWifiV2 = () => {
  const intl = useIntl();
  const showError = () => enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });

  // ====== Percentage Usage ======
  const usePercentageUsage = (query: PercentageUsageQuery, enabled = true) =>
    useQuery<PercentageUsage[], Error>({
      queryKey: ['percentage-usage', query],
      queryFn: async () => {
        const res = await loginWifiApi.percentageUsage(query);
        console.log({ res })
        if (!res.data || res.data.code !== 0) throw new Error('Failed to fetch percentage usage');
        return res.data.data ?? [];
      },
      enabled,
      refetchOnWindowFocus: true,
    });

  // ====== Average Usage ======
  const useAverageUsage = (query: AverageUsageQuery, enabled = true) =>
    useQuery<DataAverageUsage, Error>({
      queryKey: ['average-usage', query],
      queryFn: async () => {
        const res = await loginWifiApi.fetchDataAverageUsage(query);
        if (!res.data || res.data.code !== 0) throw new Error('Failed to fetch average usage');
        return res.data.data ?? { total_users: 0, avg_users_per_day: 0 };
      },
      enabled,
      meta: { onError: showError },
      refetchOnWindowFocus: true,

    });

  return {
    usePercentageUsage,
    useAverageUsage
  };
};

export default useHandleLoginWifiV2;
