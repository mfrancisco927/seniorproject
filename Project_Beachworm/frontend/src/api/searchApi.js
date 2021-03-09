import axiosInstance from './axiosApi';

const baseUri = '/search/';

async function search(searchText) {
  try {
    const response = await axiosInstance.get(baseUri, {
      params: {
        q: searchText
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}