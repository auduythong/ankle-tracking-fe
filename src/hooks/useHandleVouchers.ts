import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';


//types
import { voucherApi } from 'api/voucher.api';
import { NewVoucherGroup } from 'types/voucher';
import { formatDate } from 'utils/handleData';
import { QueryParam } from 'types/query';

interface VoucherGroupQuery extends QueryParam {
  filters?: string;
  siteId?: string;
  voucherId?: number;
  startDate?: string;
  endDate?: string;
  // siteDataInput: string;
}

interface VoucherQuery extends QueryParam {
  filters?: string;
  siteId?: string;
  voucherId?: number;
  startDate?: string;
  endDate?: string;
}

interface VoucherProps {
  initVoucherGroupQuery?: VoucherGroupQuery;
  initVoucherQuery?: VoucherQuery;
}


const useHandleVouchersGroup = ({ initVoucherGroupQuery, initVoucherQuery }: VoucherProps) => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [queryVoucherGroup, setQueryVoucherGroup] = useState<VoucherGroupQuery>(initVoucherGroupQuery || {} as VoucherGroupQuery);
  const [queryVoucher, setQueryVoucher] = useState<VoucherQuery>(initVoucherQuery || {} as VoucherQuery);
  const [dataVoucherGroup, setDataVoucherGroup] = useState<NewVoucherGroup[]>([]);
  const [dataVoucher, setDataVoucher] = useState<NewVoucherGroup[]>([]);

  const fetchVoucherGroup = async (newQuery?: VoucherGroupQuery) => {
    try {
      setIsLoading(true)
      const { data } = await voucherApi.findAllGroup(newQuery ?? queryVoucherGroup)
      if (data.code === 0) {
        setTotalPages(data.data.totalPages);
        setTotalResults(data.data.total);
        setDataVoucherGroup(data.data.data)
        return data.data.data
        // const formattedDate = formatDate(data.data.data, ['expired_date']);
        // return formattedDate;
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

  const fetchVoucherList = async (newQuery?: VoucherQuery) => {
    try {
      const res = await voucherApi.findAllDetails(newQuery ?? queryVoucher)
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
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

  const addVoucherGroup = async (payload: NewVoucherGroup) => {
    try {
      const res = await voucherApi.create({ payload })
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-voucher-successfully' }), {
          variant: 'success'
        });
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'add-failed' }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const editVoucherGroup = async (id: string, payload: NewVoucherGroup) => {
    try {
      const res = await voucherApi.update({ id }, payload)
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-voucher-successfully' }), {
          variant: 'success'
        });
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'update-failed' }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const deleteVoucherGroup = async (id: string) => {
    setIsLoadingDelete(true)
    try {
      const res = await voucherApi.delete({ id })
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-voucher-successfully' }), {
          variant: 'success'
        });
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-failed' }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    } finally {
      setIsLoadingDelete(false)
    }
  };

  const refreshVoucherGroup = async () => {
    try {
      setIsRefresh(true);
      const res = await voucherApi.refresh()
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-voucher-successfully' }), {
          variant: 'success'
        });
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'refresh-failed' }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    } finally {
      setIsRefresh(false);
    }
  };

  return {
    isLoading,
    isLoadingDelete,
    queryVoucher, queryVoucherGroup,
    setQueryVoucher,
    setQueryVoucherGroup,
    isRefresh,
    totalPages,
    totalResults,
    dataVoucherGroup,
    setDataVoucherGroup,
    dataVoucher, setDataVoucher,
    fetchVoucherGroup,
    fetchVoucherList,
    refreshVoucherGroup,
    addVoucherGroup,
    editVoucherGroup,
    deleteVoucherGroup,
  };
};

export default useHandleVouchersGroup;
