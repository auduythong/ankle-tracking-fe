import { AxiosPromise } from 'axios';
import axiosServices from 'utils/axios';

export const orderApi = {
  findAll: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/order_management/data_orders',
      params
    }),
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/order_management/add_order',
      data,
      method: "post"
    }),
  update: (id: number, data: any): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/order_management/${id}`,
      data,
      method: "patch"
    }),
  resetToken: (id: number): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/order_management/${id}/regenerate-token`,
      method: "post"
    }),
  delete: (id: number): AxiosPromise<any> =>
    axiosServices({
      url: `/v1/order_management/${id}`,
      method: "delete"
    })
};
