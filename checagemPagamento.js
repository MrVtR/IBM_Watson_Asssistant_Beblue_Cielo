const axios = require('axios');
const main = async ({ agent, name, price, description, idPagamento }) => {
  const clientConcat =
    '30b07143-4bf7-4f5a-8ffe-8464f65e9ade:uuQgD0qdlxjtV96dhB3yrjDcejitpcoUjtdfffUErsw=';
  const url = 'https://cieloecommerce.cielo.com.br/api/public/v2/token';
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${Buffer.from(clientConcat).toString('base64')}`,
  };
  const payload = {
    method: 'POST',
    url,
    headers,
    data: 'grant_type=client_credentials',
  };
  const message = await axios(payload)
    .then((res) => res.data)
    .then(async (token) => {
      let payloadPayment;
      switch (agent) {
        case 0:
          payloadPayment = {
            method: 'POST',
            url: 'https://cieloecommerce.cielo.com.br/api/public/v1/products/',
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              'Content-Type': 'application/json',
            },
            data: {
              name: name,
              price: price,
              softDescriptor: 'Assistencia',
              description: description,
              type: 'Payment',
              shipping: {
                type: 'Free',
              },
            },
          };
          const link = linkPagamento(payloadPayment);
          return link;
        case 1:
          payloadPayment = {
            method: 'GET',
            url:
              'https://cieloecommerce.cielo.com.br/api/public/v1/products/' +
              idPagamento +
              '/payments',
            headers: {
              Authorization: `Bearer ${token.access_token}`,
              'Content-Type': 'application/json',
            },
          };
          const checkPagamento = checkoutPagamento(payloadPayment);
          return checkPagamento;
        default:
          console.log(agent);
          return {
            err: 'Operação inválida',
          };
      }
    })
    .catch((err) => {
      console.log('Erro na obtenção do Token:', err);
      return {
        erro: err,
      };
    });
  return message;
};

async function linkPagamento(payloadPayment) {
  const link = await axios(payloadPayment)
    .then((response) => {
      console.log(response.data.shortUrl);
      return {
        id: response.data.id,
        link: response.data.shortUrl,
      };
    })
    .catch((err) => {
      console.log(
        'Erro na obtenção do link:',
        err.response.status,
        err.response.statusText,
      );
      return {
        status: err.response.status,
        statusText: err.response.statusText,
      };
    });
  return link;
}

async function checkoutPagamento(payloadPayment) {
  const pagamentoCheckout = await axios(payloadPayment)
    .then((response) => {
      console.log(response.data);
      if (response.data.orders.length == 0)
        return {
          checkoutNaoPago:
            'Não foi pago ainda, por favor, efetue seu pagamento no link fornecido anteriormente.',
        };
      else if (
        response.data.orders[0].createdDate === null ||
        response.data.orders[0].status === 'Denied'
      )
        return {
          checkoutError:
            'Erro no pagamento, verifique com sua operadora de cartão para checar o estorno da compra e efetue novamente sua compra no link fornecido anteriormente',
        };
      else
        return {
          checkoutPago: 'Pago, obrigado por contratar nossos serviços',
        };
    })
    .catch((err) => {
      console.log(
        'Erro na obtenção do link:',
        err.response.status,
        err.response.statusText,
      );
      return {
        status: err.response.status,
        statusText: err.response.statusText,
      };
    });
  return pagamentoCheckout;
}
main({
  agent: 1,
  idPagamento: 'Insira o ID do pagamento aqui',
});
