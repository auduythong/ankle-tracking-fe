import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'utils/axios';
import { API_PATH_MANAGEMENT } from 'utils/constant';
import { formatDateFullTime } from 'utils/handleData';
import { loginWifiApi } from 'api/loginWifi.api';

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
  type?: 'wifi_access_activities' | 'user_browser_usage' | 'user_device_type' | 'user_os_type' | 'user_behavior' | 'visit_frequency';
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  siteId: string;
  adId?: number;
  adDataInput?: string;
}

export interface ParamsLoginCount {
  type?: 'access' | 'error' | 'login' | 'login_duplicate';
  siteId: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  adId?: number;
  adDataInput?: string;
}

export interface ParamsStartEndDate {
  startDate: string | Date;
  endDate: string | Date;
  adId?: number;
  adDataInput: string;
}

const useHandleDataLogin = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingActivitiesCampaign, setLoadingActivitiesCampaign] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, seTotalResults] = useState(10);

  const showError = () => {
    enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });
  };


  const fetchDataLogin = async (params: ParamsDataLogin) => {
    try {
      const { data } = await loginWifiApi.fetchDataLogin(params);
      if (data.code === 0) {
        setTotalPages(data.totalPages);
        seTotalResults(data.total);
        return data.data;
      } else {
        showError();
        return [];
      }
    } catch (error) {
      showError();
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataActivities = async (params: ParamsDataLogin) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_PATH_MANAGEMENT.dataActivities}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
        seTotalResults(res.data.total);
        const formattedDate = formatDateFullTime(res.data.data, ['created_date']);
        return formattedDate;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataChartLogin = async (params: ParamsChartLogin) => {
    try {
      const res = await axios.get(`${API_PATH_MANAGEMENT.chartLogin}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        return res.data.data;
      } else {
        return {};
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataLoginCount = async (params: ParamsLoginCount) => {
    try {
      const res = await axios.get(`${API_PATH_MANAGEMENT.dataLoginCount}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        return res.data.data;
      } else {
        return {};
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataTop3 = async (params: { siteId?: string; adId?: number; adDataInput?: string }) => {
    try {
      const res = await axios.get(`${API_PATH_MANAGEMENT.top3}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });

      if (res.data.code === 0) {
        return res.data.data;
      } else {
        return {};
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return {};
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataActivitiesCampaign = async (params: ParamsStartEndDate) => {
    setLoadingActivitiesCampaign(true)
    try {
      const res = await axios.get(`${API_PATH_MANAGEMENT.campaignActivities}`, {
        headers: { Authorization: accessToken },
        params: {
          ...params
        }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
        return res.data.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return [];
      }
    } catch (error) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoadingActivitiesCampaign(false);
    }
  };

  return {
    isLoading,
    loadingActivitiesCampaign,
    totalPages,
    totalResults,
    fetchDataLogin,
    fetchDataChartLogin,
    fetchDataLoginCount,
    fetchDataActivities,
    fetchDataTop3,
    fetchDataActivitiesCampaign
  };
};

export default useHandleDataLogin;
