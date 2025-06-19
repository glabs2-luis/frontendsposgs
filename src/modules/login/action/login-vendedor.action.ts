import posApi from "@/api/apiPos";
import { Login } from "../interfaces/login.interface";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";

export const loginVendedorAction = async( login: Partial<Login>):Promise<Login> =>{

    delete login.CODIGO_VENDEDOR
    delete login.ESTADO_VENDEDOR
    delete login.TIPO_VENDEDOR

    try {       
        console.log('login',login)
         const {data} = await posApi.post<Login>(`/vendedor/login`,{USUARIO:login.USUARIO, PASSWORD: login.PASSWORD})
        console.log('usuario', data.NOMBRE_VENDEDOR) 
        return data
    } catch (error) {
        console.log('error', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al iniciar sesión");
        throw new Error(message);

    }
    
}

