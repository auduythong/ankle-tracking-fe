//third-party
import axios from 'utils/axios';
//constant
import { API_PATH_ROLE } from 'utils/constant';
//third-party
import Cookies from 'universal-cookie';
//types
import { NewRole } from 'types/end-user';

const cookies = new Cookies();
const accessToken = cookies.get('accessToken');

export async function getRole(pageIndex: number, pageSize: number, level?: number, searchValue?: string | null) {
  try {
    const res = await axios.get(`${API_PATH_ROLE.dataRole}`, {
      headers: { Authorization: `${accessToken}` },
      params: {
        pageSize: pageSize,
        page: pageIndex,
        level: level || 1,
        filters: searchValue
      }
    });
    return res.data;
  } catch (err) {
    return [];
  }
}

export async function postAddRole(newRecord: NewRole) {
  try {
    const res = await axios.post(`${API_PATH_ROLE.addRole}`, { ...newRecord }, { headers: { Authorization: `${accessToken}` } });
    return res.data;
  } catch (err) {}
}

export async function postDeleteRole(id: number) {
  try {
    const res = await axios.post(
      `${API_PATH_ROLE.deleteRole}`,
      {},
      {
        headers: { Authorization: `${accessToken}` },
        params: {
          id
        }
      }
    );

    return res.data;
  } catch (err) {}
}

export async function postEditRole(id: number, record: NewRole) {
  try {
    const res = await axios.post(
      `${API_PATH_ROLE.editRole}`,
      {
        ...record
      },
      {
        headers: { Authorization: `${accessToken}` },
        params: {
          id
        }
      }
    );
    return res.data;
  } catch (err) {}
}
