const origen = "https://maldivasmvd.github.io";
const ruta = "/MaldivasMvd./";
const precios: Record<string, { nombre: string; precio: number }> = {
  brushing: { nombre: "Brushing", precio: 500 },
  corte: { nombre: "Corte", precio: 300 },
  lavado: { nombre: "Lavado", precio: 400 },
  secado: { nombre: "Secado", precio: 450 },
  alisado: { nombre: "Alisado", precio: 1500 },
  color: { nombre: "Color", precio: 1800 },
};
const headers = {
  "Access-Control-Allow-Origin": origen,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Content-Type": "application/json",
};
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return json({ error: "Método inválido" }, 405);
  if (req.headers.get("Origin") !== origen) return json({ error: "Origen inválido" }, 403);
  const token = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
  if (!token) return json({ error: "Pago no configurado" }, 503);
  let servicio: string;
  try {
    const body = await req.json();
    servicio = body.servicio;
  } catch {
    return json({ error: "Solicitud inválida" }, 400);
  }
  const item = Object.hasOwn(precios, servicio) ? precios[servicio] : undefined;
  if (!item) return json({ error: "Servicio inválido" }, 400);
  try {
    const respuesta = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        items: [{
          id: servicio,
          title: `Maldivas_Studio - ${item.nombre}`,
          quantity: 1,
          currency_id: "UYU",
          unit_price: item.precio,
        }],
        external_reference: crypto.randomUUID(),
        back_urls: {
          success: `${origen}${ruta}ResultadoPago.html`,
          pending: `${origen}${ruta}ResultadoPago.html`,
          failure: `${origen}${ruta}ResultadoPago.html`,
        },
      }),
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok || !resultado.init_point) {
      console.error("Mercado Pago no creó la preferencia", respuesta.status);
      return json({ error: "No se pudo preparar el pago" }, 502);
    }
    return json({ init_point: resultado.init_point });
  } catch (error) {
    console.error("Error al preparar el pago", error);
    return json({ error: "No se pudo preparar el pago" }, 502);
  }
});
