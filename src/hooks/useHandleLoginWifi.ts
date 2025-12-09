import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { loginWifiApi } from 'api/loginWifi.api';

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
interface LoginWifiProps {
  initQueryPercentageUsage?: PercentageUsageQuery;
  initQueryAverageUsage?: AverageUsageQuery;
}

const useHandleLoginWifi = ({ initQueryPercentageUsage, initQueryAverageUsage }: LoginWifiProps) => {
  const [data, setData] = useState<PercentageUsage[]>([]);
  const [averageUsageData, setAverageUsageData] = useState<DataAverageUsage>({ total_users: 0, avg_users_per_day: 0 });
  const [queryPercentageUsage, setQueryPercentageUsage] = useState<PercentageUsageQuery>(initQueryPercentageUsage || {});
  const [queryAverageUsage, setQueryAverageUsage] = useState<AverageUsageQuery>(initQueryAverageUsage || {});
  const [loadingPercentageUsage, setLoadingPercentageUsage] = useState<boolean>(false);
  const [loadingAverageUsage, setLoadingAverageUsage] = useState<boolean>(false);
  const intl = useIntl();

  const fetchPercentageUsage = async (newQuery?: PercentageUsageQuery) => {
    try {
      setLoadingPercentageUsage(true);
      const { data } = await loginWifiApi.percentageUsage(newQuery ?? queryPercentageUsage);
      setData(data?.data);
      return data?.data;
    } catch (err) {
      debugger
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoadingPercentageUsage(false);
    }
  };

  const fetchDataAverageUsage = async (newQuery?: PercentageUsageQuery) => {
    setLoadingAverageUsage(true);
    try {
      const { data } = await loginWifiApi.fetchDataAverageUsage(newQuery ?? queryAverageUsage);
      setAverageUsageData(data?.data);
      return data?.data;
    } catch (err) {
      debugger
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoadingAverageUsage(false);

    }
  };


  return {
    percentageUsage: data,
    averageUsageData,
    fetchPercentageUsage,
    fetchDataAverageUsage,
    queryPercentageUsage,
    queryAverageUsage,
    setQueryAverageUsage,
    setQueryPercentageUsage,
    setDataPercentageUsage: setData,
    loadingPercentageUsage,
    loadingAverageUsage,
  };
};

export default useHandleLoginWifi;
