import Cookies from 'js-cookie';

const LOCAL_STORAGE_TOKEN_KEY = 'carabao-ai-chat-token';

export const getToken = () => {
  return Cookies.get(LOCAL_STORAGE_TOKEN_KEY);
};

export const setToken = (token: string) => {
  Cookies.set(LOCAL_STORAGE_TOKEN_KEY, token);
};

export const removeToken = () => {
  Cookies.remove(LOCAL_STORAGE_TOKEN_KEY);
};
