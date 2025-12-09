import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

// utils
// import axios from 'utils/axios';
import { API_PATH_CMS } from 'utils/constant';

//types
import { NewCMS } from 'types';
import axios from 'axios';

interface paramsGetCMS {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId?: string;
}

interface paramsPostCMS {
  id?: number;
}

const useHandleCMS = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDataCMS = async (params: paramsGetCMS) => {
    try {
      const res = await axios.get(`${'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_CMS.dataCMS}`, {
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

  const handleAddCMS = async (dataBody: NewCMS) => {
    try {
      const res = await axios.post(
        `${API_PATH_CMS.addCMS}`,
        {
          title: dataBody.title,
          description: dataBody.description,
          expiredAt: dataBody.expiredAt,
          mediaUrl: dataBody.mediaUrl,
          type: dataBody.type,
          facilityId: dataBody.facilityId,
          airportId: dataBody.airportId,
          statusId: dataBody.statusId,
          priority: dataBody.priority
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-cms-successfully' }), {
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

  const handleEditCMS = async (dataBody: NewCMS) => {
    try {
      const res = await axios.post(
        `${API_PATH_CMS.editCMS}`,
        {
          title: dataBody.title,
          description: dataBody.description,
          expiredAt: dataBody.expiredAt,
          mediaUrl: dataBody.mediaUrl,
          type: dataBody.type,
          facilityId: dataBody.facilityId,
          airportId: dataBody.airportId,
          statusId: dataBody.statusId,
          priority: dataBody.priority
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-cms-successfully' }), {
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

  const handleDeleteCMS = async (params: paramsPostCMS, isDelete: boolean) => {
    if (params.id && isDelete) {
      try {
        const res = await axios.post(
          `${API_PATH_CMS.deleteCMS}`,
          {},
          {
            headers: { Authorization: accessToken },
            params: { ...params }
          }
        );
        if (res.data.code === 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'delete-cms-successfully' }), {
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

  return { isLoading, totalPages, fetchDataCMS, handleAddCMS, handleEditCMS, handleDeleteCMS };
};

export default useHandleCMS;
