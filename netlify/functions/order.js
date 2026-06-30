const FRUITFY_API_URL = process.env.FRUITFY_API_URL ?? 'https://api.fruitfy.io';

const jsonResponse = (statusCode, payload, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Content-Type': 'application/json',
    ...extraHeaders,
  },
  body: JSON.stringify(payload),
});

const getOrderIdFromEvent = (event) => {
  const rawPath = event.path ?? '';
  const pathParts = rawPath.split('/').filter(Boolean);
  return decodeURIComponent(pathParts[pathParts.length - 1] ?? '');
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, {success: false, message: 'Method not allowed'});
  }

  const token = process.env.FRUITFY_TOKEN;
  const storeId = process.env.FRUITFY_STORE_ID;

  if (!token || !storeId) {
    return jsonResponse(500, {
      success: false,
      message: 'Variáveis da Fruitfy ausentes na Netlify.',
    });
  }

  const orderId = getOrderIdFromEvent(event);

  if (!orderId || orderId === 'order') {
    return jsonResponse(400, {
      success: false,
      message: 'ID do pedido inválido.',
    });
  }

  try {
    const response = await fetch(`${FRUITFY_API_URL}/api/order/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Store-Id': storeId,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'pt_BR',
      },
    });

    const responseData = await response.json().catch(() => null);
    return jsonResponse(
      response.status,
      responseData ?? {success: false, message: 'Resposta inválida da Fruitfy.'}
    );
  } catch (error) {
    return jsonResponse(500, {
      success: false,
      message: 'Falha ao consultar status do pedido na Fruitfy.',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};
