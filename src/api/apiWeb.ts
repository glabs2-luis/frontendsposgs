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

export default webApi;
