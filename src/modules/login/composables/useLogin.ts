import {  useQuery } from '@tanstack/vue-query'
import { loginVendedorAction } from '../action/login-vendedor.action'
import { Login } from '../interfaces/login.interface'

export const useLogin = ( login:Login ) =>{

    const {  data: loginUsuario } = useQuery({
        queryKey: ['login'],
        queryFn: () => loginVendedorAction(login),
    })



    return {
        loginUsuario
    }
}