import { AxiosPromise } from 'axios';
import axiosServices from 'utils/axios';
import { API_PATH_SITES } from 'utils/constant';

export const siteApi = {
  // ===========================
  // GET LIST SITES
  // ===========================
  getSites: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.dataSites,
      method: 'get',
      params
    }),

  // ===========================
  // GET LIST SCENARIO
  // ===========================
  getScenario: (params: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.dataScenario,
      method: 'get',
      params
    }),

  // ===========================
  // CREATE SITE
  // ===========================
  create: (data: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.addSite,
      method: 'post',
      data
    }),

  // ===========================
  // EDIT SITE
  // ===========================
  edit: (id: string, data: any): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.editSite,
      method: 'post',
      data,
      params: { id }
    }),

  // ===========================
  // DELETE SITE
  // ===========================
  delete: (params: { id: string }): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.deleteSite,
      method: 'post',
      params
    }),

  // ===========================
  // REFRESH SITE
  // ===========================
  refresh: (regionId?: string): AxiosPromise<any> =>
    axiosServices({
      url: API_PATH_SITES.refresh,
      method: 'post',
      params: regionId ? { regionId } : {}
    })
};
