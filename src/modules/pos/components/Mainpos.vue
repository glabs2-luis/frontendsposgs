<template>
  <q-page class="q-pa-md">
     
    <!-- Cliente Formulario -->
    <ClienteForm />
    
    <!-- <q-img src="/img/2.png" alt="Logo del sistema"
        style="max-width: 200px; border-radius: 8px;"
        spinner-color="yellow-9"
          class="absolute-top-right q-ma-md"/> -->

    


    <!-- Tabla de productos -->
    <ProductosTab />

</q-page>
</template>

<script setup lang="ts">
import ClienteForm from '../pages/clienteform.vue'
import ProductosTab from '../pages/productostab.vue'
</script>
