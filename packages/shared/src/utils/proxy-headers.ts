// Headers con los que el servidor de Next le pasa a la API la IP real del cliente. La API usa la
// IP solo si el secreto coincide con PROXY_SHARED_SECRET (el mismo en la web y en la API); si no,
// la ignora y usa la IP de la conexión. Así nadie que llame a la API directo puede elegir su IP.
export const CLIENT_IP_HEADER = "x-kaname-client-ip";
export const PROXY_SECRET_HEADER = "x-kaname-proxy-secret";
