<template>
  <q-card flat bordered class="q-mt-md q-pa-md bg-grey-1" style="border-radius: 6px;">

    <!-- Sección de búsqueda -->
    <div class="text-h6 text-indigo-10">Ventas</div>
    
    <q-card-section class="q-gutter-md ">
      <q-input dense outlined v-model="codigo" label="Código del producto"
        class="col-4" @keyup.enter="agregarProducto" />
      

      <q-input dense outlined type="number"
        v-model.number="cantidad" label="Cantidad" class="col-2" min="1" />
      

      <q-btn class="boton-amarillo" icon="add" label="Agregar" @click="agregarProducto"  />

      <q-space />

      <div class="text-h6 text-right q-mr-sm">Total: Q{{ totalGeneral.toFixed(2) }}</div>

      
        </q-card-section>
        <q-btn class="boton-amarillo " icon="inventory_2" label="Crear Pedido" @onclick=" crearPedido"/>
    <!-- Tabla de productos -->
    <q-table flat bordered dense :rows="productos" :columns="columnas"
      row-key="codigo" hide-pagination class="q-mb-md">
    
      <template v-slot:body-cell-subtotal="props">
        <q-td align="right">
          Q{{ (props.row.cantidad * props.row.precio).toFixed(2) }}
        </q-td>
      </template>

      <template v-slot:body-cell-eliminar="props">
        <q-td align="center">
          <q-btn flat dense round icon="delete" color="red"
            @click="eliminarProducto(props.row.codigo)" />
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QTableColumn } from 'quasar'
import { useUserStore } from '@/stores/user'
import { showErrorNotification, showConfirmationDialog, showSuccessNotification} from '@/common/helper/notification'
import { useRouter } from 'vue-router'


const productos = ref([
  { codigo: '001', descripcion: 'Producto A', cantidad: 2, precio: 10.00 },
  { codigo: '002', descripcion: 'Producto B', cantidad: 1, precio: 20.00 },
  { codigo: '003', descripcion: 'Producto C', cantidad: 3, precio: 15.00 }
])

const codigo = ref('')
const cantidad = ref(1)

const columnas: QTableColumn[] = [
  { name: 'codigo', label: 'Código', align: 'left', field: 'codigo' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  { name: 'cantidad', label: 'Cantidad', align: 'right', field: 'cantidad' },
  { name: 'precio', label: 'Precio', align: 'right', field: 'precio', format: (val: number) => `Q${val.toFixed(2)}` },
  { name: 'subtotal', label: 'Subtotal', align: 'right', field: 'subtotal' },
  { name: 'eliminar', label: '', align: 'center', field: 'eliminar' }
]

const eliminarProducto = (codigo: string) => {
  productos.value = productos.value.filter(p => p.codigo !== codigo)
}

const totalGeneral = computed(() =>
  productos.value.reduce((acc, p) => acc + p.cantidad * p.precio, 0)
)

const agregarProducto = () => {
  if (!codigo.value) return

  // backend
  const producto = {
    codigo: codigo.value,
    descripcion: `Producto ${codigo.value}`,
    cantidad: cantidad.value,
    precio: 15.00
  }

  productos.value.push(producto)
  codigo.value = ''
  cantidad.value = 1
}

 
const crearPedido = () => {}


</script>

<style scoped>
.boton-amarillo {
  background: linear-gradient(90deg, #FFEB3B, #FBC02D);
  color: #333;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.boton-amarillo:hover {
  background: linear-gradient(90deg, #FBC02D, #F9A825);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

</style>