// Los montos viven como BigInt (céntimos). JSON.stringify no sabe serializar BigInt,
// así que lo convertimos a Number al enviarlo por la red.
//
// Seguro: un balance en céntimos cabe holgado en Number.MAX_SAFE_INTEGER (9e15),
// equivalente a ~90 billones de Bs. La autoridad del dinero es siempre el servidor;
// el cliente solo muestra. Las operaciones aritméticas en el server usan BigInt.
//
// Este import con efecto secundario debe cargarse una vez al arrancar (en index.ts).
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function (
  this: bigint,
) {
  return Number(this);
};

export {};
