# Pago por servicio con Mercado Pago

Esta propuesta cambia el enlace de pago fijo por Checkout Pro. El cliente elige un servicio, ve su precio y la función de Supabase crea una preferencia con ese importe. El Access Token no se incluye en el sitio ni en GitHub.

## Activación

1. La persona titular de la cuenta entra a Mercado Pago Developers, crea una aplicación Checkout Pro y obtiene el **Access Token de producción**.
2. En el proyecto Supabase `ejbooxbgrtunoehcxxip`, guarda ese valor como secreto de Edge Functions llamado `MERCADO_PAGO_ACCESS_TOKEN`. No lo pegues en el HTML, en GitHub ni en un chat.
3. Despliega `mercado-pago-preferencia` al mismo proyecto con la configuración de `supabase/config.toml` (`verify_jwt = false`). Se puede hacer desde Supabase Dashboard o con la CLI autorizada para ese proyecto.
4. Prueba primero con credenciales de prueba y cuentas de prueba de Mercado Pago: Corte debe indicar 300 UYU y Color 1800 UYU. Comprueba el cobro desde Mercado Pago. Luego configura producción y publica la propuesta en GitHub Pages.

## Límite actual

La página de regreso no marca un pago como aprobado ni crea una cita. El local debe verificar el pago en Mercado Pago y confirmar la cita. Para automatizarlo faltan notificaciones Webhook firmadas y vincularlas a la tabla `appointments`. Nunca tomes los parámetros de retorno del navegador como prueba de pago.

## Archivos

- `Servicio.html`: conduce al pago del servicio seleccionado.
- `PagarOnline.html`: muestra servicio y monto e inicia Checkout Pro.
- `supabase/functions/mercado-pago-preferencia/index.ts`: valida el servicio y fija el precio en el servidor.
- `ResultadoPago.html`: informa que la confirmación sigue pendiente.
