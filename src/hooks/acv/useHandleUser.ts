import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

//utils
import axios from 'axios';
import { API_PATH_USER } from 'utils/constant';

//redux
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

//types
import { NewDevice } from 'types';

interface getDataParams {
  groupId?: number; // 2: user, 1: admin
  filters?: string;
}

interface actionParams {
  id?: string;
}

const useHandleUser = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [isReload, setIsReload] = useState(false);
  const [totalPage, setTotalPages] = useState(0);

  const fetchData = async (pageSize: number, pageIndex: number, groupId: 1 | 2, params?: getDataParams) => {
    try {
      const res = await axios.get(`${'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_USER.dataUser}`, {
        headers: { Authorization: accessToken },
        params: { pageSize: pageSize, page: pageIndex, groupId, filters: params?.filters }
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

  const handleAction = async (action: 'add' | 'edit' | 'delete', params: actionParams, dataBody?: NewDevice | {}) => {
    try {
      const res = await axios.post(
        `${
          action === 'add'
            ? 'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_USER.addUser
            : action === 'edit'
            ? 'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_USER.editUser
            : 'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_USER.deleteUser
        }`,
        {
          data: {
            ...dataBody
          }
        },
        {
          headers: { Authorization: accessToken },
          params: { type: action, ...params }
        }
      );
      if (res.data.code === 0) {
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: `${action}-user-successfully` }),
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        setIsReload(true);
      } else if (res.data.code === -1) {
        enqueueSnackbar(intl.formatMessage({ id: `exits-user` }), {
          variant: 'error'
        });
        return res.data;
      } else {
        enqueueSnackbar(intl.formatMessage({ id: `${action}-failed` }), {
          variant: 'error'
        });
        return res.data;
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
      console.error(err);
    }
  };

  return { isLoading, totalPage, fetchData, handleAction, isReload };
};

export default useHandleUser;
