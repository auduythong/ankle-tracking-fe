import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

// utils
// import axios from 'utils/axios';
import { API_PATH_AIRLINE } from 'utils/constant';

//types
import { NewAirline } from 'types';
import axios from 'axios';

interface paramsGetAirline {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId?: string;
}

interface paramsPostAirline {
  id?: number;
}

const useHandleAirline = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDataAirline = async (params: paramsGetAirline) => {
    try {
      const res = await axios.get(`${'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_AIRLINE.dataAirlines}`, {
        headers: { Authorization: accessToken },
        params: { ...params }
      });
      if (res.data.code === 0) {
        setTotalPages(res.data.totalPages);
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

  const handleAddAirline = async (dataBody: NewAirline) => {
    try {
      const res = await axios.post(
        `${API_PATH_AIRLINE.addAirlines}`,
        {
          name: dataBody.name,
          description: dataBody.description,
          code: dataBody.code,
          origin: dataBody.origin,
          phone: dataBody.phone,
          email: dataBody.email,
          imageLink: dataBody.imageLink,
          counterLocation: dataBody.counterLocation
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-airline-successfully' }), {
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

  const handleEditAirline = async (dataBody: NewAirline) => {
    try {
      const res = await axios.post(
        `${API_PATH_AIRLINE.editAirlines}`,
        {
          name: dataBody.name,
          description: dataBody.description,
          code: dataBody.code,
          origin: dataBody.origin,
          phone: dataBody.phone,
          email: dataBody.email,
          imageLink: dataBody.imageLink,
          counterLocation: dataBody.counterLocation
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-airline-successfully' }), {
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

  const handleDeleteAirline = async (params: paramsPostAirline, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_AIRLINE.deleteAirlines}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-airline-successfully' }), {
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

  return { isLoading, totalPages, fetchDataAirline, handleAddAirline, handleEditAirline, handleDeleteAirline };
};

export default useHandleAirline;
