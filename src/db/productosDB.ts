import Dexie, { Table } from "dexie";
import { Producto } from "@/modules/facturas_enc/interfaces/detalleInterface";

export class ProductosDB extends Dexie {
  productos!: Table<Producto, string>;

  constructor() {
    super("ProductosDB");

    // Definimr la tabla e índices (PRODUCT0 clave primaria)
    this.version(1).stores({
      productos: "PRODUCT0, DESCRIPCION_PROD, DESCRIPCION_MARCA, CODIGO_BARRA"
    });
  }
}

export const db = new ProductosDB()
