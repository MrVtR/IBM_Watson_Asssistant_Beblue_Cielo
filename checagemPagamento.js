require('dotenv/config');
const axios = require('axios');
const main = async ({ name, price, description }) => {
  const clientConcat = process.env.CLIENT_CONCAT;
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
      const payloadPayment = {
        method: 'GET',
        url:
          'https://cieloecommerce.cielo.com.br/api/public/v1/products/' +
          process.env.ID_PAGAMENTO +
          '/payments',
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          'Content-Type': 'application/json',
        },
      };
      const link = await axios(payloadPayment)
        .then((response) => {
          console.log(response.data);
          return {
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
    })
    .catch((err) => {
      console.log('Erro na obtenção do Token:', err);
      return {
        erro: err,
      };
    });
  return message;
};

main({
  name: 'Assistência Auto',
  price: '10000',
  description: 'Assistência Auto',
});
