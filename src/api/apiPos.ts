import axios from 'axios';

const posApi= axios.create({
  baseURL: import.meta.env.VITE_POS_API_URL,
});
console.log('baseUrl',import.meta.env.VITE_POS_API_URL)  

//TODO:Interceptor

export default posApi;
