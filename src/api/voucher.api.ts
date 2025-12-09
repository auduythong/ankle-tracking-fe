import { AxiosPromise } from 'axios';
import axiosServices from 'utils/axios';

/**
 * Voucher Group Management APIs
 */
export const voucherApi = {
  // Existing APIs
  findAllGroup: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/data_vouchers',
      params
    }),
  findAllDetails: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/data_vouchers_details',
      params
    }),
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/add_voucher',
      data,
      method: 'post'
    }),
  update: (params: any, data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/edit_voucher',
      data,
      method: 'post',
      params
    }),
  delete: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/delete_voucher',
      method: 'post',
      params
    }),
  refresh: (): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/refresh_voucher',
      method: 'post'
    }),

  // Additional APIs
  getVoucherDetails: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/data_voucher_details',
      params,
      method: 'get'
    }),
  scanSummary: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/scan_voucher_summary',
      data,
      method: 'post'
    }),
  verifyCode: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/verify_voucher_code',
      data,
      method: 'post'
    })
};

/**
 * Agent Voucher Management APIs
 */
export const agentVoucherApi = {
  getVouchers: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/data_vouchers',
      params,
      method: 'get'
    }),
  getVoucherDetails: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/data_voucher_details',
      params,
      method: 'get'
    }),
  addVoucher: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/add_voucher',
      data,
      method: 'post'
    }),
  editVoucher: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/edit_voucher',
      data,
      method: 'post'
    }),
  updateStatus: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/update_voucher_status',
      data,
      method: 'post'
    }),
  getStatistics: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/voucher_statistics',
      params,
      method: 'get'
    })
};

/**
 * Premium Order APIs (using agent APIs as fallback)
 */
export const premiumOrderApi = {
  getOrders: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/data_vouchers',
      params,
      method: 'get'
    }),
  createOrder: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/add_voucher',
      data,
      method: 'post'
    }),
  updateOrderStatus: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/update_voucher_status',
      data,
      method: 'post'
    }),
  getOrderDetails: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/data_voucher_details',
      params,
      method: 'get'
    }),
  getStatistics: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: '/v1/voucher_management/agent/voucher_statistics',
      params,
      method: 'get'
    })
};
