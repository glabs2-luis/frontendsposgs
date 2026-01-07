<template>
  <div class="pedido-detalle-container">
    <q-card
      flat
      bordered
      class="q-pa-sm q-mb-xs bg-yellow-1 text-black rounded-borders shadow-2"
    >
      <!-- Detalle del pedido -->
      <div class="row items-center justify-between q-mb-md">
        <!-- Título -->
        <div class="col-auto row items-center q-gutter-sm">
          <q-icon name="receipt_long" size="24px" color="black" />
          <div>
            <div class="text-subtitle2 text-weight-bold text-dark">
              Detalle del Pedido
            </div>
            <div class="text-caption text-grey-8">
              Registra productos escaneando o ingresando manualmente
            </div>
          </div>
        </div>

        <!-- Botones alineados a la derecha -->
        <div class="col-auto row items-center q-gutter-sm">
          <q-toggle
            v-if="userStore.tipoUsuarioStore === 'POS'"
            v-model="contingencia"
            label="Contingencia"
            color="yellow-10"
            keep-color
            class="toggle-brillante"
            @click="confirmarContingencia"
          >
            <q-tooltip> Activa y desactiva el modo de contingencia</q-tooltip>
          </q-toggle>

          <q-btn
            v-if="tipoPedido === 'cotización'"
            icon="print"
            color="indigo"
            class="color: black"
            @click="imprimirCotizacion"
            :disable="tipoPedido !== 'cotización'"
          />
          <q-btn
            icon="restart_alt"
            class="boton-amarillo"
            @click="limpiarPedido"
          >
            <q-tooltip> Limpiar pedido</q-tooltip>
          </q-btn>
          <q-btn
            label="Anular"
            class="boton-amarillo"
            text-color="black"
            style="color: black"
            @click="limpiar"
          >
            <q-tooltip> Anular pedido</q-tooltip>
          </q-btn>

          <!-- v-if="userStore.tipoUsuarioStore === 'POS'" -->
          <q-btn
            v-if="userStore.tipoUsuarioStore === 'POS'"
            label="Terminar Venta (F4)"
            icon="point_of_sale"
            @click="terminarVenta"
            class="boton-amarillo"
          />

          <!-- v-if="userStore.tipoUsuarioStore === 'ROMPEFILA'" -->
          <q-btn
            v-if="userStore.tipoUsuarioStore === 'ROMPEFILA'"
            label="Generar ticket"
            icon="theaters"
            @click="terminarPedidoRompefilas"
            class="boton-amarillo "
            style="color: black"
          />
        </div>
      </div>

      <!-- Segunda fila: inputs + botones -->
      <div class="row q-col-gutter-sm items-end">
        <!-- Código del producto -->
        <q-input
          ref="inputCodigo"
          v-model="codigoProducto"
          label="Código del Producto"
          outlined
          dense
          debounce="300"
          @update:model-value="busquedaAutomatica"
          @keyup.enter="buscarProductoEscaneado"
          @keydown.arrow-up.prevent="aumentarCantidadInput"
          @keydown.arrow-down.prevent="disminuirCantidadInput"
          class="col-12 col-md-5"
          :disable="errorAgregarProducto || loadingPorCodigo"
        >
          <template #append>
            <q-btn
              @click="abrirCatalogo2"
              icon="search"
              class="boton-amarillo"
            />
          </template>
          <template #prepend>
            <q-btn
              round
              dense
              flat
              icon="view_headline"
              color="primary"
              @click="abrirCatalogo2"
            />
          </template>
        </q-input>

        <!-- Cantidad -->
        <q-input
          v-model.number="cantidad2"
          label="Cantidad"
          type="number"
          outlined
          dense
          min="1"
          class="col-6 col-md-2"
        />

        <!-- Botones -->
        <div class="col-6 col-md-5 row q-gutter-sm">
          <q-btn
            @click="buscarProductoEscaneado"
            class="boton-amarillo"
            icon="add_shopping_cart"
            size="sm"
            :loading="loadingAgregar || loadingPorCodigo"
            :disable="!codigoProducto || loadingPorCodigo"
          />

          <q-btn
            @click="abrirExistencia"
            class="boton-amarillo"
            icon="inventory_2"
            label="Existencias"
            size="sm"
            />

            <q-btn
            @click="abrirExistencia2"
            class="boton-amarillo"
            icon="storefront"
            size="sm"
            />

          <!-- Contador de productos -->
          <div class="col-auto">
            <q-card flat class="productos-counter-card">
              <q-card-section class="q-pa-xs">
                <div class="row items-center q-col-gutter-xs">
                  <q-icon name="shopping_cart" color="orange" size="xs" />
                  <div class="counter-info">
                    <div class="counter-label">Productos</div>
                    <div class="counter-number">
                      {{ totalStore.totalItems }}
                    </div>
                  </div>
                </div>
              </q-card-section>
              <q-tooltip> Cantidad de items agregados</q-tooltip>
            </q-card>
          </div>
        </div>

        <!-- Descripcion del producto y subtotal Calculado -->
        <div v-if="nuevosDatos">
          <span style="color: black; font-weight: bold">
            {{ nuevosDatos.descripcion }}
          </span>
          <template v-if="nuevosDatos.encontrado">
            <span style="color: green; font-weight: bold; font-size: 16px">
              {{ ` - Precio: ${formatCurrency(nuevosDatos.precio, 3)} - ` }}
            </span>
            <span style="color: blue; font-weight: bold; font-size: 16px">
              {{ `  Subtotal: ${formatCurrency(nuevosDatos.subtotal, 3)}` }}
            </span>
          </template>
        </div>
      </div>
    </q-card>

    <!-- Modal de catálogo de productos -->
    <q-dialog v-model="modalProductos2" maximized>
      <q-card class="catalogo-modal">
        <!-- Header mejorado -->
        <q-card-section class="catalogo-header q-pa-xs q-pl-md">
          <div class="row items-center q-pa-xs justify-between">
            <div class="col">
              <div class="text-h6 text-weight-bold">
                <q-icon name="inventory_2" class="q-mr-md" />
                Catálogo de Productos

                <!-- Indicador de loading en el header -->
                <q-spinner-dots
                  v-if="loadingProductosQuery && !todosProductos"
                  color="white"
                  size="24px"
                  class="q-ml-md"
                />
                <q-spinner-dots
                  v-else-if="fetchingProductos && todosProductos"
                  color="white"
                  size="20px"
                  class="q-ml-md"
                />
              </div>
              <div class="text-subtitle1 text-white-7">
                <span v-if="loadingProductosQuery && !todosProductos">
                  Cargando productos del servidor...
                </span>
                <span v-else>
                  Selecciona productos para agregar a tu pedido
                </span>
              </div>
            </div>
            <div class="col-auto row items-center q-gutter-sm">
              <!-- Botón de refresh -->
              <q-btn
                icon="refresh"
                flat
                round
                dense
                size="lg"
                :loading="fetchingProductos"
                :disable="loadingProductosQuery"
                @click="() => refetchTodosProductos"
                class="refresh-btn"
              >
                <q-tooltip>Actualizar productos</q-tooltip>
              </q-btn>

              <!-- Botón de cerrar -->
              <q-btn icon="close" flat round dense v-close-popup size="lg" />
            </div>
          </div>
        </q-card-section>

        <!-- Buscador mejorado -->
        <q-card-section class="q-pa-sm q-pb-md">
          <div class="search-container">
            <q-input
              ref="buscadorProductoRef"
              v-model="filtroProductos"
              label="Buscar productos por código, nombre o marca..."
              outlined
              dense
              class="search-input-enhanced"
              bg-color="white"
              @keyup.enter="buscarProducto"
            >
              <template #prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template #append>
                <q-btn
                  v-if="filtroProductos"
                  @click="limpiarFiltro"
                  icon="clear"
                  flat
                  round
                  dense
                  color="grey-6"
                />
              </template>
            </q-input>

            <!-- Estadísticas -->
            <div class="row items-center justify-between q-mt-md">
              <div class="text-caption text-grey-6">
                <span v-if="loadingProductosQuery && !todosProductos">
                  <q-spinner-dots color="grey-6" size="16px" class="q-mr-xs" />
                  Cargando productos...
                </span>
                <span v-else-if="fetchingProductos && todosProductos">
                  <q-spinner-dots color="blue" size="16px" class="q-mr-xs" />
                  Actualizando...
                </span>
                <span v-else>
                  {{ productosFiltrados2.length }} productos encontrados
                </span>
              </div>
              <q-chip text-color="back" icon="info" size="sm">
                Presiona Enter en cantidad para agregar
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <!-- Tabla de productos mejorada -->

        <q-card-section class="q-pa-xs q-pl-sm">
          <!-- Loading inicial - cuando no hay productos y está cargando -->
          <div
            v-if="loadingProductosQuery && !todosProductos"
            class="loading-container"
          >
            <div class="loading-content">
              <q-spinner-dots size="60px" />
              <div class="loading-text">
                <div class="text-h6 text-black q-mb-sm">
                  Cargando catálogo...
                </div>
                <div class="text-subtitle2 text-grey-6">
                  Obteniendo productos del servidor
                </div>
              </div>
            </div>
          </div>

          <!-- Loading de refetch - cuando hay productos pero se están actualizando -->
          <div
            v-else-if="fetchingProductos && todosProductos"
            class="refetch-loading"
          >
            <q-banner rounded class="justify-center">
              <template #avatar>
                <q-spinner-dots
                  class="q-mr-xs border-radius-10"
                  color="blue"
                  size="24px"
                />
              </template>
              Actualizando productos...
            </q-banner>
          </div>

          <!-- Error en la carga -->
          <div v-else-if="errorProductos" class="error-container">
            <div class="error-content">
              <q-icon name="error" size="60px" color="negative" />
              <div class="error-text">
                <div class="text-h6 text-negative q-mb-sm">
                  Error al cargar productos
                </div>
                <div class="text-subtitle2 text-grey-6 q-mb-md">
                  {{
                    errorProductos?.message ||
                    "No se pudieron cargar los productos"
                  }}
                </div>
                <q-btn
                  color="orange"
                  icon="refresh"
                  label="Reintentar"
                  @click="() => refetchTodosProductos"
                  :loading="fetchingProductos"
                />
              </div>
            </div>
          </div>

          <!-- Tabla de productos -->
          <div v-else>
            <q-table
              :rows="productosFiltrados2.slice(0, 50)"
              :columns="columnasCatalogo"
              row-key="PRODUCT0"
              :pagination="paginacionCatalogo"
              :loading="fetchingProductos"
              class="catalogo-table"
              flat
              bordered
              separator="cell"
              virtual-scroll
              :virtual-scroll-item-size="48"
              :rows-per-page-options="[25, 50, 100]"
              :wrap-cells="true"
            >
              <!-- Columna personalizada para código -->
              <template #body-cell-codigo="props">
                <q-td :props="props" class="codigo-cell">
                  <div class="row items-center q-gutter-sm">
                    <q-icon name="qr_code" color="yellow-10" size="sm" />
                    <div>
                      <div class="text-weight-bold text-black-8">
                        {{ props.row.PRODUCT0 }}
                      </div>
                      <div class="text-caption text-black-6">
                        {{ props.row.DESCRIPCION_MARCA }}
                      </div>
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Columna personalizada para descripción -->
              <template #body-cell-descripcion="props">
                <q-td :props="props" class="descripcion-cell">
                  <div class="text-weight-medium">
                    {{ props.row.DESCRIPCION_PROD }}
                  </div>
                </q-td>
              </template>

              <!-- Columna personalizada para precio -->
              <template #body-cell-precio="props">
                <q-td :props="props" class="precio-cell">
                  <div
                    v-if="
                      new Date() >= new Date(props.row.FECHA_VIGENCIA_I) &&
                      new Date() <= new Date(props.row.FECHA_VIGENCIA_F)
                    "
                    class="precio-oferta-table"
                  >
                    <div class="precio-anterior-table">
                      {{ formatCurrency(props.row.PRECIO_SUGERIDO, 3) }}
                    </div>
                    <div class="precio-actual-table">
                      {{ formatCurrency(props.row.PRECIO_PROMOCION, 3) }}
                    </div>
                    <q-chip
                      size="xs"
                      color="green"
                      text-color="white"
                      class="oferta-chip"
                    >
                      ¡OFERTA!
                    </q-chip>
                    <q-chip size="sm" color="orange" class="vigencia-chip">
                      Válido hasta:
                      {{ props.row.FECHA_VIGENCIA_F.slice(0, 10) }}
                    </q-chip>
                  </div>
                  <div v-else class="precio-normal-table">
                    <div class="text-weight-bold text-black">
                      {{ formatCurrency(props.row.PRECIO_SUGERIDO, 3) }}
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Columna personalizada para niveles -->
              <template #body-cell-niveles="props">
                <q-td :props="props" class="niveles-cell">
                  <div
                    v-if="props.row.niveles && props.row.niveles.length > 0"
                    class="niveles-container"
                  >
                    <div
                      v-for="(nivel, nivelIndex) in props.row.niveles"
                      :key="nivelIndex"
                      class="nivel-row"
                    >
                      <q-chip
                        dense
                        size="sm"
                        text-color="grey-8"
                        class="nivel-chip"
                      >
                        {{ nivel }}
                      </q-chip>
                    </div>
                  </div>
                  <div v-else class="text-grey-5 text-caption">Sin niveles</div>
                </q-td>
              </template>

              <!-- Columna personalizada para cantidad -->
              <template #body-cell-cantidad="props">
                <q-td :props="props" class="cantidad-cell">
                  <q-input
                    v-model="props.row.CANTIDAD_PEDIDA"
                    dense
                    min="1"
                    outlined
                    style="max-width: 80px"
                    @click.stop
                    @change="cantidadIngresada(props.row)"
                    @keyup.enter="
                      seleccionarProducto2(props.row, props.rowIndex)
                    "
                    :ref="
                      (el) => {
                        if (
                          el &&
                          cantidadInputs &&
                          typeof props.rowIndex === 'number' &&
                          props.rowIndex >= 0
                        ) {
                          try {
                            cantidadInputs[props.rowIndex] = el;
                          } catch (error) {
                            showConfirmationInsideModal('Error', error);
                            //console.warn('Error assigning ref:', error);
                          }
                        }
                      }
                    "
                  >
                    <template #prepend>
                      <q-icon name="shopping_cart" size="sm" />
                    </template>
                  </q-input>
                </q-td>
              </template>

              <!-- Columna personalizada para acción -->
              <template #body-cell-accion="props">
                <q-td :props="props" class="accion-cell">
                  <q-btn
                    @click="seleccionarProducto2(props.row, props.rowIndex)"
                    icon="add_shopping_cart"
                    label="Agregar"
                    size="md"
                    :loading="loadingAgregar"
                    class="boton-amarillo"
                  />
                </q-td>
              </template>

              <!-- Estado vacío personalizado -->
              <template #no-data>
                <div class="text-center q-pa-xl">
                  <q-icon name="inventory" size="80px" color="grey-4" />
                  <div class="text-h6 text-grey-6 q-mt-md">
                    No se encontraron productos
                  </div>
                  <div class="text-caption text-grey-5">
                    Intenta con otros términos de búsqueda
                  </div>
                </div>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal Para Facturación -->
    <q-dialog
      v-model="modalFacturacion"
      @show="enfocarEfectivo"
      persistent
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card class="q-dialog-plugin facturacion-card">
        <!-- Header profesional -->
        <q-card-section
          class="row items-center justify-between facturacion-header"
        >
          <div class="row items-center q-gutter-sm">
            <q-icon name="point_of_sale" size="28px" color="black" />
            <div class="text-h6 text-black">Facturación</div>
            <q-chip
              v-if="contingencia"
              color="red-6"
              align-items="right"
              text-color="white"
              icon="warning"
              size="20px"
              dense
            >
              Contingencia
            </q-chip>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="black"
            class="bg-yellow-10"
          />
        </q-card-section>

        <!-- Encabezado de pedido/serie -->
        <q-card-section class="q-pt-sm q-pb-none">
          <div class="row items-center justify-between text-grey-7">
            <div class="row items-center q-gutter-sm">
              <div class="text-h6">
                Pedido No. {{ pedidoStore.numeroDePedido }}
              </div>
            </div>
            <div class="row items-center q-gutter-sm">
              <div class="text-h6">
                Serie:
                {{ configuracionStore.serieSeleccionada || "No hay serie" }}
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Información del cliente y total -->
        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <!-- Total -->
            <div class="col-12">
              <q-card flat class="total-card">
                <q-card-section class="text-center q-pa-none">
                  <div class="text-caption text-grey-6">Total a pagar</div>
                  <div class="text-h4 text-weight-bold">
                    {{ formatCurrency(totalAPagar, 2) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <!-- Método de pago -->
        <q-card-section class="q-pt-sm">
          <div class="row q-col-gutter-sm items-start">
            <div class="col-12">
              <div class="payment-method-container">
                <div class="text-caption text-grey-6 q-mb-sm">Tipo de Pago</div>
                <q-btn-toggle
                  v-model="tipoPago"
                  :options="[
                    {
                      label: 'Efectivo',
                      value: 'EFECTIVO',
                      icon: 'account_balance_wallet',
                    },
                    { label: 'Tarjeta', value: 'TARJETA', icon: 'credit_card' },
                    { label: 'Mixto', value: 'MIXTO', icon: 'payments' },
                  ]"
                  unelevated
                  spread
                  no-caps
                  class="payment-method-buttons"
                  toggle-color="yellow-10"
                  color="grey-4"
                  text-color="grey-8"
                />
              </div>
            </div>

            <div class="col-12 q-mt-sm">
              <q-input
                ref="focusEfectivo"
                v-model.number="montoEfectivo"
                label="Efectivo"
                prefix="Q"
                :disable="tipoPago !== 'EFECTIVO' && tipoPago !== 'MIXTO'"
                outlined
                dense
                class="bg-grey-1"
                input-class="text-bold"
                type="number"
                min="0"
                step="0.01"
                @keydown.enter.prevent="focusBtnConfirmar"
              >
                <template #prepend>
                  <q-icon name="account_balance_wallet" color="brown" />
                </template>
              </q-input>
            </div>

            <div class="col-12 q-mt-sm">
              <q-input
                ref="focusTarjeta"
                v-model.number="montoTarjeta"
                label="Tarjeta"
                prefix="Q"
                :disable="tipoPago !== 'TARJETA' && tipoPago !== 'MIXTO'"
                outlined
                dense
                class="bg-grey-1"
                input-class="text-bold"
                type="number"
                min="0"
                step="0.01"
                @keydown.enter.prevent="focusBtnConfirmar"
              >
                <template #prepend>
                  <q-icon name="credit_card" color="blue" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <!-- Resumen de pago y estado -->
        <q-card-section class="q-pt-none">
          <q-card flat bordered class="resumen-pago-card">
            <!-- Sección de descuento aplicado -->
            <q-card-section v-if="totalAnterior > 0" class="descuento-section">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-grey-8">
                  <q-icon name="local_offer" size="sm" class="q-mr-xs" />
                  Descuento Aplicado
                </div>
                <q-chip
                  color="green-6"
                  text-color="white"
                  size="sm"
                  icon="check_circle"
                >
                  Cupón Válido
                </q-chip>
              </div>

              <div class="row items-center justify-between q-mb-xs">
                <div class="text-body2 text-grey-7">Total original</div>
                <div class="text-subtitle1 text-weight-bold text-red-7">
                  {{ formatCurrency(totalAnterior, 2) }}
                </div>
              </div>

              <div class="row items-center justify-between q-mb-xs">
                <div class="text-body2 text-grey-7">Descuento</div>
                <div class="text-subtitle1 text-weight-bold text-green-7">
                  -{{ formatCurrency(totalAnterior - totalAPagar, 2) }}
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="row items-center justify-between">
                <div class="text-body1 text-weight-bold text-grey-8">
                  Total final
                </div>
                <div class="text-h6 text-weight-bold text-green-7">
                  {{ formatCurrency(totalAPagar, 2) }}
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div
                v-if="faltantePago > 0"
                class="row items-center justify-between q-mt-xs q-pb-none"
              >
                <div class="text-body2 text-grey-7">Faltante</div>
                <div
                  class="text-h5 text-weight-bold"
                  :class="{ 'text-negative': faltantePago > 0 }"
                >
                  {{ formatCurrency(faltantePago, 2) }}
                </div>
              </div>
              <div
                v-if="cambioPago > 0"
                class="row items-center justify-between q-mt-xs"
              >
                <div class="text-body2 text-grey-7">Cambio</div>
                <div class="text-weight-bold text-positive text-h5">
                  {{ formatCurrency(cambioPago, 2) }}
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pt-sm q-pb-none">
              <q-banner
                v-if="!isPagoValido"
                dense
                rounded
                class="bg-orange-1 text-orange-9"
              >
                Ingresa un monto de pago igual o superior al total.
              </q-banner>
              <div class="q-mt-sm">
                <q-btn
                  icon="discount"
                  color="orange"
                  class="q-ml-sm text-black"
                  label="Agregar Cupón"
                  @click="abrirCuponazo"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>

        <!-- Acciones -->
        <q-card-actions align="right" class="q-pt-none">
          <q-btn
            ref="btnConfirmarFactura"
            color="orange"
            icon="taskalt"
            label="Facturar "
            class="q-ml-sm"
            :disable="!isPagoValido"
            @click="confirmarFactura()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de cuponazo -->
    <q-dialog
      v-model="modalCuponazo"
      persistent
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card
        class="q-dialog-plugin q-pa-md"
        style="
          min-width: 400px;
          max-width: 90vw;
          max-height: 90vh;
          border-radius: 10px;
        "
      >
        <q-card-section
          class="row items-center justify-between"
          style="border-radius: 10px"
        >
          <div
            class="text-h6 text-primary q-ml-sm bg-yellow-8 text-black q-pa-xs"
            style="border-radius: 10px"
          >
            Agregar cupón
          </div>
          <q-btn
            class="bg-yellow-8 text-black"
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>

        <q-card-section>
          <q-input
            filled
            ref="refCupon"
            v-model="cupon"
            label="Escribe el cupón"
            @keyup.enter="aplicarCuponazo"
            outlined
            dense
          />
          <q-input
            v-model="clave"
            label="Clave de autorización"
            type="password"
            outlined
            dense
            class="q-mt-md"
            @keyup.enter="aplicarCuponazo()"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            label="Aplicar cupón"
            class="boton-amarillo"
            @click="aplicarCuponazo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Existencia por Producto-->
    <q-dialog
      v-model="modalExistencias2"
      transition-show="fade"
      transition-fade="fade"
      >

      <q-card style="min-width: 50vw; max-height: 90vh;">

      <!-- Header -->
      <q-card-section class="row items-center justify-between facturacion-header">
        <div class="text-h6">Existencias de Productos</div>
        <q-btn icon="close" flat dense round v-close-popup @click="resetearSeleccion" />
      </q-card-section>

      <q-separator />

      <!-- Buscador -->
      <q-card-section>
        <div class="row q-col-gutter-sm justify-center items-center">
          <div class="col-10">
            <q-input
              v-model="filtroExistencias2"
              autofocus
              label="Buscar producto por código"
              outlined
              dense
              clearable
              @keyup.enter="BuscarExistenciaProducto"
            />
          </div>
        
          <div class="col-auto">
            <q-btn
              dense
              icon="search"
              color="orange-8"
              label="Buscar"
              @click="BuscarExistenciaProducto"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Body -->
       
      <q-separator />

      <q-card-section>
        <q-banner v-if="!productoCodigoExistencia.length" class="bg-grey-2" rounded>
          Busca un producto por código.
        </q-banner>

        <q-list v-else bordered separator class="rounded-borders text-center">
          <q-item v-for="(p, i) in productoCodigoExistencia" :key="i" class="q-py-md">
            <q-item-section>
              <!-- Título -->
              <q-item-label class="text-subtitle1 text-weight-bold">
                {{ p.Producto }} - {{ p.Descripcion }}
              </q-item-label>

              <!-- Lote -->
              <q-item-label class="text-body2 text-grey-7 q-mt-xs  text-center">
                Lote: <span class="text-weight-medium">{{ p.Lote }}</span>
                · <span class="text-weight-medium">{{ p.DescripcionLote }}</span>
              </q-item-label>

              <!-- Stocks -->
              <div class="row q-col-gutter-sm q-mt-sm justify-center">
                <div class="col-12 col-sm-auto">
                  <q-chip
                    square
                    size="lg"
                    :color="Number(p.Disponible) > 0 ? 'positive' : 'negative'"
                    text-color="white"
                    icon="inventory"
                  >
                    Disponible: <span class="q-ml-xs text-weight-bold">{{ p.Disponible }}</span>
                  </q-chip>
                </div>

                <div class="col-12 col-sm-auto">
                  <q-chip
                    square
                    size="lg"
                    :color="Number(p.DisponibleOtras) > 0 ? 'info' : 'grey-6'"
                    text-color="white"
                    icon="store"
                  >
                    Otras sucursales:
                    <span class="q-ml-xs text-weight-bold">{{ p.DisponibleOtras }}</span>
                    </q-chip>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
      

    <!-- Modal de existencias de productos -->
      <q-dialog
        v-model="modalExistencias"
        transition-show="fade"
        transition-hide="fade"
      >
    <q-card style="min-width: 90vw; max-height: 90vh;">
    
       <!-- Header -->
      <q-card-section class="row items-center justify-between facturacion-header">
        <div class="text-h6">Existencias de Productos</div>
        <q-btn icon="close" flat dense round v-close-popup @click="resetearSeleccion" />
      </q-card-section>
      
      <q-separator />

        <!-- Breadcrumb para mostrar navegación -->
        <q-card-section class="q-pa-sm bg-grey-2">
          <q-breadcrumbs>
            <q-breadcrumbs-el
              label="Todos los productos"
              @click="resetearSeleccion"
              :class="
                !productoSeleccionado
                  ? 'text-primary text-weight-bold'
                  : 'cursor-pointer'
              "
            />
            <q-breadcrumbs-el
              v-if="productoSeleccionado"
              :label="`Producto: ${productoSeleccionado}`"
              @click="loteSeleccionado = null"
              :class="
                !loteSeleccionado
                  ? 'text-primary text-weight-bold'
                  : 'cursor-pointer'
              "
            />
            <q-breadcrumbs-el
              v-if="loteSeleccionado"
              :label="`Lote: ${loteSeleccionado}`"
              class="text-primary text-weight-bold"
            />
          </q-breadcrumbs>
        </q-card-section>

        <q-separator />

      <!-- Contenido dinámico según la selección -->
      <q-card-section style="max-height: 70vh; overflow: visible;">
 
            <!-- Vista 1: Selector de productos -->
      <div v-if="!productoSeleccionado" style="height: auto;">
        <div class="text-h6 text-center justify-between q-mb-lg text-weight-bold">
          <q-icon name="inventory_2" size="md" color="yellow-10" class="q-mr-sm" />
          Selecciona un producto para ver sus existencias
          
          <q-space /> 
          <q-btn
            flat
            dense
            round
            icon="refresh"
            color="orange-8"
            label="Recargar Existencias"
            @click="recargarExistencias"></q-btn>

        </div>

            <q-select
              v-model="productoSeleccionadoTemp"
              :options="opcionesProductosFiltrados"
              option-value="Producto"
              option-label="label"
              label="Buscar producto por código o descripción"
              outlined
              use-input
              input-debounce="300"
              @filter="filtrarProductosSelect"
              @update:model-value="seleccionarProductoDesdeSelect"
              class="selector-productos"
              behavior="menu"
              clearable
              menu-portal
              menu-anchor="bottom middle"
              menu-self="top middle"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="yellow-10" />
              </template>

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontraron productos
                  </q-item-section>
                </q-item>
              </template>

              <!-- Estilo en el Select Box-->
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="inventory" color="orange" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ scope.opt.Producto }}
                    </q-item-label>
                    <q-item-label caption class="text-black">
                      {{ scope.opt.Descripcion }}
                    </q-item-label>
                    <q-item-label caption class="text-grey-6">
                      Marca: {{ scope.opt.Marca }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:selected-item="scope">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="inventory" color="orange" />
                  <div>
                    <div class="text-weight-bold">{{ scope.opt.Producto }}</div>
                    <div class="text-caption">{{ scope.opt.Descripcion }}</div>
                  </div>
                </div>
              </template>
            </q-select>

            <!-- Info adicional -->
            <div class="q-mt-lg text-grey-7 row items-center justify-between">
              <div>
                <!-- <q-icon name="warning" size="sm" class="q-mr-xs" color="yellow-10" /> -->
                ⚠️ La existencia mostrada podria no estar actualizada.
              </div>
              <div>
                {{ productosExistencias3.length }} productos disponibles
              </div>
            </div>
          </div>

          <!-- Vista 2: Lotes del producto seleccionado -->
          <div v-else-if="productoSeleccionado && !loteSeleccionado">
            <q-toolbar class="q-pa-none">
              <div class="text-h6">
                Lotes de: {{ productoSeleccionado.Descripcion }}
              </div>
              <q-space />
              <!-- Esto empuja lo que sigue a la derecha -->
              <q-btn
                flat
                dense
                round
                icon="arrow_back"
                label="Regresar"
                color="red-10"
                @click="resetearSeleccion"
              >
                <q-tooltip>Volver a productos</q-tooltip>
              </q-btn>
            </q-toolbar>
            <q-table
              flat
              bordered
              dense
              :rows="LotesExistentes"
              :columns="columnasLotes"
              row-key="Lote"
              :pagination="{ rowsPerPage: 100 }"
              :loading="!loteProducto"
              no-data-label="No hay lotes disponibles"
              class="tabla-lotes-mejorada"
            >
              <!-- Celda personalizada para Cantidad -->
              <template v-slot:body-cell-Cantidad="props">
                <q-td :props="props" class="cantidad-destacada">
                  <div
                    :class="
                      props.row.Disponible === 0
                        ? 'cantidad-badge-red'
                        : 'cantidad-badge'
                    "
                  >
                    <span class="cantidad-numero">{{
                      props.row.Disponible
                    }}</span>
                    <span class="cantidad-label"></span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-acciones="props">
                <q-td :props="props">
                  <q-btn
                    dense
                    flat
                    color="green-8"
                    icon="storefront"
                    label="Bodegas"
                    @click="verExistencias(props.row.Lote)"
                    :disable="props.row.Existencia <= 0"
                    :loading="loadingBodegas"
                  >
                    <q-tooltip>Ver existencias en bodegas</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>

          <!-- Vista 3: Existencias en bodegas del producto/lote seleccionado -->
          <div v-else>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">
                Existencias en Bodegas - Lote: {{ loteSeleccionado }}
              </div>

              <q-btn
                flat
                dense
                round
                icon="arrow_back"
                color="red-10"
                label="Regresar"
                @click="loteSeleccionado = null"
              >
                <q-tooltip>Volver a lotes</q-tooltip>
              </q-btn>
            </div>

            <q-table
              flat
              bordered
              dense
              :rows="datosExistencias"
              :columns="columnasBodegas"
              row-key="Bodega"
              :pagination="{ rowsPerPage: 20 }"
              no-data-label="No hay existencias en otras bodegas"
              class="tabla-lotes-mejorada"
            >
              <!-- Celda personalizada para Cantidad -->
              <template v-slot:body-cell-Disponible="props">
                <q-td :props="props" class="cantidad-destacada">
                  <div
                    :class="
                      props.row.Disponible === 0
                        ? 'cantidad-badge-red'
                        : 'cantidad-badge'
                    "
                  >
                    <span class="cantidad-numero">{{
                      props.row.Disponible
                    }}</span>
                    <span class="cantidad-label"></span>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-Existencia="props">
                <q-td :props="props">
                  <q-badge
                    :color="props.row.Existencia > 0 ? 'positive' : 'negative'"
                  >
                    {{ props.row.Existencia }}
                  </q-badge>
                </q-td>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  Notify,
  QTableColumn,
  QTableProps,
  useQuasar,
  debounce,
  Dialog,
} from "quasar";
import { useQueryClient } from "@tanstack/vue-query";
import {
  ref,
  computed,
  onMounted,
  watch,
  watchEffect,
  onBeforeUnmount,
  nextTick,
  toRaw,
  shallowRef,
} from "vue";
import {
  showConfirmationDialog,
  showErrorNotification,
  showSuccessNotification,
  showConfirmationInsideModal,
  showConfirmationInsideModal2,
  showErrorNotificationInside,
  showSuccessNotificationInside,
  runWithLoading,
  mostrarNotificacionCorrectoSonido,
  mostrarNotificacionErrorSonido,
} from "@/common/helper/notification";

import { useProductos } from "@/modules/Productos/composables/useProductos";
import { usePedidoDet } from "@/modules/pedidos_det/composables/usePedidosDet";
import { usePedidoStore } from "@/stores/pedido";
import usePedidosEnc from "../../pedidos_enc/composables/usePedidosEnc";
import { useCodigo } from "@/modules/codigo_barras/composables/useCodigo";
import { useTotalStore } from "@/stores/total";
import { useUserStore } from "@/stores/user";
import { useConfiguracionStore } from "@/stores/serie";
import { useSync } from "@/modules/sync/composables/useSync";
import { usePdfFactura } from "@/modules/facturar_pdf/composables/usePdFactura";
import { useFacturasEnc } from "@/modules/facturas_enc/composables/useFacturasEnc";
import { useCertification } from "@/modules/certification/composables/useCertification";
import { useCupones } from "@/modules/cupones/composables/useCupones";
import useFormat from "@/common/composables/useFormat";
import { useStoreSucursal } from "@/stores/sucursal";
import { cleanAllStores } from "@/common/helper/cleanStore";
import { usePdfCotizacion } from "@/modules/cotizacion_pdf/composable/useCotizacion";
import {
  obtenerDetallePedido,
  obtenerPedidoEncPorIdAction,
} from "@/modules/pedidos_enc/action/pedidosEncAction";
import { useClienteStore } from "@/stores/cliente";
import { usePdfTicket } from "@/modules/ticket_pdf/composable/useTicket";
import { db } from "@/db/productosDB";
import { obtenerProductoPorCodigoAction } from "@/modules/codigo_barras/action/codigoAction";
import { PedidosDet } from "@/modules/pedidos_det/interfaces/pedidosDetInterface";
import { FacturaEnc2 } from "@/modules/facturas_enc/interfaces/facturaEnc2Interface";
import { DatosProductoBuscado } from '../interfaces/posInterfaces';
import { useProductosExistencias } from '@/modules/existencias/composables/useExistencias';
import { useProductosExistenciasDirect } from "@/modules/existencias/composables/useExisteciasNoAuth";
import { Empresa } from '../../fel_empresa_establecimiento/interfaces/empresaInterface';
import { Sucursal } from '../../Sucursales/interfaces/sucursalesInterface';
import { Bodega } from '../../bodegas/interfaces/bodegaInterface';
import { Vendedor } from '../../notas_credito/interfaces/NotaCredito';
import { conexion } from '@/helper/networkStatus';
import { useStoreTokenExistencia } from '@/stores/tokenExistencia';

import type { AxiosError } from "axios";

/*
==========================================================
                      COLUMNAS
==========================================================
*/

// Catalogo de productos
const columnasCatalogo: QTableProps["columns"] = [
  {
    name: "codigo",
    label: "Código / Marca",
    align: "left",
    field: "PRODUCT0",
    sortable: true,
    style: "min-width: 200px",
  },
  {
    name: "descripcion",
    label: "Descripción",
    align: "left",
    field: "DESCRIPCION_PROD",
    sortable: true,
    style: "min-width: 300px",
  },
  {
    name: "precio",
    label: "Precio",
    align: "center",
    field: "PRECIO_SUGERIDO",
    sortable: true,
    style: "min-width: 150px",
  },
  {
    name: "niveles",
    label: "Niveles de Precio",
    align: "left",
    field: "niveles",
    sortable: false,
    style: "min-width: 200px",
  },
  {
    name: "cantidad",
    label: "Cantidad",
    align: "center",
    field: "CANTIDAD_PEDIDA",
    sortable: false,
    style: "min-width: 120px",
  },
  {
    name: "accion",
    label: "Acción",
    align: "center",
    field: "accion",
    sortable: false,
    style: "min-width: 120px",
  },
];

// Tabla de Existencias
const columnasExistencias: QTableColumn[] = [
  {
    name: "Producto",
    label: "Código",
    field: "producto",
    align: "left",
    sortable: true,
  },
  {
    name: "Descripcion",
    label: "Descripción",
    field: "Descripcion",
    align: "left",
    sortable: true,
  },
  {
    name: "Lote",
    label: "DescripcionLote",
    field: "DescripcionLote",
    align: "right",
    sortable: true,
  },
  {
    name: "Marca",
    label: "Marca",
    field: "Marca",
    align: "right",
    sortable: true,
  },
];

/*
==========================================================
                      PROPS
==========================================================
*/

const props = defineProps({
  pedidoId: {
    type: [Number, null],
    required: false,
    default: null,
  },
  onNuevoPedido: {
    type: Function,
    required: true,
  },
  tipoPedido: {
    type: String,
    required: true,
  },
});

const idPedidoEnc = computed(() => props.pedidoId);
const tipoPedido = computed(() => props.tipoPedido);

// Emits
const emit = defineEmits(["updateEstado"]);

const updateEstadoPedido = (nuevoEstado) => {
  emit("updateEstado", nuevoEstado);
};

/*
==========================================================
                  COMPOSABLES FUNCTIONS
==========================================================
*/

const { mutateAgregarContingencia } = useFacturasEnc();
const { formatNumber, formatCurrency } = useFormat();
const storeSucursal = useStoreSucursal();
const { mutateAplicarCupon } = useCupones();
const contingencia = ref(false);
const { mutateCertificar, mutateFacturaContingencia } = useCertification();
const { obtenerDetalleFactura, obtenerFacturaId3, obtenerDetalleFactura3 } =
  useFacturasEnc();
const { generarFacturaPDF } = usePdfFactura();
const { mutateCrearSincronizacion } = useSync();
const {
  mutateCrearPedidoDet,
  useListaProductosPedidoDet,
  obtenerPedidosDetID,
} = usePedidoDet();
const configuracionStore = useConfiguracionStore();
const { mutateCrearFacturaEnc2 } = useFacturasEnc();
const { obtenerPedidoPorId, obtenerPedidosPendientes } = usePedidosEnc();
const {
  todosProductos,
  refetchTodosProductos,
  obtenerProductosId,
  precioReal,
  loadingProductos: loadingProductosQuery,
  fetchingProductos,
  errorProductos,
} = useProductos();
const buscarCodigo = ref("2774651818380");
const $q = useQuasar();
const filtroExistencias2 = ref(''); // Filtro para buscar productos en existencias
const { mutateAnularPedidoPendiente } = usePedidosEnc();
const { generarCotizacionPDF } = usePdfCotizacion();
const clienteStore = useClienteStore();
const { nombreVendedor } = useUserStore();
const { totalItems } = useTotalStore();
const userStore = useUserStore();
const totalStore = useTotalStore();
const { generarTicketPDF } = usePdfTicket();
const paramsBase = ref({  // Parametros para consultar existencias
   empresa: 'GS',
   bodega: Number(storeSucursal.codigoBodega),
   vendedor: userStore.codigoVendedor,
   sucursal: Number(storeSucursal.idSucursal),
   producto: null,
   lote: null
})

const paramsBase2 = ref({  // Parametros para consultar existencias
   empresa: 'GS',
   bodega: Number(storeSucursal.codigoBodega),
   vendedor: userStore.codigoVendedor,
   sucursal: Number(storeSucursal.idSucursal),
   producto: filtroExistencias2.value,
   lote: null
})

//USE COMPOSABLES
const tokenExistencias = useStoreTokenExistencia();
const { existenciaProducto, errorExistencias, refetchExistenciaProducto, loteProducto, refetchLoteProducto, existenciaBodega, refetchExistenciasBodegas, tokenData, errorToken, obtenerToken, obtenerTokenAsync } = useProductosExistencias(paramsBase); // Existencias
const {existenciaProductoDirect, errorExistenciasDirect, refetchExistenciaProductoDirect } = useProductosExistenciasDirect(paramsBase2); // Existencias sin auth

const { data: pedidoData, refetchObtenerPedidoID } =
  obtenerPedidoPorId(idPedidoEnc);
const { refetch: refetchObtenerPedidoDetID } =
  useListaProductosPedidoDet(idPedidoEnc);

const modalFacturacion = ref(false);
const modalCuponazo = ref(false);

/*
==========================================================
                VARIABLES GENERALES
==========================================================
*/
const productoBuscar = ref(''); // Producto a buscar en existencias
const allowAutoFocusProduct = ref(true); // Controla si el input de código puede auto-enfocarse
const btnConfirmarFactura = ref(null);
const calcularCambio = ref(0);
const cantidad = ref(1); // Cantidad en el boton
const cantidad2 = ref(1); // para cantidad
const cantidadDialog = ref(1); // Cantidad en el dialog
const cantidadInputs = ref({}); // Referencias a los inputs de cantidad en el catálogo
const clave = ref("");
const codigoProducto = ref("");
const cupon = ref("");
const detallesPedido = ref([]);
const filtroProductos = ref("");
const focusCantidad = ref(null); // focus modal cantidad
const focusEfectivo = ref(null); // focus efectivo
const focusTarjeta = ref(null);
const idFacturaEnc = ref(null); // ID de la factura creada
const inputCodigo = ref(null);
const loadingAgregar = ref(false);
const loadingDetalle = ref(false);
const loadingPorCodigo = ref(false);
const loadingProductos = ref(false);
const modalProductos = ref(false);
const modalProductos2 = ref(false);
const montoTarjeta = ref(null);
const modalExistencias = ref(false);
const modalExistencias2 = ref(false);
const montoEfectivo = ref(null);
const filtroProductosExistencias = ref("");
const productoSeleccionado = ref(null);
const loteSeleccionado = ref(null);
// const opcionesPago2 = ["EFECTIVO", "TARJETA", "MIXTO"]; // Ya no se necesita para el btn-group
const tipoPago = ref("EFECTIVO");
const errorAgregarProducto = ref(false);
const refCupon = ref();
const pedidoStore = usePedidoStore();
const { consultarCodigoM } = useCodigo();
const queryClient = useQueryClient();
const descripcionProd = ref("");
const subtotalCalculado = ref(0);
const espera = ref(null); // guarda el timeout
const nuevosDatos = ref<DatosProductoBuscado | undefined>(); // Mostrar info del producto
const productosCacheados = shallowRef([]);
const { obtenerProducto } = useCodigo();
const { data: productoEncontrado, refetch: refetchProducto } = obtenerProducto(filtroProductos);
const productoCodigoExistencia = ref<any[]>([]); // Productos encontrados por codigo en existencias

// Paginación del catálogo
const paginacionCatalogo = ref({
  sortBy: "PRODUCTO",
  descending: false,
  page: 1,
  rowsPerPage: 50,
});

const buscadorProductoRef = ref(null);
const totalAnterior = ref(0);

/*
==========================================================
                    VARIABLES COMPUTED
==========================================================
*/

// Facturación - cálculos y validaciones
const totalAPagar = computed(() =>
  Number(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0)
);
const montoEfectivoNum = computed(() => Number(montoEfectivo.value) || 0);
const montoTarjetaNum = computed(() => Number(montoTarjeta.value) || 0);

const sumaPago = computed(() => {
  if (tipoPago.value === "EFECTIVO") return montoEfectivoNum.value;
  if (tipoPago.value === "TARJETA") return montoTarjetaNum.value;
  return montoEfectivoNum.value + montoTarjetaNum.value;
});
const faltantePago = computed(() =>
  Math.max(0, totalAPagar.value - sumaPago.value)
);
const cambioPago = computed(() =>
  Math.max(0, sumaPago.value - totalAPagar.value)
);
const isPagoValido = computed(
  () => sumaPago.value >= totalAPagar.value && totalAPagar.value > 0
);

// Referencia y helper para enfocar botón Confirmar
const focusBtnConfirmar = async () => {
  await nextTick();
  if (btnConfirmarFactura.value && btnConfirmarFactura.value.$el) {
    btnConfirmarFactura.value.$el.focus();
  }
};

/*
==========================================================
                WATCHS Y WATCH EFFECTS
==========================================================
*/

watch(todosProductos, async (nuevos, anteriores) => {
  if (!nuevos || nuevos.length === 0) return;

  // Evitar reescritura innecesaria
  if (anteriores && nuevos.length === anteriores.length) return;

  try {
    await db.productos.clear();

    // Convertir a objetos planos
    const productosPlanos = nuevos.map((p) => JSON.parse(JSON.stringify(p)));

    await db.productos.bulkPut(productosPlanos);

    //console.log("Productos guardados en IndexedDB:", productosPlanos.length);
    productosCacheados.value = productosPlanos;
  } catch (err) {
    //console.error("Error guardando en IndexedDB:", err);
  }
});

// focus en modal cupon
watch(modalCuponazo, (val) => {
  if (val)
    nextTick(() => {
      refCupon.value?.$el.querySelector("input")?.select();
    });
});

//cargar productos en factura
watch(modalFacturacion, (val) => {
  if (val) {
    refetchProductosFactura();
  } else {
    // Resetear tipo de pago a efectivo cuando se cierre el modal
    tipoPago.value = "EFECTIVO";
    // Limpiar montos
    montoEfectivo.value = null;
    montoTarjeta.value = null;
  }
});

// cargar nuevos productos
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    refetchObtenerPedidoID();
  }
});

// actualizar cliente en facturacion
watch(pedidoData, () => {
  refetchObtenerPedidoID();
});

// si el efectivo cambia, calcular cambio
watch(montoEfectivo, (nuevoValor) => {
  if (nuevoValor !== null && nuevoValor >= 0) {
    calcularCambioModal();
  } else {
    calcularCambio.value = 0;
  }
});

// si el tarjeta cambia, calcular cambio
watch(montoTarjeta, (nuevoValor) => {
  if (nuevoValor !== null && nuevoValor >= 0) {
    calcularCambioModal();
  } else {
    calcularCambio.value = 0;
  }
});

// focus desde mixto
watch(tipoPago, async (nuevo) => {
  if (nuevo === "EFECTIVO") {
    await nextTick();
    focusEfectivo.value?.focus();
  } else if (nuevo === "MIXTO") {
    await nextTick();
    focusEfectivo.value?.focus();
  } else if (nuevo === "TARJETA") {
    // asignar el total a pagar al monto de tarjeta para no ser digitado manualmente
    montoTarjeta.value = totalAPagar.value;
    await nextTick();
    focusTarjeta.value?.focus();
  }
});
// limpiar campos de pago
watch(tipoPago, (nuevo) => {
  if (nuevo === "EFECTIVO") {
    montoTarjeta.value = null;
  } else if (nuevo === "TARJETA") {
    montoEfectivo.value = null;
  } else if (nuevo === "MIXTO") {
    montoEfectivo.value = null;
    montoTarjeta.value = null;
  }
});
// mantener focus y limpiar referencias cuando se cierre el modal
watch(modalProductos2, async (val) => {
  try {
    if (val) {
      // Cuando se abre el modal, asegurar que los productos estén cargados
      // await refetchTodosProductos();
      // Reinicializar cantidadInputs cuando se abre el modal
      if (cantidadInputs && cantidadInputs.value) {
        cantidadInputs.value = {};
      }

      // Enfocar el buscador después de que el modal esté completamente renderizado
      await nextTick();
      nextTick(() => {
        if (buscadorProductoRef.value) {
          buscadorProductoRef.value.focus();
          buscadorProductoRef.value.select();
        }
      });
    } else {
      if (allowAutoFocusProduct.value) enfocarCodigo();
      // Limpiar referencias de inputs cuando se cierre el modal
      if (cantidadInputs && cantidadInputs.value) {
        cantidadInputs.value = {};
      }
    }
  } catch (error) {
    //console.error("Error in modalProductos2 watch:", error);
  }
});

onMounted(async () => {
  try {
    const cache = await db.productos.limit(1000).toArray();
    if (cache.length > 0) {
      // productos ya vienen planos, pero hacemos spread por seguridad
      productosCacheados.value = cache.map((p) => ({ ...p }));
      //console.log("Productos cargados desde IndexedDB:", cache.length);
    }
  } catch (err) {
    // console.error("Error leyendo de IndexedDB:", err);
  }
});

const buscarProducto = async () => {
  refetchProducto();

  if (productoEncontrado.value?.PRODUCT0) {
    filtroProductos.value = productoEncontrado.value.PRODUCT0;
    console.log("Producto encontrado:", productoEncontrado.value.PRODUCT0);
  } else {
    showErrorNotificationInside(
      "No encontrado",
      "El Producto no pudo ser encontrado"
    );
  }
};

// filtro del catalogo
const productosFiltrados2 = computed(() => {
  if (!filtroProductos.value) return productosUnicos.value.slice(0, 100); // no más de 500

  const palabras = filtroProductos.value
    .toLowerCase()
    .split(" ")
    .filter(Boolean);

  return productosUnicos.value
    .filter((p) => {
      const campos = `${p.DESCRIPCION_PROD || ""} ${
        p.DESCRIPCION_MARCA || ""
      } ${p.PRODUCT0 || ""}`.toLowerCase();
      return palabras.every((palabra) => campos.includes(palabra));
    })
    .slice(0, 500); // cortar después del filtro
});

// Mapear los productos para mostrar un registro en la tabla
const productosUnicos = computed(() => {
  //  if (!todosProductos.value) return [];
  if (!productosCacheados.value) return [];

  // Para evitar duplicados
  const mapa = new Map();

  for (const prod of todosProductos.value) {
    const clave = prod.PRODUCT0;

    const nivelTexto = `${formatCurrency(
      prod.PRECIO_FINAL,
      3
    )} ( ${formatNumber(Number(prod.CANTIDAD_INICIAL))} a ${formatNumber(
      Number(prod.CANTIDAD_FINAL)
    )} )`;

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        ...prod,
        niveles: [nivelTexto],
      });
    } else {
      mapa.get(clave).niveles.push(nivelTexto);
    }
  }

  return Array.from(mapa.values());
});

/*
==========================================================
                      FUNCIONES
==========================================================
*/

// Busqueda Automatica
const busquedaAutomatica = () => {
  buscarDescripcion();
  // if (espera.value) clearTimeout(espera.value); // limpiar tiempo

  // if (codigoProducto.value.length > 0) {
  //   espera.value = setTimeout(() => {
  //   }, 500);
  // }
};

// Mostrar la descripcion del producto
const buscarDescripcion = async () => {
  if (codigoProducto.value.trim() == "") {
    nuevosDatos.value = null;
    return;
  }
  try {
    let prod = null; // Tiene el precio del producto
    let codigoFinal = codigoProducto.value; // Tiene el codigo a buscar descripcion
    let mensajeError: string = "";

    // 1. Intentar con el código ingresado
    await precioReal(codigoProducto.value, cantidad2.value)
      .then((res) => {
        prod = res;
      })
      .catch(async (errPrecio: Error) => {
        mensajeError += `${errPrecio.message}`;

        // 2. Si no existe → intentar con PRODUCT0 alterno
        await obtenerProductoPorCodigoAction(codigoProducto.value)
          .then(async (res) => {
            await precioReal(res.PRODUCT0, cantidad2.value)
              .then((res2) => {
                prod = res2;
                codigoFinal = res.PRODUCT0;
              })
              .catch((errorPrecioMP: Error) => {
                mensajeError += ` PR-Real ${errorPrecioMP.message}`;
              });
          })
          .catch(async (errorProd: Error) => {
            prod = null;
            // mostrarNotificacionErrorSonido(error.message);
          });
      });

    // 3. Si aún no hay prod → salir
    if (!prod) {
      const productoError: DatosProductoBuscado = {
        encontrado: false,
        codigo: codigoProducto.value, // No se muestra en pantalla
        descripcion: `${mensajeError}`,
        precio: 0,
        subtotal: 0,
      };
      nuevosDatos.value = productoError;
      // nuevosDatos.value = null;
      return;
    }

    // 4. Obtener descripción
    const nuevaDescripcion = await obtenerProductosId(codigoFinal);

    nuevosDatos.value = {
      encontrado: true,
      codigo: codigoFinal, // No se muestra en pantalla
      descripcion: nuevaDescripcion.DESCRIPCION_PROD,
      precio: prod.PRECIO_FINAL,
      subtotal: prod.PRECIO_FINAL * cantidad2.value,
    };
  } catch (error) {
    nuevosDatos.value = null;
  }
};

const filtroExistencias = (rows, terms) => {
  const term = terms.toLowerCase();
  return rows.filter(
    (r) =>
      r.Producto.toLowerCase().includes(term) ||
      r.Descripcion.toLowerCase().includes(term) ||
      r.Codigo?.toLowerCase().includes(term)
  );
};

// Después de las otras variables (línea ~160)
const productoSeleccionadoTemp = ref(null);
const opcionesProductosFiltrados = ref([]);

// Función para filtrar en el select
const filtrarProductosSelect = (val, update) => {
  if (val === "") {
    update(() => {
      opcionesProductosFiltrados.value = productosExistencias3.value.map(
        (p) => ({
          ...p,
          label: `${p.Producto} - ${p.Descripcion}`,
        })
      );
    });
    return;
  }

  update(() => {
    // Dividir la búsqueda en palabras separadas y limpiarlas
    const palabras = val
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0);

    opcionesProductosFiltrados.value = productosExistencias3.value
      .filter((p) => {
        // Crear un string con todos los campos buscables
        const textoBuscable = `${p.Producto} ${p.Descripcion} ${
          p.Marca || ""
        }`.toLowerCase();

        // Verificar que TODAS las palabras estén presentes (búsqueda AND)
        return palabras.every((palabra) => textoBuscable.includes(palabra));
      })
      .map((p) => ({
        ...p,
        label: `${p.Producto} - ${p.Descripcion}`,
      }));
  });
};

// Función para seleccionar desde el select
const seleccionarProductoDesdeSelect = async (producto) => {
  if (!producto) return;

  await seleccionarProducto(producto.Producto);
  productoSeleccionadoTemp.value = null; // Limpiar el select después de seleccionar
};

const loadingBodegas = ref(false);
const LotesExistentes = ref<any[]>([]);

// Tomar producto
const seleccionarProducto = async (producto) => {
  try {
    productoSeleccionado.value = producto; // Asignamos el producto
    //console.log('Producto seleccionado lo tengo:', productoSeleccionado.value)
    paramsBase.value.producto = producto; // Setear el producto

    await nextTick();

    $q.loading.show({
      message: `Cargando lotes de ${producto}...`,
      spinnerColor: "primary",
      spinnerSize: 40,
    });

    // Esperar los Lotes
    const { data } = await refetchLoteProducto();
    //console.log('Datos de lotes recibidos:', data)

    LotesExistentes.value = data.ProductosLote;
    //console.log('Lotes listos para tabla:', LotesExistentes.value)
  } catch (error) {
    //console.error('Error cargando lotes:', error)
    $q.notify({
      color: "negative",
      message: "Error cargando los lotes del producto",
      position: "top",
    });
  } finally {
    $q.loading.hide();
  }
};

const datosExistencias = ref<any[]>([]);

const verExistencias = async (lote) => {
  try {
    $q.loading.show({
      message: `Consultando existencias del lote ${lote}...`,
      spinnerColor: "primary",
      spinnerSize: 40,
    });
    loteSeleccionado.value = lote; // Asignamos el lote
    // Setear el lote
    paramsBase.value.lote = lote.trim();
    //console.log('yo tengo al señor lote:', lote)
    //console.log('Desde param base ya llevo el producto en existencias:', paramsBase.value)

    await nextTick();

    const { data } = await refetchExistenciasBodegas();
    //console.log('Datos de existencias en bodegas recibidos:', data)
    datosExistencias.value = data.Existencias;
    //console.log('Existencias en bodegas listos para tabla:', datosExistencias.value)
  } catch (error) {
    //console.error('Error cargando las existencias:', error)
    $q.notify({
      color: "negative",
      message: "Error cargando las existencias en otras bodegas",
      position: "top",
    });
  } finally {
    $q.loading.hide();
  }
};

const resetearSeleccion = () => {
  productoSeleccionado.value = null
  loteSeleccionado.value = null
  paramsBase.value.producto = null
  paramsBase.value.lote = null
  paramsBase2.value.producto = null
}

// Mapear los productos desde existenciaProducto
const productosExistencias3 = computed(() => {
  try {
    if (!existenciaProducto.value) return [];

    // Si ya hay data, devuelve solo el array interno de productos
    return existenciaProducto.value.Productos;
  } catch (error) {
    console.error("Error al acceder a existenciaProducto:", error);
    return { error };
  }
});

// Columnas
const columnasProductos: QTableColumn[] = [
  {
    name: "Producto",
    label: "Código",
    field: "Producto",
    align: "left",
    sortable: true,
  },
  {
    name: "Descripcion",
    label: "Descripción",
    field: "Descripcion",
    align: "left",
    sortable: true,
  },
  {
    name: "Marca",
    label: "Marca",
    field: "Marca",
    align: "left",
    sortable: true,
  },
  { name: "acciones", label: "Ver Lotes", field: "acciones", align: "left" },
];

const columnasLotes: QTableColumn[] = [
  {
    name: "Producto",
    label: "Producto",
    field: "Producto",
    align: "left",
    sortable: true,
  },
  {
    name: "Descripcion",
    label: "Descripcion",
    field: "Descripcion",
    align: "left",
    sortable: true,
  },
  {
    name: "Descripcion",
    label: "Lote",
    field: "DescripcionLote",
    align: "left",
    sortable: true,
  },
  { name: "Cantidad", label: "Cantidad", field: "Disponible", align: "center" },
  {
    name: "acciones",
    label: "Otras Bodegas",
    field: "acciones",
    align: "left",
  },
];

const columnasBodegas: QTableColumn[] = [
  {
    name: "Bodega",
    label: "Bodega",
    field: "Bodega",
    align: "left",
    sortable: true,
  },
  {
    name: "Nombre",
    label: "Nombre",
    field: "Nombre",
    align: "left",
    sortable: true,
  },
  {
    name: "Disponible",
    label: "Disponible",
    field: "Disponible",
    align: "center",
    sortable: true,
  },
];

// Si se actualiza cantidad
watch(cantidad2, async () => {
  if (codigoProducto.value.length > 0) {
    await buscarDescripcion();
  }
});

const cantidadIngresada = (producto) => {
  if (!producto.CANTIDAD_PEDIDA || producto.CANTIDAD_PEDIDA <= 0) {
    showErrorNotificationInside("Cantidad", "Ingrese una cantidad válida");
    return;
  }
};

// Función para refrescar productos en facturación
const refetchProductosFactura = async () => {
  try {
    await refetchObtenerPedidoID();
    await refetchObtenerPedidoDetID();
  } catch (error) {
    //console.error("Error al refrescar productos en facturación:", error);
  }
};

//Recargar Existencias

const recargarExistencias = async () =>{

    $q.loading.show({
      message: "Actualizando Existencias",
      spinnerColor: "green",
      spinnerSize: 50,
    });

  try{
    await refetchExistenciasBodegas()
  }
  catch(error){
    $q.notify({
      type: "negative",
      message: "Error al refrescar existencias",
      position: "top-right",
      timeout: 3000,
      icon: "error",
    });
  }
  finally{
    $q.loading.hide();
  }
}

// Confirmar la contigencia
const confirmarContingencia = async () => {
  if (contingencia.value) {
    const confirmado = await showConfirmationInsideModal2(
      "Confirmar Contingencia",
      "¿Estás seguro de que deseas activar el modo de contingencia?"
    );
    if (!confirmado) {
      contingencia.value = false;
      return;
    }
  }

  if (contingencia.value) {
    $q.notify({
      type: "warning",
      message: "Modo de contingencia activado",
      position: "top-right",
      color: "red-6",
      timeout: 3000,
      icon: "warning",
    });
  } else {
    $q.notify({
      type: "info",
      message: "Modo de contingencia desactivado",
      position: "top-right",
      color: "blue-6",
      timeout: 3000,
      icon: "info",
    });
  }
};

// Cupon
const aplicarCuponazo = () => {
  const datosCupon = {
    numero_cupon: cupon.value,
    id_pedido_enc: pedidoStore.idPedidoEnc,
    usuario: clave.value,
  };

  // Guardar el total ANTES de aplicar el cupón para calcular el descuento
  const totalAntesDelCupon = pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0;

  mutateAplicarCupon(datosCupon, {
    onSuccess: async (res) => {
      // Establecer el total anterior ANTES de refrescar los datos
      totalAnterior.value = totalAntesDelCupon;

      // Refrescar datos del pedido para obtener el nuevo total
      await refetchObtenerPedidoID();

      // Verificar que realmente se aplicó un descuento
      const nuevoTotal = pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0;
      const descuentoAplicado = totalAntesDelCupon - nuevoTotal;

      // Actualizar el store con el nuevo total
      totalStore.setTotal(nuevoTotal);

      $q.notify({
        type: "positive",
        message: `Cupón aplicado exitosamente. Descuento: ${formatCurrency(
          descuentoAplicado,
          2
        )}`,
        position: "top-right",
        timeout: 4000,
        icon: "check",
      });

      modalCuponazo.value = false;
      clave.value = "";
      cupon.value = "";
      enfocarEfectivo();
    },
    onError: (error) => {
      showErrorNotificationInside("Error", error.message);
      nextTick(() => {
        refCupon.value?.focus();
        refCupon.value?.select();
        refetchObtenerPedidoID();
      });
    },
  });

  enfocarEfectivo();
};

// focus al Efectivo
const enfocarEfectivo = async () => {
  await nextTick();
  focusEfectivo.value?.focus();
};

// focus en modal cupon
watch(modalCuponazo, (val) => {
  if (val)
    nextTick(() => {
      refCupon.value?.$el.querySelector("input")?.select();
    });
});

//cargar productos en factura
watch(modalFacturacion, (val) => {
  if (val) {
    refetchProductosFactura();
  } else {
    // Resetear tipo de pago a efectivo cuando se cierre el modal
    tipoPago.value = "EFECTIVO";
    // Limpiar montos
    montoEfectivo.value = null;
    montoTarjeta.value = null;
  }
});

// cargar nuevos productos
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    refetchObtenerPedidoID();
  }
});

// actualizar cliente en facturacion
watch(pedidoData, () => {
  refetchObtenerPedidoID();
});

watch(modalProductos, async (val) => {
  if (val) {
    try {
      loadingProductos.value = true;
      // await refetchTodosProductos();
    } catch (error) {
      $q.notify({
        type: "negative",
        message: "Error al cargar productos",
      });
    } finally {
      loadingProductos.value = false;
    }
  }
});

// si el efectivo cambia, calcular cambio
const calcularCambioModal = () => {
  if (tipoPago.value === "MIXTO") calcularCambio.value = 0;
  else {
    calcularCambio.value = montoEfectivo.value - totalStore.totalGeneral;
  }
};

// Despues del cantidad volver al focus del input
const volverAFocusInput = () => {
  setTimeout(() => {
    if (!allowAutoFocusProduct.value) return;
    inputCodigo.value?.focus();
  }, 100);
};

// focus
const enfocarCodigo = () => {
  if (!allowAutoFocusProduct.value) return;
  inputCodigo.value?.focus();
};

// usar F4
const usarF4 = (e) => {
  if (e.key === "F4") {
    e.preventDefault();
    terminarVenta();
  }
};

const usarF1 = (e) => {
  if (e.key === "F1") {
    e.preventDefault();
    abrirCatalogo2();
  }
};

// limpiar pedido
const usarDelete = (e) => {
  if (e.key === "Delete") {
    e.preventDefault();
    limpiar();
  }
};

// usar multiplicador
const usarMultiplicador = (e) => {
  if (e.key === "*") {
    e.preventDefault();
    abrirModalCantidad();
  }
};

// aumentar cantidad en input de código
const aumentarCantidadInput = () => {
  cantidad2.value = (cantidad2.value || 1) + 1;
};

// disminuir cantidad en input de código
const disminuirCantidadInput = () => {
  const nuevaCantidad = (cantidad2.value || 1) - 1;
  cantidad2.value = Math.max(1, nuevaCantidad); // No permitir cantidades menores a 1
};

const truncateDosDecimales = (numero) => {
  return Math.trunc(numero * 100) / 100;
};

// Preparar actualizacion para pedido
const prepararDataCotizacion = async (idPedido) => {
  const apiResponseDetallePedido = await obtenerDetallePedido(idPedido);
  const pedidoEnc = await obtenerPedidoEncPorIdAction(idPedido);

  const items = apiResponseDetallePedido.map((item) => {
    return {
      cantidad: item.CANTIDAD_PEDIDA,
      descripcion: item.DESCRIPCION_PROD,
      precio: formatCurrency(item.PRECIO_UNIDAD_VENTA, 2),
      subtotal: formatCurrency(item.SUBTOTAL_VENTAS + item.MONTO_IVA, 2),
    };
  });

  // calcular la cantidad y el sbutotal
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + parseFloat(item.subtotal.replace("Q.", "")),
    0
  );

  const dataCotizacion = {
    encabezado: {
      numeroInterno: `${pedidoStore.numeroDePedido}`,
      tipoDocumento: "COTIZACION",
      fechaEmision: formatearFecha(pedidoEnc.FECHA_PEDIDO),
    },

    observacion: "",

    cliente: {
      nombre: clienteStore.nombre,
      nit: String(clienteStore.documento ?? "CF"),
      direccion: clienteStore.direccion,
    },

    items,

    resumen: {
      subtotal: formatCurrency(subtotal, 2),
      totalPagar: formatCurrency(totalStore.totalGeneral, 2),
      totalItems,
    },
    nombreVendedor: nombreVendedor,
  };

  return dataCotizacion;
};

const imprimirCotizacion = async () => {
  if (pedidoStore.numeroDePedido <= 0) {
    $q.notify({
      type: "warning",
      message: "Crear una cotización para imprimir.",
      position: "top",
      color: "orange-8",
      timeout: 3000,
    });
    return;
  }

  if (!totalStore) {
    $q.notify({
      type: "warning",
      message: "Agregue un producto antes de imprimir la cotización.",
      position: "top",
      timeout: 3000,
    });
    return;
  }

  try {
    $q.loading.show({
      message: "Imprimiendo cotización",
      spinnerColor: "green",
      spinnerSize: 50,
    });

    const datosCotizacion = await prepararDataCotizacion(
      pedidoStore.idPedidoEnc
    );

    const success = await generarCotizacionPDF(datosCotizacion);

    if (success) {
      //console.log("Cotización generada con exito.")
    } else {
      //console.log("Fallo al genera cotización.")
    }

    $q.loading.hide();
  } catch (error) {
    showErrorNotification("Error", error);
  } finally {
    $q.loading.hide();
  }
};

const limpiarPedido = async () => {
  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification("Error", "No hay un pedido seleccionado");
    return;
  }

  const confirmado = await showConfirmationDialog(
    `Limpiar ${tipoPedido.value}`,
    `¿Estás seguro de que deseas limpiar ${
      tipoPedido.value === "pedido"
        ? "el " + tipoPedido.value
        : "la " + tipoPedido.value
    }?`
  );

  if (confirmado) {
    cleanAllStores();
    updateEstadoPedido("pedido");
  }
};

// anular pedido
const limpiar = async () => {
  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification(
      "Error",
      "No existe un pedido o cotización para anular"
    );
    return;
  }

  const confirmado = await showConfirmationDialog(
    `Anular ${tipoPedido.value}`,
    `¿Estás seguro de que deseas anular ${
      tipoPedido.value === "pedido"
        ? "el " + tipoPedido.value
        : "la " + tipoPedido.value
    }?`
  );

  if (confirmado) {
    mutateAnularPedidoPendiente(
      {
        id: Number(pedidoStore.idPedidoEnc),
        usuario: String(userStore.nombreVendedor || ""),
      },
      {
        onSuccess: () => {
          $q.notify({
            type: "positive",
            message: `Anulado con éxito`,
            position: "top-right",
            timeout: 3000,
            icon: "check",
          });
        },
      }
    );

    cleanAllStores();
    updateEstadoPedido("pedido");
  }
};

// modal cuponazo
const abrirCuponazo = async () => {
  modalCuponazo.value = true;

  await nextTick();

  refCupon.value?.focus();
};

// nuevo catalogo
const abrirCatalogo2 = async () => {
  $q.loading.show({
    message: "Cargando productos...",
    spinnerColor: "green",
    spinnerSize: 50,
  });

  try {
    modalProductos2.value = true;

    $q.loading.hide();
  } catch (error) {
    //console.error("Error al cargar productos:", error);
    showErrorNotification("Error", "No se pudieron cargar los productos");
  }
};

const BuscarExistenciaProducto = async () => {
  
  $q.loading.show({
    message: "Buscando productos...",
    spinnerColor: "green",
    spinnerSize: 50,
  });
  
  try {
    
  paramsBase2.value.producto = (filtroExistencias2.value || '').trim()
  
  const res = await refetchExistenciaProductoDirect()
  productoCodigoExistencia.value = res.data?.ProductosLote ?? []

    
  }
  catch (error) {
    showErrorNotification("Error", "Existencia no encontrada")
  } finally {
    $q.loading.hide();
  }
}

const abrirExistencia2 = async () => {
  modalExistencias2.value = true;
}

const abrirExistencia = async () => {
  $q.loading.show({
    message: "Cargando productos...",
    spinnerColor: "green",
    spinnerSize: 50,
  });

  try {
    modalExistencias.value = true;
    $q.loading.hide();
  } catch (error) {
    //showErrorNotification("Error", "No hay conexion a Internet")
  }
};

const recargarConexionExistencias = async () => {
  $q.loading.show({
    message: "Revisando conexión...",
    spinnerColor: "green",
    spinnerSize: 50,
  });

  try {
    // Primer intento de consulta
    const { data, error } = await refetchExistenciaProducto();

    console.log("¿Hay error?", error);

    if (error) {
      console.error(" Error en recarga de existencias:", error);
      
      // Si hay error, generar nuevo token
      $q.loading.show({
        message: "Regenerando token...",
        spinnerColor: "orange",
        spinnerSize: 50,
      });

      // Obtener nuevo token
      const nuevoTokenData = await obtenerTokenAsync();
      
      console.log(" Nuevo token obtenido:", nuevoTokenData);
      console.log(" Token:", nuevoTokenData.Token);

      // Guardar el nuevo token en el store
      tokenExistencias.setTokenExistencia(nuevoTokenData.Token);
      
      console.log(" Token actualizado en el store:", tokenExistencias.tokenExistencia);

      // Cambiar mensaje del loading
      $q.loading.show({
        message: "Reintentando consulta...",
        spinnerColor: "blue",
        spinnerSize: 50,
      });

      // reintentar
      // El interceptor de webApiAuth ya tiene el nuevo token del store
      await refetchExistenciaProducto();

      // Si llegamos aquí, significa que la reconsulta fue exitosa
      console.log("Existencias actualizadas con nuevo token");
      showSuccessNotificationInside(
        "Conexión",
        "Existencias actualizadas correctamente."
      );
    } else if (data) {
      // Si no hay error en el primer intento, todo OK
      console.log("Existencias OK (primer intento):", data);
      showSuccessNotificationInside(
        "Conexión",
        "Existencias actualizadas correctamente."
      );
    }
  } catch (err) {
    showErrorNotificationInside("Error", "No hay conexión a internet");
  } finally {
    $q.loading.hide();
  }
};

const abrirModalCantidad = () => {
  Dialog.create({
    title: "Cantidad",
    message: "Ingrese la cantidad del producto",
    prompt: {
      type: "number",
      model: null,
    },
  })
    .onOk((resul: number) => {
      // Confirmado
      if (resul >= 1) {
        cantidad2.value = resul;
      }
    })
    .onCancel(() => {
      // Cancelado
    })
    .onDismiss(() => {
      // Cerrado
    });
};

// FUNCIONES GENERALES

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const certificarFactura = async (id) => {
  // Obtener datos de la factura
  const factura = await obtenerFacturaId3(id);
  // Mostrar loading para certificación
  $q.loading.show({
    message: "Certificando factura...",
    spinnerColor: "green",
    spinnerSize: 50,
  });

  // Usar Promise para manejar la mutación de certificación
  mutateCertificar(
    {
      sucursal: storeSucursal.idSucursal,
      serie: factura.SERIE,
      numero: factura.NUMERO_FACTURA,
    },
    {
      onSuccess: async (data) => {
        // Ocultar loading antes de imprimir
        $q.loading.hide();

        // Si se certifica la factura, se debe de sincronizar
        await mutateCrearSincronizacion(id);

        await imprimirFactura(data);

        $q.notify({
          type: "positive",
          message: "Factura certificada con exito  " + data.Uuid,
          position: "top-right",
          timeout: 3000,
          icon: "check",
        });
      },

      onError: async (error) => {
        //console.error("Error en certificación:", error);
        $q.loading.hide();

        $q.notify({
          type: "negative",
          message: `Error en certificación: ${error.message}, imprimiendo en contingencia`,
          position: "top-right",
          timeout: 5000,
          icon: "error",
        });

        contingencia.value = true;

        await mutateAgregarContingencia(id);

        nextTick();

        await imprimirFactura(id);
      },
    }
  );
};

// modal factura
const terminarVenta = async () => {
  await nextTick(); // Cargar los productos

  // si no existe pedido
  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification(
      "No existe un pedido",
      "Debes de crear un pedido primero"
    );
    return;
  }
  modalFacturacion.value = true;
};

// Guarda factura enc y det
const confirmarFactura = async () => {
  if (!configuracionStore.serieSeleccionada) {
    modalFacturacion.value = false;
    showErrorNotification(
      "No hay serie",
      "No se detectó una serie de facturacion, asigne uno en menu/configuracion "
    );
    return;
  }

  // modal confirmacion factura
  const datos: FacturaEnc2 = {
    ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
    USUARIO_QUE_FACTURA: userStore.nombreVendedor,
    SERIE: configuracionStore.serieSeleccionada,
    ES_CONTINGENCIA: contingencia.value,
  };

  // Capturar el cambio actual antes de que muten estados
  const cambioCapturado = cambioPago.value;

  // Mostrar loading manualmente para evitar timeout
  $q.loading.show({
    message: "Facturando...",
    spinnerColor: "primary",
    spinnerSize: 50,
  });

  mutateCrearFacturaEnc2(datos, {
    onSuccess: async (respuesta) => {
      modalFacturacion.value = false;

      // Guardar último cambio para mostrarlo en clienteform luego de cerrar el modal
      totalStore.setUltimoCambio(cambioCapturado);

      // Ocultar loading antes de certificar
      $q.loading.hide();

      // Asignar este valor para llenar la factura
      idFacturaEnc.value = respuesta.ID_FACTURA_ENC;
      // Ahora sí espera a que termine la certificación

      if (contingencia.value === true) {
        // Aumentar contingencia
        await mutateAgregarContingencia(idFacturaEnc.value);
        await imprimirFactura(respuesta);
        return;
      } else {
        await certificarFactura(respuesta.ID_FACTURA_ENC);
      }
    },
    onError: (error) => {
      //console.error("Error creando factura:", error);
      modalFacturacion.value = false;
      $q.loading.hide();
    },
  });

  // LIMPIAR STORES DESPUÉS DE COMPLETAR EXITOSAMENTE
  // Esto se ejecuta solo si todo el proceso de facturación fue exitoso
  cleanAllStores();
};

// modal generar ticket rompefilas
const terminarPedidoRompefilas = async () => {
  await nextTick(); // Cargar los productos

  // si no existe pedido
  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification(
      "No existe un pedido",
      "Debes de crear un pedido primero"
    );
    return;
  }

  try {
    const confirmado = await showConfirmationInsideModal(
      "Confirmar Pedido",
      "¿Estás seguro de que deseas generar el pedido?"
    );
    if (!confirmado) {
      return;
    }

    $q.loading.show({
      message: "Generando ticket...",
      spinnerColor: "green",
      spinnerSize: 50,
    });

    const success = await generarTicketPDF(pedidoStore.numeroDePedido);

    if (success) {
      //console.log("Ticket generado con exito.")
      $q.notify;
    } else {
      //console.log("Fallo al genera ticket.")
    }

    $q.notify({
      type: "positive",
      message: "Ticket generado correctamente.",
      position: "top",
      timeout: 3000,
    });

    cleanAllStores();
  } catch (error) {
    showErrorNotification("Error al generar ticket", error);
  } finally {
    $q.loading.hide();
  }
};

const imprimirFactura = async (data) => {
  const factura2 = await obtenerFacturaId3(idFacturaEnc.value);

  const detalle = await obtenerDetalleFactura3(idFacturaEnc.value);

  if (!detalle) return;

  const itemsFactura = detalle.map((item) => ({
    cantidad: item.CANTIDAD_PEDIDA, // Cantidad Pedida
    descripcion: item.DESCRIPCION_PROD, // Descripcion real
    precio: item.PRECIO_UNIDAD_VENTA.toFixed(4), // Precio Unidad Venta
    subtotal: item.SUBTOTAL_GENERAL.toFixed(4), //
  }));

  const totalItems = itemsFactura.reduce(
    (total, item) => total + Number(item.cantidad),
    0
  );
  const Subtotal = itemsFactura.reduce(
    (subtotal, item) => subtotal + Number(item.subtotal),
    0
  );

  //En mensaje en manual para insertar en fel errores que se habilito la contingencia manualmente
  if (contingencia.value === true) {
    mutateFacturaContingencia({
      sucursal: storeSucursal.idSucursal,
      serie: factura2.SERIE,
      numero: factura2.NUMERO_FACTURA,
    });
  }

  const dataFactura = {
    encabezado: {
      serie: data.SerieFacturaFel,
      numero: contingencia.value
        ? factura2.CORR_CONTINGENCIA
        : data.NumeroFacturaFel,
      uuid: data.Uuid,
      fechaEmision: formatearFecha(data.FechaAccion),
      serieInterna: factura2.SERIE,
      numeroInterno: factura2.NUMERO_FACTURA,
      tipoDocumento: contingencia.value
        ? "FACTURA EN CONTINGENCIA"
        : "FACTURA ELECTRONICA",
    },
    cliente: {
      nombre: factura2.NOMBRE_CLI_A_FACTUAR,
      nit: factura2.NIT_CLIEN_A_FACTURAR,
      direccion: factura2.DIRECCION_CLI_FACTUR,
    },
    items: itemsFactura,
    resumen: {
      subtotal: `Q. ${Subtotal.toFixed(2)}`,
      descuento: `Q. ${factura2.MONTO_DESCUENTO_FACT.toFixed(2)}`,
      totalPagar: `Q. ${factura2.TOTAL_GENERAL.toFixed(2)}`,
      totalItems,
    },
    nombreVendedor: factura2.USUARIO_QUE_FACTURA,
    qrCodeData: data.Uuid,
  };

  await nextTick();

  await generarFacturaPDF(dataFactura);

  // NOTA: cleanAllStores() se ejecutará DESPUÉS de que todo esté completo
  // para evitar perder datos antes de tiempo

  props.onNuevoPedido();
  // limpiar campos de pago
  montoEfectivo.value = null;
  montoTarjeta.value = null;
  tipoPago.value = "EFECTIVO"; // Setear efectivo para la nueva factura

  // Invalidate pedidos pendientes y refetch
  queryClient.invalidateQueries({
    queryKey: ["pedidos-pendientes"],
  });
  //console.log("Finalizando impresion de factura");
};

// mostrar total
const totalEncabezado = computed(() => {
  return pedidoData.value?.TOTAL_GENERAL_PEDIDO ?? 0;
});

const totalPedido = () => {
  return pedidoStore.idPedidoEnc;
};

const limpiarFiltro = () => {
  filtroProductos.value = "";
};

// Buscar producto por código escaneado o ingresado manualmente
const buscarProductoEscaneado = async () => {
  if (!codigoProducto.value || loadingPorCodigo.value) return;

  loadingPorCodigo.value = true;
  if (!pedidoStore.idPedidoEnc) {
    await errorAgregarProductoConSonido(
      "No hay un pedido activo. Por favor, crea un nuevo pedido."
    );
    loadingPorCodigo.value = false;
    // Resetear errorAgregarProducto después de un tiempo
    setTimeout(() => {
      errorAgregarProducto.value = false;
    }, 2000);
    // Restaurar focus después del error con reintentos rápidos
    await nextTick();
    let intentos = 0;
    const maxIntentos = 6;
    const intentarFocus = () => {
      intentos++;
      if (!allowAutoFocusProduct.value || loadingPorCodigo.value) {
        if (intentos < maxIntentos) {
          setTimeout(intentarFocus, 50);
        }
        return;
      }
      const inputElement = inputCodigo.value?.$el?.querySelector("input");
      if (inputElement && !inputElement.disabled) {
        inputElement.focus();
        inputElement.select();
      } else if (intentos < maxIntentos) {
        setTimeout(intentarFocus, 50);
      }
    };
    setTimeout(intentarFocus, 100);
    return;
  }
  let resultado = null;

  // 1. buscar por código de barras
  try {
    resultado = await consultarCodigoM(codigoProducto.value, cantidad2.value);
  } catch {
    //showErrorNotification('error', error)
    //return
  }

  // 2. buscar por ID de producto
  if (!resultado || !resultado.producto) {
    try {
      const productoDirecto = await precioReal(
        codigoProducto.value,
        cantidad2.value
      );

      if (
        productoDirecto.PRECIO_FINAL === 0 ||
        productoDirecto.PRECIO_FINAL === null
      ) {
        await errorAgregarProductoConSonido(
          `Producto sin precio, El código ${codigoProducto.value} no tiene precio`
        );
        codigoProducto.value = "";
        loadingPorCodigo.value = false;
        // Resetear errorAgregarProducto después de un tiempo
        setTimeout(() => {
          errorAgregarProducto.value = false;
        }, 2000);
        await nextTick();
        // Sistema de reintentos rápido
        let intentos = 0;
        const maxIntentos = 6;
        const intentarFocus = () => {
          intentos++;
          if (!allowAutoFocusProduct.value || loadingPorCodigo.value) {
            if (intentos < maxIntentos) {
              setTimeout(intentarFocus, 50);
            }
            return;
          }
          const inputElement = inputCodigo.value?.$el?.querySelector("input");
          if (inputElement && !inputElement.disabled) {
            inputElement.focus();
            inputElement.select();
          } else if (intentos < maxIntentos) {
            setTimeout(intentarFocus, 50);
          }
        };
        setTimeout(intentarFocus, 100);
        return;
      }

      // Tiene el precio
      const prod = Array.isArray(productoDirecto)
        ? productoDirecto[0]
        : productoDirecto;

      if (!prod) {
        throw new Error("No encontrado");
      }

      resultado = {
        producto: {
          PRODUCT0: codigoProducto.value,
        },
        precio: {
          PRECIO_FINAL: prod.PRECIO_FINAL,
        },
      };
    } catch (err) {
      await errorAgregarProductoConSonido(
        `${err.message || "Error desconocido al buscar el precio del producto"}`
      );
      codigoProducto.value = "";
      loadingPorCodigo.value = false;
      // Resetear errorAgregarProducto después de un tiempo
      setTimeout(() => {
        errorAgregarProducto.value = false;
      }, 2000);
      await nextTick();
      setTimeout(() => {
        if (allowAutoFocusProduct.value && !loadingPorCodigo.value) {
          const inputElement = inputCodigo.value?.$el?.querySelector("input");
          if (inputElement && !inputElement.disabled) {
            inputElement.focus();
            inputElement.select();
          }
        }
      }, 250);
      return;
    }
  }

  // 3. Insertar producto al pedido
  const detalle: PedidosDet = {
    ID_PEDIDO_ENC: pedidoStore.idPedidoEnc.toString(),
    PRODUCT0: resultado.producto.PRODUCT0,
    CANTIDAD_PEDIDA: cantidad2.value || 1, // usar cantidad del modal o 1 por defecto
    PRECIO_UNIDAD_VENTA: Number(resultado.precio.PRECIO_FINAL.toFixed(4)),
    SUBTOTAL_VENTAS: Number((1 * resultado.precio.PRECIO_FINAL).toFixed(4)),
    DESCRIPCION_PROD_AUX: resultado.producto.DESCRIPCION_PROD, // vacio
    ID_SUCURSAL: storeSucursal.idSucursal,
    NUMERO_DE_PEDIDO: pedidoStore.numeroDePedido,
  };

  mutateCrearPedidoDet(detalle, {
    onSuccess: async (data) => {
      detallesPedido.value.push(data);
      codigoProducto.value = "";
      await refetchObtenerPedidoID(); // Refrescar datos del pedido primero
      await refetchObtenerPedidoDetID();
      totalStore.setTotal(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0);
      // relistaDet2(); // Refrescar lista de detalles
      cantidad2.value = 1; // Resetear cantidad del modal

      mostrarNotificacionCorrectoSonido(
        `${detalle.PRODUCT0} agregado con éxito`
      );
      nuevosDatos.value = null;

      // Restaurar focus DESPUÉS de todas las operaciones asíncronas
      // Usar sistema de reintentos inteligente que se detiene cuando el input está listo
      loadingPorCodigo.value = false;
      await nextTick();

      // Función que intenta enfocar con reintentos rápidos
      let intentos = 0;
      const maxIntentos = 10; // Máximo 10 intentos (500ms total si es necesario)
      const intentarFocus = () => {
        intentos++;

        // Verificar condiciones
        if (
          !allowAutoFocusProduct.value ||
          errorAgregarProducto.value ||
          loadingPorCodigo.value
        ) {
          if (intentos < maxIntentos) {
            setTimeout(intentarFocus, 50); // Reintentar cada 50ms
          }
          return;
        }

        // Intentar acceder al elemento DOM
        const inputElement = inputCodigo.value?.$el?.querySelector("input");
        if (inputElement && !inputElement.disabled) {
          // Si el input está listo, enfocar inmediatamente
          inputElement.focus();
          inputElement.select();
        } else if (intentos < maxIntentos) {
          // Si aún no está listo, reintentar rápidamente
          setTimeout(intentarFocus, 50);
        }
      };

      // Iniciar con un delay inicial corto (100ms) para dar tiempo mínimo a los re-renderizados
      setTimeout(intentarFocus, 100);
    },
    onError: async (err) => {
      await errorAgregarProductoConSonido(
        `Error al guardar producto: ${err.message || "Error desconocido"}`
      );
      // Restaurar focus también en caso de error
      loadingPorCodigo.value = false;
      // Resetear errorAgregarProducto después de un tiempo para permitir focus
      setTimeout(() => {
        errorAgregarProducto.value = false;
      }, 2000);

      await nextTick();
      // Sistema de reintentos rápido para errores
      let intentos = 0;
      const maxIntentos = 8;
      const intentarFocus = () => {
        intentos++;
        if (!allowAutoFocusProduct.value || loadingPorCodigo.value) {
          if (intentos < maxIntentos) {
            setTimeout(intentarFocus, 50);
          }
          return;
        }
        const inputElement = inputCodigo.value?.$el?.querySelector("input");
        if (inputElement && !inputElement.disabled) {
          inputElement.focus();
          inputElement.select();
        } else if (intentos < maxIntentos) {
          setTimeout(intentarFocus, 50);
        }
      };
      setTimeout(intentarFocus, 150);
    },
    onSettled: () => {
      // Solo establecer loading en false si no se hizo en onSuccess/onError
      if (loadingPorCodigo.value) {
        loadingPorCodigo.value = false;
      }
    },
  });
};

// crea pedido det desde catalogo
const agregarProductoAlPedido2 = async (producto) => {
  try {
    const cantidadFinal = producto.CANTIDAD_PEDIDA || 1;

    // Validación
    if (!producto || !producto.PRODUCT0 || cantidadFinal <= 0) {
      //console.error("Producto inválido o cantidad no válida");
      return;
    }

    // Mostrar loading
    loadingAgregar.value = true;

    // Obtener precio real desde backend
    const precio = await precioReal(producto.PRODUCT0, cantidadFinal);
    if (!precio || !precio.PRECIO_FINAL) {
      throw new Error("No se pudo obtener el precio real del producto");
    }

    // Armar detalle para guardar
    const detalle2: PedidosDet = {
      ID_PEDIDO_ENC: pedidoStore.idPedidoEnc.toString(),
      PRODUCT0: producto.PRODUCT0,
      CANTIDAD_PEDIDA: cantidadFinal,
      PRECIO_UNIDAD_VENTA: precio.PRECIO_PROMOCION ?? precio.PRECIO_FINAL,
      SUBTOTAL_VENTAS:
        cantidadFinal * (precio.PRECIO_PROMOCION ?? precio.PRECIO_FINAL),
      DESCRIPCION_PROD_AUX: producto.DESCRIPCION_PROD,
      ID_SUCURSAL: storeSucursal.idSucursal,
      NUMERO_DE_PEDIDO: pedidoStore.numeroDePedido,
    };

    // Enviar a backend
    mutateCrearPedidoDet(detalle2, {
      onSuccess: async (data) => {
        detallesPedido.value.push(data);
        codigoProducto.value = "";
        producto.CANTIDAD_PEDIDA = 1;
        await refetchObtenerPedidoID(); // Refrescar datos del pedido primero
        await refetchObtenerPedidoDetID();
        // relistaDet2();
        totalStore.setTotal(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0);
        if (allowAutoFocusProduct.value) enfocarCodigo();

        $q.notify({
          type: "success",
          message: `Producto ${detalle2.PRODUCT0} agregado con exito`,
          position: "top",
          color: "green",
          timeout: 2000,
          group: false, // se muestra de inmediato
          progress: false,
        });
      },
      onError: async (error) => {
        //console.error("Error al guardar producto en BD:", error);
        await errorAgregarProductoConSonido(
          `Error al agregar producto: ${error.message || "Error desconocido"}`
        );
        //showConfirmationInsideModal('Error', error)
        throw new Error(error.message || "Error desconocido");
      },
      onSettled: () => {
        loadingAgregar.value = false;
      },
    });
  } catch (error) {
    showErrorNotificationInside("Error", error);
    //console.error("Error al agregar producto:", error);
    loadingAgregar.value = false;
  }
};

// Mover foco al siguiente producto en el catálogo
const moverFocoAlSiguienteProducto = (indexActual) => {
  if (typeof indexActual !== "number" || indexActual < 0) {
    //console.warn(
    //"Invalid index for moverFocoAlSiguienteProducto:",
    //indexActual
    //);
    return;
  }

  const siguienteIndex = indexActual + 1;

  // Verificar si existe un siguiente producto y si los datos están disponibles
  if (
    productosFiltrados2.value &&
    Array.isArray(productosFiltrados2.value) &&
    siguienteIndex < productosFiltrados2.value.length &&
    cantidadInputs &&
    cantidadInputs.value
  ) {
    nextTick(() => {
      try {
        const siguienteInput = cantidadInputs.value[siguienteIndex];
        if (siguienteInput && typeof siguienteInput.focus === "function") {
          siguienteInput.focus();
          if (typeof siguienteInput.select === "function") {
            siguienteInput.select();
          }
        }
      } catch (error) {
        //console.warn("Error moving focus to next product:", error);
      }
    });
  }
};

// enviar producto desde catalogo
const seleccionarProducto2 = async (producto, index) => {
  try {
    await agregarProductoAlPedido2(producto);

    // Mover foco al siguiente producto después de agregar
    await nextTick();
    moverFocoAlSiguienteProducto(index);
  } catch (error) {
    showErrorNotificationInside("Error", error);
    //console.error("Error in seleccionarProducto2:", error);
  }
};

const errorAgregarProductoConSonido = async (mensajeError) => {
  errorAgregarProducto.value = true;
  errorAgregarProducto.value = await mostrarNotificacionErrorSonido(
    mensajeError
  );
};

/*
==========================================================
              LIFE HOCKS (CICLOS DE VIDA)
==========================================================
*/
// Multiplicador
onMounted(() => {
  window.addEventListener("keydown", usarMultiplicador);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarMultiplicador);
});

// limpiar
onMounted(() => {
  window.addEventListener("keydown", usarDelete);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarDelete);
});

// Abrir facturacion con F4
onMounted(() => {
  window.addEventListener("keydown", usarF4);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarF4);
});

// Abrir Catalogo
onMounted(() => {
  window.addEventListener("keydown", usarF1);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarF1);
});

// Inicializar cantidadInputs de manera segura
onMounted(() => {
  cantidadInputs.value = {};
});

// Limpiar cantidadInputs al desmontar
onBeforeUnmount(() => {
  if (cantidadInputs && cantidadInputs.value) {
    cantidadInputs.value = {};
  }
});

defineExpose({
  enfocarCodigo,
  totalPedido,
});
</script>

<style scoped>
.facturacion-card {
  width: min(500px, 96vw);
  max-width: 96vw;
  max-height: 92vh;
}

.facturacion-header {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #181717;
  padding: 10px 14px;
  border-radius: 8px 8px 0 0;
}

.pedido-detalle-container {
  padding: 6px 0px 0px 0;
  max-width: auto;
  margin: 0 auto;
}

.pedido-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  margin-bottom: 8%;
}

.total-badge {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  padding: 16px 24px;
  border-radius: 12px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
}

.search-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-input {
  background: white;
  border-radius: 8px;
}

.cantidad-input {
  background: white;
  border-radius: 8px;
}

.productos-table-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.productos-table .q-table__top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.producto-row {
  transition: all 0.2s ease;
  color: black;
}

.producto-row:hover {
  background-color: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

.producto-info {
  max-width: 300px;
  font-weight: bold;
}

.precio-info {
  text-align: right;
}

.cantidad-edit {
  background: white;
}

.delete-btn {
  transition: all 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.catalogo-modal {
  z-index: 1;
  border-radius: 12px;
}

.catalogo-table .q-table__top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.catalogo-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.catalogo-row:hover {
  background-color: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

.producto-catalogo {
  max-width: 400px;
  font-weight: bold;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
}

.boton-amarillo {
  background: linear-gradient(90deg, #ffeb3b, #fbc02d);
  color: #070606;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.boton-amarillo:hover {
  background: linear-gradient(90deg, #fbc02d, #f9a825);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

#oferta .text-strike {
  text-decoration: line-through;
}
.text-green {
  color: #2e7d32;
}
.text-red {
  color: #c62828;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pedido-detalle-container {
    padding: 8px;
  }

  .pedido-header {
    padding: 16px;
    margin-bottom: 12px;
  }

  .total-badge {
    padding: 12px 16px;
    margin-top: 12px;
  }

  .search-card .q-card-section {
    padding: 12px;
  }

  .row.q-gutter-md {
    gap: 8px;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.producto-row {
  animation: fadeIn 0.3s ease-out;
}

/* Estilos para inputs focus */
.search-input .q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.cantidad-input .q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Estilos para botones */
.q-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Estilos para chips */
.q-chip {
  border-radius: 6px;
  font-weight: 500;
}

/* tabla */
.q-table tbody td {
  padding: 8px 16px;
}

.q-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

/* Estilos para la sección de descuento */
.descuento-section {
  background: linear-gradient(135deg, #f8fff8 0%, #f0fff0 100%);
  border-left: 4px solid #4caf50;
  border-radius: 8px;
}

.descuento-section .text-green-7 {
  color: #2e7d32 !important;
}

.descuento-section .text-red-7 {
  color: #c62828 !important;
}

/* Mejoras para el resumen de pago */
.resumen-pago-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resumen-pago-card .q-card-section {
  padding: 16px;
}

.resumen-pago-card .q-separator {
  background: #e0e0e0;
  margin: 8px 0;
}

.toggle-brillante.q-toggle--truthy {
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 10px 4px rgba(255, 235, 59, 0.6); /* amarillo brillante */
  border-radius: 999px;
}

/* ===== ESTILOS PARA EL MODAL DE CATÁLOGO MEJORADO ===== */

/* Header del modal */
.catalogo-header {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #2c3e50;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 4px 20px rgba(255, 235, 59, 0.3);
}

/* ===== ESTILOS PARA LOADING Y ESTADOS ===== */

/* Contenedor de loading principal */
.loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin: 20px 0;
}

.loading-content {
  text-align: center;
  padding: 40px;
}

.loading-text .text-h6 {
  color: #1976d2;
  font-weight: 600;
}

/* Loading de refetch */
.refetch-loading {
  margin-bottom: 16px;
}

.refetch-loading .q-banner {
  border-left: 4px solid #1976d2;
  font-weight: 500;
}

/* Contenedor de error */
.error-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-radius: 12px;
  margin: 20px 0;
  border: 1px solid #f44336;
}

.error-content {
  text-align: center;
  padding: 40px;
}

.error-text .text-h6 {
  font-weight: 600;
}

.error-text .q-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* Botón de refresh */
.refresh-btn {
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: rotate(180deg);
  background: rgba(255, 255, 255, 0.2);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.texto-rojo {
  color: red;
}
/* Contenedor del buscador */
.search-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* Input de búsqueda mejorado */
.search-input-enhanced {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.search-input-enhanced .q-field--focused .q-field__control {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

/* Tabla de catálogo mejorada */
.catalogo-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.catalogo-table .q-table__top {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #2c3e50;
  padding: 16px 20px;
}

.catalogo-table .q-table__thead th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
}

.catalogo-table .q-table__tbody tr {
  transition: all 0.2s ease;
}

.catalogo-table .q-table__tbody tr:hover {
  background-color: rgba(255, 235, 59, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 235, 59, 0.2);
}

.catalogo-table .q-table__tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

/* Celdas personalizadas */
.codigo-cell {
  color: black;
  min-width: 200px;
  white-space: normal;
  word-break: break-word;
}

.codigo-cell .text-weight-bold {
  color: #080505d8;
  font-size: 1rem;
}

.codigo-cell .text-caption {
  color: #090a0c;
  font-size: 0.8rem;
}

.descripcion-cell {
  min-width: 300px;
  word-break: break-word;
  white-space: normal;
}

.descripcion-cell .text-weight-medium {
  color: #2c3e50;
  font-size: 0.95rem;
  line-height: 1.4;
}

.precio-cell {
  min-width: 150px;
  text-align: center;
  white-space: normal;
  word-break: break-word;
}

.precio-normal-table .text-weight-bold {
  color: #fbc02d;
  font-size: 1.1rem;
}

.precio-oferta-table {
  position: relative;
  padding: 8px;
  background: linear-gradient(135deg, #f6fff5 0%, #fed7d7 100%);
  border-radius: 6px;
  border: 1px solid #7cf186;
  text-align: center;
}

.precio-anterior-table {
  font-size: 0.85rem;
  color: #6c757d;
  text-decoration: line-through;
  margin-bottom: 2px;
}

.precio-actual-table {
  font-size: 1.1rem;
  font-weight: 700;
  color: #75ce3a;
  margin-bottom: 4px;
}

.oferta-chip {
  font-size: 0.7rem;
  font-weight: 700;
  transform: rotate(-5deg);
}

.vigencia-chip {
  font-size: 0.65rem;
  font-weight: 600;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border: 1px solid #e65100;
  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
}

.niveles-cell {
  min-width: 200px;
}

.niveles-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nivel-row {
  display: flex;
  align-items: center;
  min-height: 24px;
}

.nivel-chip {
  width: 100%;
  justify-content: flex-start;
  border-radius: 4px;

  font-weight: 500;
}

.cantidad-cell {
  min-width: 120px;
  text-align: center;
}

.cantidad-cell .q-input {
  max-width: 80px;
}

.cantidad-cell .q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(255, 235, 59, 0.3);
}

.accion-cell {
  min-width: 120px;
  text-align: center;
}

.btn-agregar-table {
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #2c3e50;
}

.btn-agregar-table:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 235, 59, 0.4);
}

/* Responsive para la tabla */
@media (max-width: 1200px) {
  .catalogo-table {
    font-size: 0.9rem;
  }

  .catalogo-table .q-table__tbody td {
    padding: 8px 12px;
  }
  .descripcion-cell {
    min-width: 240px;
  }
  .codigo-cell {
    min-width: 160px;
  }
  .precio-cell {
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .catalogo-table {
    font-size: 0.8rem;
  }

  .catalogo-table .q-table__thead th {
    font-size: 0.8rem;
    padding: 8px 6px;
  }

  .catalogo-table .q-table__tbody td {
    padding: 6px 8px;
  }

  .codigo-cell,
  .descripcion-cell,
  .precio-cell,
  .niveles-cell,
  .cantidad-cell,
  .accion-cell {
    min-width: auto;
  }
  .descripcion-cell {
    min-width: 180px;
  }
  .codigo-cell {
    min-width: 120px;
  }
  .precio-cell {
    min-width: 96px;
  }
}

/* Animaciones para las filas */
@keyframes fadeInRow {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.catalogo-table .q-table__tbody tr {
  animation: fadeInRow 0.3s ease-out;
}

/* Estilos para el contador de productos mejorado */
.productos-counter-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-width: auto;
  width: fit-content;
}

.productos-counter-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
}

.counter-info,
.total-info {
  text-align: center;
  min-width: 60px;
}

.counter-label,
.total-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 1px;
}

.counter-number {
  font-size: 1rem;
  font-weight: 700;
  color: #007bff;
  line-height: 1;
}

.total-amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #28a745;
  line-height: 1;
}

.productos-counter-card .q-separator {
  height: 40px;
  opacity: 0.3;
}

/* Responsive para el contador */
@media (max-width: 768px) {
  .productos-counter-card .row {
    flex-direction: column;
    gap: 4px;
  }

  .productos-counter-card .q-separator {
    display: none;
  }

  .counter-info,
  .total-info {
    min-width: auto;
  }

  .counter-number,
  .total-amount {
    font-size: 1rem;
  }
}

/* Payment Method Button Group Styles */
.payment-method-container {
  width: 100%;
}

.payment-method-buttons {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Payment Method Toggle Styles */
.payment-method-buttons .q-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 12px 16px;
  transition: all 0.3s ease-in-out;
  min-height: 48px;
  border: 2px solid transparent;
  position: relative;
}

.payment-method-buttons .q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* Active state styling - botón presionado */
.payment-method-buttons .q-btn--active {
  font-weight: 700 !important;
  transform: scale(1.05) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

/* Colores específicos para cada opción cuando está activa */
.payment-method-buttons .q-btn--active[data-value="EFECTIVO"] {
  background: linear-gradient(135deg, #4caf50, #66bb6a) !important;
  color: white !important;
  border: 2px solid #2e7d32 !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4) !important;
}

.payment-method-buttons .q-btn--active[data-value="TARJETA"] {
  background: linear-gradient(135deg, #2196f3, #42a5f5) !important;
  color: white !important;
  border: 2px solid #1565c0 !important;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4) !important;
}

.payment-method-buttons .q-btn--active[data-value="MIXTO"] {
  background: linear-gradient(135deg, #ff9800, #ffb74d) !important;
  color: white !important;
  border: 2px solid #ef6c00 !important;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4) !important;
}

/* Efecto de brillo para botón activo */
.payment-method-buttons .q-btn--active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 70%
  );
  border-radius: inherit;
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .payment-method-buttons .q-btn {
    font-size: 12px;
    padding: 10px 12px;
    min-height: 44px;
  }

  .payment-method-buttons .q-btn .q-icon {
    font-size: 16px;
  }
}

.catalogo-table .q-table__tbody tr:nth-child(1) {
  animation-delay: 0.1s;
}
.catalogo-table .q-table__tbody tr:nth-child(2) {
  animation-delay: 0.2s;
}
.catalogo-table .q-table__tbody tr:nth-child(3) {
  animation-delay: 0.3s;
}
.catalogo-table .q-table__tbody tr:nth-child(4) {
  animation-delay: 0.4s;
}
.catalogo-table .q-table__tbody tr:nth-child(5) {
  animation-delay: 0.5s;
}
.catalogo-table .q-table__tbody tr:nth-child(6) {
  animation-delay: 0.6s;
}

/* ===== Estilo para tabla existencias ===== */
.tabla-lotes-mejorada {
  font-size: 1.1rem; /* Letra más grande */
}

.tabla-lotes-mejorada .q-table__thead th {
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  padding: 12px 16px;
}

.tabla-lotes-mejorada .q-table__tbody td {
  padding: 12px 16px;
  font-size: 1rem;
  vertical-align: middle;
}

.tabla-lotes-mejorada .q-table__tbody tr:hover {
  background-color: rgba(76, 175, 80, 0.08);
}

/* Celda de cantidad destacada */
.cantidad-destacada {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  border-left: 4px solid #4caf50 !important;
  text-align: center !important;
}

.cantidad-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #56a859 0%, #0ceb17 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  font-weight: 700;
  min-width: 100px;
}

.cantidad-badge-red {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #f81616 0%, #8a4545 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(212, 205, 205, 0.3);
  font-weight: 700;
  min-width: 100px;
}

.cantidad-numero {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.cantidad-label {
  font-size: 0.75rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Botón de existencias mejorado */
.btn-existencias {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
  padding: 4px 16px;
}

.btn-existencias:hover {
  background-color: rgba(76, 175, 80, 0.1);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .tabla-lotes-mejorada {
    font-size: 0.95rem;
  }

  .cantidad-numero {
    font-size: 1.4rem;
  }

  .cantidad-badge {
    padding: 8px 16px;
    min-width: 100px;
  }
}
</style>
