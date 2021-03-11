import axiosInstance from './axiosApi';

const baseUri = '/search/';

export async function search(searchText) {
  const response = await axiosInstance.get(baseUri, {
    params: {
      q: searchText,
    }
  });
  return response.data;
}