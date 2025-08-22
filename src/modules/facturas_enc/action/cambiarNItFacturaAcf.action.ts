import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { FacturaEnc } from "../interfaces/facturaEncInterface";

export const cambiarNitFacturaACFAction = async (datosFactura:Partial<FacturaEnc>): Promise<void> => {
  try {
    const { data } = await posApi.post( `/facturas-enc/cambiarNitFacturaACF`, datosFactura );
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage( error, "Hubo un error cambiando el nit de la factura a CF"
    );
    console.log(message);
    throw new Error(message);
  }
};
