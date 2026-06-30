const FRUITFY_API_URL = process.env.FRUITFY_API_URL ?? 'https://api.fruitfy.io';

const jsonResponse = (statusCode, payload, extraHeaders = {}) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Content-Type': 'application/json',
    ...extraHeaders,
  },
  body: JSON.stringify(payload),
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {success: false, message: 'Method not allowed'});
  }

  const token = process.env.FRUITFY_TOKEN;
  const storeId = process.env.FRUITFY_STORE_ID;
  const productId = process.env.FRUITFY_PRODUCT_ID;

  if (!token || !storeId || !productId) {
    return jsonResponse(500, {
      success: false,
      message: 'Variáveis da Fruitfy ausentes na Netlify.',
    });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const {
      name,
      email,
      phone,
      cpf,
      itemValue,
      quantity,
      shippingValue,
      orderBumpsValue,
      totalValue,
      utm,
    } = body ?? {};

    if (!name || !email || !phone || !cpf || !itemValue) {
      return jsonResponse(422, {
        success: false,
        message: 'Dados obrigatórios ausentes para gerar cobrança PIX.',
      });
    }

    const parsedItemValue = Number(itemValue);
    const parsedQuantity = Math.max(1, Number(quantity) || 1);
    const parsedShippingValue = Math.max(0, Number(shippingValue) || 0);
    const parsedOrderBumpsValue = Math.max(0, Number(orderBumpsValue) || 0);
    const parsedTotalValue = Math.max(0, Number(totalValue) || 0);
    const fallbackTotalValue = Math.round(
      parsedItemValue * parsedQuantity + parsedShippingValue + parsedOrderBumpsValue
    );
    const ticketValue = parsedTotalValue > 0 ? Math.round(parsedTotalValue) : fallbackTotalValue;

    const response = await fetch(`${FRUITFY_API_URL}/api/pix/charge`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Store-Id': storeId,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'pt_BR',
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        cpf,
        items: [
          {
            id: productId,
            value: ticketValue,
            quantity: 1,
          },
        ],
        ...(utm ? {utm} : {}),
      }),
    });

    const responseData = await response.json().catch(() => null);
    return jsonResponse(
      response.status,
      responseData ?? {success: false, message: 'Resposta inválida da Fruitfy.'}
    );
  } catch (error) {
    return jsonResponse(500, {
      success: false,
      message: 'Falha ao criar cobrança PIX na Fruitfy.',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
};
