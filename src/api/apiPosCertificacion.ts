import axios from 'axios'

const posApiCertificador= axios.create({
  baseURL: import.meta.env.VITE_CERTIFICADOR_URL,
})
//console.log('baseUrl',import.meta.env.VITE_POS_API_URL)  

//TODO:Interceptor

export default posApiCertificador;
