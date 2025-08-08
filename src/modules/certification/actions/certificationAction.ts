import { getAxiosErrorMessage } from '@/common/helper/geterrordb'
import { Certification, DtoCertificado } from '../interfaces/certificationInterface'
import posApiCertificador from '@/api/apiPosCertificacion'

import axios from 'axios';
import { env } from 'node:process';

// const baseUrl = 'http://localhost:3001/api'


export const crearCertificationAction = async (  datos: { sucursal: string; serie: string; numero: number } ) : Promise<Certification> => {
    try {
        const { data } = await posApiCertificador.post(`/certification`, {idSucursal: datos.sucursal, serie: datos.serie, numeroFactura: datos.numero})
        console.log('retornando crear certificacion desde action: ', data)
        return data
    } catch (error){
        const message = await getAxiosErrorMessage(error, 'Hubo un error creando la certification')
        console.log(message)
        throw new Error(message)
    }
}

export const crearCertificacionNcAction = async ( datos: { sucursal: string, numeroDevolucion: number } ): Promise<Certification> => {
    try {
        const { data } = await posApiCertificador.post(`/certification/devolucion`, { ID_SUCURSAL: datos.sucursal, NUMERO_DEVOLUCION: datos.numeroDevolucion })
        console.log('retornando crear certificacion de nota de credito desde action: ', data)

        return data
    } catch (error) {
        const message = await getAxiosErrorMessage(error, 'Hubo un error creando la certification de la Nota de Credito.')
        console.log(message)
        throw new Error(message)   
    }
}

export const obtenerDtoCertificado = async (serie: string, numero: number): Promise<DtoCertificado> => {
    try {
        const response = await posApiCertificador.get(`/certification/dto-certificado/${serie}/${numero}`)

        return response.data;
    } catch (error) {
        const message = await getAxiosErrorMessage(error, 'Hubo un error obtener Dto Certificado.')
        console.log(message)
        throw new Error(message)    
    }
}
