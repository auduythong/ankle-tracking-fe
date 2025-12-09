import { AxiosPromise } from 'axios';
import axiosServices from 'utils/axios';

export const passpointApi = {
  findAll: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/passpoint_management/data_passpoint',
      params
    }),
  downloadXml: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/passpoint_management/download_passpoint',
      params,
      responseType: 'blob'
    }),
  downloadPublic: (params?: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/passpoint_management/public/download',
      params,
      responseType: 'blob'
    }),
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/passpoint_management/generate',
      data,
      method: 'post'
    }),
  update: (params: any, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/passpoint_management/edit_passpoint`,
      method: 'post',
      params,
      data
    }),
  delete: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/passpoint_management/delete_passpoint`,
      method: 'post',
      params
    })
};
