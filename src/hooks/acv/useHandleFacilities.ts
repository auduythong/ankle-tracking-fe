import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

// utils
// import axios from 'utils/axios';
import { API_PATH_FACILITIES } from 'utils/constant';

//types
import { NewFacilities } from 'types';
import axios from 'axios';

interface paramsGetFacilities {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId?: string;
}

interface paramsPostFacilities {
  id?: number;
}

const useHandleFacilities = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDataFacilities = async (params: paramsGetFacilities) => {
    try {
      const res = await axios.get(`${'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_FACILITIES.dataFacilities}`, {
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

  const handleAddFacilities = async (dataBody: NewFacilities) => {
    try {
      const res = await axios.post(
        `${API_PATH_FACILITIES.addFacilities}`,
        {
          name: dataBody.name,
          description: dataBody.description,
          airportId: dataBody.airportId,
          type: dataBody.type,
          imageLink: dataBody.imageLink,
          latLocation: dataBody.latLocation,
          longLocation: dataBody.longLocation,
          floor: dataBody.floor
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-facilities-successfully' }), {
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

  const handleEditFacilities = async (dataBody: NewFacilities) => {
    try {
      const res = await axios.post(
        `${API_PATH_FACILITIES.editFacilities}`,
        {
          name: dataBody.name,
          description: dataBody.description,
          airportId: dataBody.airportId,
          type: dataBody.type,
          imageLink: dataBody.imageLink,
          latLocation: dataBody.latLocation,
          longLocation: dataBody.longLocation,
          floor: dataBody.floor
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-facilities-successfully' }), {
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

  const handleDeleteFacilities = async (params: paramsPostFacilities, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_FACILITIES.deleteFacilities}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-facilities-successfully' }), {
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

  return { isLoading, totalPages, fetchDataFacilities, handleAddFacilities, handleEditFacilities, handleDeleteFacilities };
};

export default useHandleFacilities;
