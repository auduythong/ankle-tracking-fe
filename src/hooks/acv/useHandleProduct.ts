import { useState } from 'react';
import { useIntl } from 'react-intl';

//third-party
import Cookies from 'universal-cookie';
import { enqueueSnackbar } from 'notistack';

// utils
// import axios from 'utils/axios';
import { API_PATH_FACILITIES, API_PATH_PRODUCT_VIP } from 'utils/constant';

//types
import { NewProduct } from 'types';
import axios from 'axios';

interface paramsGetProduct {
  page?: number;
  pageSize?: number;
  filters?: string;
  siteId?: string;
}

interface paramsPostProduct {
  id?: number;
}

const useHandleProduct = () => {
  const cookie = new Cookies();
  const accessToken = cookie.get('accessToken');
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDataProduct = async (params: paramsGetProduct) => {
    try {
      const res = await axios.get(`${'https://wifi.vtctelecom.com.vn/api/vtc_digital_map' + API_PATH_PRODUCT_VIP.dataProducts}`, {
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

  const handleAddProduct = async (dataBody: NewProduct) => {
    try {
      const res = await axios.post(
        `${API_PATH_PRODUCT_VIP.addProduct}`,
        {
          name: dataBody.name,
          price: dataBody.price,
          description: dataBody.description
        },
        {
          headers: { Authorization: accessToken }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'add-product-successfully' }), {
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

  const handleEditProduce = async (dataBody: NewProduct) => {
    try {
      const res = await axios.post(
        `${API_PATH_PRODUCT_VIP.editProduct}`,
        {
          name: dataBody.name,
          price: dataBody.price,
          description: dataBody.description
        },
        {
          headers: { Authorization: accessToken },
          params: { id: dataBody.id }
        }
      );
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'edit-product-successfully' }), {
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

  const handleDeleteProduct = async (params: paramsPostProduct, isDelete: boolean) => {
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
          enqueueSnackbar(intl.formatMessage({ id: 'delete-product-successfully' }), {
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

  return { isLoading, totalPages, fetchDataProduct, handleAddProduct, handleEditProduce, handleDeleteProduct };
};

export default useHandleProduct;
