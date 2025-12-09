import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { passpointApi } from 'api/passpoint.api';
import { Passpoint } from 'types/passpoint';
import { QueryParam } from 'types/query';

export interface PasspointQuery extends QueryParam { }

interface PasspointProps {
  initQuery: PasspointQuery;
}

const useHandlePasspoint = ({ initQuery }: PasspointProps) => {
  const [data, setData] = useState<Passpoint[]>([]);
  const [query, setQuery] = useState<PasspointQuery>(initQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();

  const fetchPasspoint = async (newQuery?: PasspointQuery) => {
    try {
      setLoading(true);
      const { data } = await passpointApi.findAll(newQuery ?? query);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
      setData(data.data.data);
      return data.data.data;
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    passpoints: data,
    totalPasspoint: total,
    totalPages,
    fetchPasspoint,
    queryPasspoint: query,
    setQueryPasspoint: setQuery,
    setDataPasspoint: setData,
    loadingPasspoint: loading
  };
};

export default useHandlePasspoint;
