<<<<<<< HEAD
import posApi from "@/api/apiPos"
import { Login } from "../interfaces/login.interface"
import { getAxiosErrorMessage } from "@/common/helper/geterrordb"

export const loginVendedorAction = async (login: Partial<Login>): Promise<Login> => {
  // Eliminar campos innecesarios antes de enviar la solicitud
  delete login.CODIGO_VENDEDOR
  delete login.ESTADO_VENDEDOR
  delete login.TIPO_VENDEDOR

  try {
    console.log('Intentando login con:', login)

    // Hacemos la solicitud POST al backend con el usuario y contraseña
    const { data } = await posApi.post<Login>(`/vendedor/login`, {
      USUARIO: login.USUARIO,
      PASSWORD: login.PASSWORD
    })

    console.log('Login exitoso. Vendedor:', data.NOMBRE_VENDEDOR)
    return data
  } catch (error) {
    // Captura y procesa cualquier error HTTP
    console.log('Error al iniciar sesión:', error)
    const message = getAxiosErrorMessage(error, "Hubo un error al iniciar sesión")
    throw new Error(message)
  }
}
=======
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
>>>>>>> db7049b (Agregar modulos)
