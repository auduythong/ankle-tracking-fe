import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { QueryParam } from 'types/query';
import { premiumOrderApi } from 'api/voucher.api';
import { Order } from 'types/order';

export interface WifiOrderQuery extends QueryParam {
  filters: string
}

interface WifiOrderProps {
  initQuery: WifiOrderQuery;
}

const useHandleWifiOrder = ({ initQuery }: WifiOrderProps) => {
  const [data, setData] = useState<Order[]>([]);
  const [query, setQuery] = useState<WifiOrderQuery>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();

  const fetchWifiOrder = async (newQuery?: WifiOrderQuery) => {
    try {
      setLoading(true);
      const response = await premiumOrderApi.getOrders(newQuery ?? query);

      if (response.data.code === 0) {
        setTotal(response.data.data?.total || 0);
        setTotalPages(response.data.data?.totalPages || 0);
        setData(response.data.data?.data || []);
      } else {
        enqueueSnackbar(response.data.message || intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    try {
      const response = await premiumOrderApi.createOrder(orderData);

      if (response.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-order-successfully' }), {
          variant: 'success'
        });
        return response.data;
      } else {
        enqueueSnackbar(response.data.message || intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return null;
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return null;
    }
  };

  const updateOrderStatus = async (orderData: any) => {
    try {
      const response = await premiumOrderApi.updateOrderStatus(orderData);

      if (response.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'update-order-successfully' }), {
          variant: 'success'
        });
        return response.data;
      } else {
        enqueueSnackbar(response.data.message || intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return null;
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return null;
    }
  };

  const getOrderDetails = async (params: any) => {
    try {
      const response = await premiumOrderApi.getOrderDetails(params);

      if (response.data.code === 0) {
        return response.data.data;
      } else {
        enqueueSnackbar(response.data.message || intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
        return null;
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return null;
    }
  };

  return {
    orders: data,
    totalOrder: total,
    totalPages,
    fetchWifiOrder,
    createOrder,
    updateOrderStatus,
    getOrderDetails,
    queryOrder: query,
    setQueryOrder: setQuery,
    setDataOrder: setData,
    loadingOrder: loading
  };
};

export default useHandleWifiOrder;
