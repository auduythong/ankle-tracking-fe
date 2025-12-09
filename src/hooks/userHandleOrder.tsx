import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'utils/axios';
import { API_PATH_ORDER_PREMIUM } from 'utils/constant';

//types
import { formatDate } from 'utils/handleData';

interface paramsGetOrderChart {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId: string;
  startDate?: string;
  endDate?: string;
  // siteDataInput: string;
}

interface paramsGetChartOrders {
  type: string;
  startDate?: string;
  endDate?: string;
}
// interface paramsPostVouchers {
//   id?: number;
// }

const useHandleOrders = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotaResults] = useState(0);

  const fetchDataOrderList = async (params: paramsGetOrderChart) => {
    try {
      const res = await axios.get(`${API_PATH_ORDER_PREMIUM.dataOrderList}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.data.totalPages);
        setTotaResults(res.data.data.total);

        const formattedDate = formatDate(res.data.data.data, ['expired_date']);
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

  const fetchDataChartOrders = async (params: paramsGetChartOrders) => {
    try {
      const res = await axios.get(`${API_PATH_ORDER_PREMIUM.dataChartOrder}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
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
      setIsLoading(false);
    }
  };

  //   const handleAddVoucherGroup = async (dataBody: NewVoucherGroup) => {
  //     try {
  //       const res = await axios.post(
  //         `${API_PATH_VOUCHER_GROUP.addVoucherGroup}`,
  //         {
  //           ...dataBody
  //         },
  //         {
  //           headers: { Authorization: accessToken }
  //         }
  //       );
  //       if (res.data.code === 0) {
  //         enqueueSnackbar(intl.formatMessage({ id: 'add-voucher-successfully' }), {
  //           variant: 'success'
  //         });
  //         return res.data;
  //       } else {
  //         enqueueSnackbar(intl.formatMessage({ id: 'add-failed' }), {
  //           variant: 'error'
  //         });
  //         return res.data;
  //       }
  //     } catch {
  //       enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
  //         variant: 'error'
  //       });
  //     }
  //   };

  //   const handleEditVoucherGroup = async (dataBody: NewVoucherGroup) => {
  //     try {
  //       const res = await axios.post(
  //         `${API_PATH_VOUCHER_GROUP.editVoucherGroup}`,
  //         {
  //           ...dataBody
  //         },
  //         {
  //           headers: { Authorization: accessToken },
  //           params: { id: dataBody.id }
  //         }
  //       );
  //       if (res.data.code === 0) {
  //         enqueueSnackbar(intl.formatMessage({ id: 'edit-voucher-successfully' }), {
  //           variant: 'success'
  //         });
  //         return res.data;
  //       } else {
  //         enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), {
  //           variant: 'error'
  //         });
  //         return res.data;
  //       }
  //     } catch {
  //       enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
  //         variant: 'error'
  //       });
  //     }
  //   };

  //   const handleDeleteVoucherGroup = async (params: paramsPostVouchers, isDelete: boolean) => {
  //     if (params.id && isDelete) {
  //       try {
  //         const res = await axios.post(
  //           `${API_PATH_VOUCHER_GROUP.deleteVoucherGroup}`,
  //           {},
  //           {
  //             headers: { Authorization: accessToken },
  //             params: { ...params }
  //           }
  //         );
  //         if (res.data.code === 0) {
  //           enqueueSnackbar(intl.formatMessage({ id: 'delete-voucher-successfully' }), {
  //             variant: 'success'
  //           });
  //           return res.data;
  //         } else {
  //           enqueueSnackbar(intl.formatMessage({ id: 'delete-failed' }), {
  //             variant: 'error'
  //           });
  //           return res.data;
  //         }
  //       } catch {
  //         enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
  //           variant: 'error'
  //         });
  //       }
  //     }
  //   };

  return {
    isLoading,
    totalPages,
    totalResults,
    fetchDataOrderList,
    // handleAddVoucherGroup,
    // handleEditVoucherGroup,
    // handleDeleteVoucherGroup,
    fetchDataChartOrders
  };
};

export default useHandleOrders;
