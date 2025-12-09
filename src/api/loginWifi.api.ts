import { AxiosPromise } from 'axios';
import axiosServices from 'utils/axios';
import { API_PATH_MANAGEMENT } from 'utils/constant';

export const loginWifiApi = {
  percentageUsage: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/login_wifi/percentage_usage_hour',
      params
    }),
  fetchDataAverageUsage: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/login_wifi/data_average_usage',
      params
    }),
  fetchDataLogin: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_MANAGEMENT.dataLogin,
      params
    }),

  fetchDataActivities: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_MANAGEMENT.dataActivities,
      params
    }),

  fetchDataChartLogin: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_MANAGEMENT.chartLogin,
      params
    }),

  fetchDataLoginCount: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_MANAGEMENT.dataLoginCount,
      params
    }),

  fetchDataTop3: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_MANAGEMENT.top3,
      params
    }),

  fetchDataActivitiesCampaign: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_MANAGEMENT.campaignActivities,
      params
    })

};
