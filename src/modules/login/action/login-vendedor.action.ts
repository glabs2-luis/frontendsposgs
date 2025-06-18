import posApi from "@/api/apiPos";
import { Login } from "../interfaces/login.interface";
import { getAxiosErrorMessage } from "@/helper/geterrordb";

export const loginVendedorAction = async( login: Partial<Login>):Promise<Login> =>{

    
    delete login.CODIGO_VENDEDOR
    delete login.ESTADO_VENDEDOR
    delete login.TIPO_VENDEDOR
    try {       
        console.log('login',login)
        const {data} = await posApi.post<Login>(`/vendedor/login`,{ USUARIO:login.USUARIO, PASSWORD: login.PASSWORD})
        console.log(data)
        return data
    } catch (error) {
        console.log(error)

    }
    
}