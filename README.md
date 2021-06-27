# Headless WooCommerce

This repo contains a demo for a detached WooCommerce store, using Store API, which is under-development and is included for free with WooCommerce and WooCommerce Blocks plugins.

WooCommerce Stripe Gateway is required to be configured.

## Limitations

- The demo doesn't support adding variable products, you can still add them in Store API.
- The demo requires disabling CORS (as is done in [this snippet](https://gist.github.com/dechov/4f1cf38e4e5ae7129dc7a8ab3c55373c)).
- The demo requires samesite cookies to be disabled. You need to host it on the same domain as your WooCommerce instance or disable samesite by updating `wc_setcookie` in WooCommerce.

## Deploy your own

- Deploy to vercel.com or netlify or any other JAM host.
- Define your enviroment variables like the WooCommerce url and Stripe public key.
