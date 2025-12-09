import { AxiosPromise } from 'axios';
import axiosServices from 'utils/axios';
import { API_PATH_SSID } from 'utils/constant';

export const ssidApi = {
  // ===========================
  // CREATE SSID
  // ===========================
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/ssid_management/create_advanced_ssid',
      method: 'post',
      data
    }),

  // ===========================
  // EDIT SSID
  // ===========================
  edit: (id: number, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/ssid_management/edit_advanced_ssid`,
      method: 'post',
      data,
      params: { id }
    }),

  // ===========================
  // DELETE SSID
  // ===========================
  delete: (params: { id: number }): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/ssid_management/delete_advanced_ssid`,
      method: 'post',
      params
    }),

  // ===========================
  // GET LIST SSID
  // ===========================
  getSSID: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SSID.dataSSID,
      method: 'get',
      params
    }),

  // ===========================
  // REFRESH SSID
  // ===========================
  refresh: (wlanId: string): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/ssid_management/refresh_ssid`,
      method: 'post',
      params: { wlanId }
    })
};
