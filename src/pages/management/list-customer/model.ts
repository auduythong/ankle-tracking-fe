import axios from 'utils/axios';
import { API_PATH_USER } from 'utils/constant';
//third-party
import Cookies from 'universal-cookie';

//types
import { EditUser, NewUser } from 'types/end-user';

const cookies = new Cookies();
const accessToken = cookies.get('accessToken');

export async function getEndUser(pageIndex: number, pageSize: number, searchValue?: string) {
  try {
    const res = await axios.get(`${API_PATH_USER.dataUser}`, {
      headers: { Authorization: `${accessToken}` },
      params: {
        pageSize: pageSize,
        page: pageIndex,
        filters: searchValue,
        // groupId: 1
      }
    });
    return res.data;
  } catch (err) {
    return [];
  }
}

export async function postEditEndUser(id: string, newRecord: EditUser) {
  try {
    const res = await axios.post(
      `${API_PATH_USER.editUser}`,
      { data: { ...newRecord } },
      {
        headers: { Authorization: `${accessToken}` },
        params: {
          id
        }
      }
    );
    return res.data;
  } catch (err) { }
}

export async function postAddUser(newRecord: NewUser) {
  try {
    const res = await axios.post(
      `${API_PATH_USER.addUser}`,
      {
        data: { ...newRecord }
      },
      { headers: { Authorization: `${accessToken}` } }
    );
    return res.data;
  } catch (err) { }
}

export async function postDeleteUser(id: string) {
  try {
    const res = await axios.post(
      `${API_PATH_USER.deleteUser}`,
      {},
      {
        headers: { Authorization: `${accessToken}` },
        params: {
          id
        }
      }
    );
    return res.data;
  } catch (err) { }
}
