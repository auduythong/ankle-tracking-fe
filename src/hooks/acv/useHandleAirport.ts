import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

// utils
// import axios from 'utils/axios';
import { API_PATH_AIRPORT } from 'utils/constant';

//types
import { NewAirport } from 'types';
import axios from 'axios';

interface paramsGetAirport {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId?: string;
}

interface paramsPostAirport {
  id?: number;
}

const useHandleAirport = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchDataAirport = async (params: paramsGetAirport) => {
    try {
      const res = await axios.get(`${'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_AIRPORT.dataAirports}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
        setTotalResults(res.data.total);
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

  const handleAddAirport = async (dataBody: NewAirport) => {
    try {
      const res = await axios.post(
        `${API_PATH_AIRPORT.addAirport}`,
        {
          name: dataBody.name,
          code: dataBody.code,
          longLocation: dataBody.longLocation,
          latLocation: dataBody.latLocation
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-airport-successfully' }), {
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

  const handleEditAirport = async (dataBody: NewAirport) => {
    try {
      const res = await axios.post(
        `${API_PATH_AIRPORT.editAirport}`,
        {
          name: dataBody.name,
          code: dataBody.code,
          longLocation: dataBody.longLocation,
          latLocation: dataBody.latLocation
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-airport-successfully' }), {
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

  const handleDeleteAirport = async (params: paramsPostAirport, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_AIRPORT.deleteAirport}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-airport-successfully' }), {
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
      }
    }
  };

  return { isLoading, totalPages, totalResults, fetchDataAirport, handleAddAirport, handleEditAirport, handleDeleteAirport };
};

export default useHandleAirport;
