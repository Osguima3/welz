const BACKEND_HOST = Deno.env.get('BACKEND_HOST');
const BACKEND_PORT = Deno.env.get('BACKEND_PORT');
export const BACKEND_URL = `${BACKEND_HOST}:${BACKEND_PORT}/api`;
