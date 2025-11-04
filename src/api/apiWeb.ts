import axios from 'axios'
import { useStoreTokenExistencia } from '@/stores/tokenExistencia'

const token = useStoreTokenExistencia()
//console.log('Token en apiWeb.ts:', token.tokenExistencia);

const webApi = axios.create({
  baseURL: import.meta.env.VITE_EXIS_URL,
  headers: {
    Authorization: `Bearer ${token.tokenExistencia}`
  }     
})

// webApi.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Detecta si es problema de red (sin Internet o servidor caído)
//     if (!error.response) {
//       // No hacemos nada, devolvemos el error tal cual
//       // El try/catch de la action lo manejará
//     }
//     return Promise.reject(error);
//   }
// );


export default webApi;
