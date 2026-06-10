const { MercadoPagoConfig, Preference } = require('mercadopago');

const accessToken = "TEST-7919117335116357-060920-e91391d0f209a5031c2466b93721201a-1112614213";
const client = new MercadoPagoConfig({ accessToken });
const preference = new Preference(client);

async function test() {
  try {
    const response = await preference.create({
      body: {
        items: [
          {
            id: 'classic',
            title: 'Plano Clássico',
            quantity: 1,
            unit_price: 149,
            currency_id: 'BRL',
          }
        ],
        external_reference: `user123|classic`,
        notification_url: 'https://memvo.com.br/api/webhooks/mercadopago',
        statement_descriptor: 'MEMVO',
        back_urls: {
          success: `https://memvo.com.br/dashboard/success?plan=classic`,
          pending: `https://memvo.com.br/dashboard/success?plan=classic`,
          failure: `https://memvo.com.br/pricing`,
        },
        auto_return: 'approved',
      }
    });
    console.log("Success:", response.id);
  } catch (error) {
    console.error("Error creating preference:", JSON.stringify(error, null, 2));
    if (error.cause) console.error("Cause:", error.cause);
  }
}

test();
