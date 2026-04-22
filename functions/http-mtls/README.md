# HTTP(S) with mTLS

Send HTTP(S) requests with optional mutual-TLS client-certificate authentication.

## Overview

Extends the standard HTTP(S) action with support for **mutual TLS** (client-certificate authentication), for APIs that require the client to present a certificate during the TLS handshake — such as PKIoverheid (PKI-O) endpoints, JUBES, DigiKoppeling, bank and insurance APIs, or any B2B integration secured by a private CA.

## Features

- Full HTTP(S) method, header, query-parameter, URL-parameter, and Liquid-templated body support — identical to the native HTTP action.
- Optional **mTLS** via four additional fields: client certificate, private key, passphrase, and CA certificate.
- Accepts PEM input in any of three shapes — real newlines, escaped `\n` sequences, or fully collapsed single-line — so certificates stored in application configurations or text properties can be used directly.
- Toggleable server-certificate verification (`Reject unauthorized`) for testing against self-signed endpoints.
- Schema-model typed response output.

## When to use

Use this action instead of the standard HTTP(S) action when the target API:

- Requires a client certificate during TLS handshake.
- Uses a private/self-signed server certificate that isn't in Node's default trust store (e.g. PKI-O after 2023).

Leave the certificate fields empty to fall back to regular HTTPS behavior — there's no penalty for using this action for non-mTLS calls.

## Options

| Option | Purpose |
|---|---|
| Method | HTTP method (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS) |
| Headers | Key-value map of request headers |
| Protocol | `http` or `https` |
| Url | Target URL (without protocol) |
| Url Parameters | Liquid variables substituted into the URL |
| Query Parameters | Key-value map appended as `?key=value&...` |
| Body | Request body (supports Liquid templating) |
| Body Parameters | Liquid variables substituted into the body |
| Client certificate (PEM) | Leaf certificate (plus optional intermediates) presented to the server |
| Client private key (PEM) | Private key matching the client certificate |
| Client key passphrase | Passphrase for encrypted private keys; leave empty if unencrypted |
| CA certificate (PEM) | Root/intermediate CA used to verify the server's certificate |
| Reject unauthorized | Set to "No" only for testing against self-signed endpoints |
| Schema Model | Optional schema model to type the response output |
| Response code as | Output variable for the HTTP status code |
| Response as | Output variable for the response body (text / object / array) |

All certificate fields are `Text` inputs and accept static text, application configuration variables, or values from previous steps.

## Testing

`https://client.badssl.com/` publishes a test client certificate specifically for verifying mTLS clients.

1. Download `badssl.com-client.pem` from <https://badssl.com/download/>.
2. Split it into two PEM blocks: the `-----BEGIN CERTIFICATE-----` block → `Client certificate`, the `-----BEGIN ENCRYPTED PRIVATE KEY-----` block → `Client private key`.
3. Set `Client key passphrase` to `badssl.com`.
4. Point the action at `https://client.badssl.com/` with method `GET`.

Expected result: `200` with an HTML response confirming the certificate was accepted.

For JSON output (easier to inspect the cert the server received), use `https://certauth.cryptomix.com/json/` instead.
