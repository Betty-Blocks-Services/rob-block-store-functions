# Parse URL Encoded

This function parses a URL-encoded (`application/x-www-form-urlencoded`) string into a typed object. It is designed for processing incoming webhook payloads where the body is not JSON but a URL-encoded string of key-value pairs.

## When to use

Some external services (like Mailgun) send webhook data as `application/x-www-form-urlencoded` instead of JSON. This means the body arrives as a long string like:

```
sender=john%40example.com&subject=Test+Subject&Message-Id=%3Cunique-id%40mail.example.com%3E
```

Attempting to use a JSON Path step on this data will fail with:

```
SyntaxError: Unexpected token '...', "..." is not valid JSON
```

This function decodes the string and returns all key-value pairs as a typed object, so you can access individual fields directly in subsequent action steps.

## How to configure

| Option             | Description                                                                                                                                                                                       |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| URL Encoded String | The raw URL-encoded string from the webhook body. This is the full `key1=value1&key2=value2` string.                                                                                              |
| Schema Model       | Select a schema model to type the output object. Create a schema model with text properties matching the keys you expect from the webhook (e.g. `sender`, `subject`, `Message-Id`, `body-plain`). |
| As                 | The name of the result variable. The result will be a typed object based on the selected schema model.                                                                                            |

## Example: Mailgun Inbound Webhook

**1. Create a schema model**

Create a schema model (e.g. "Mailgun Webhook") with text properties for the fields you want to use:

| Property   | Kind |
| :--------- | :--- |
| sender     | Text |
| subject    | Text |
| Message-Id | Text |
| from       | Text |
| body-plain | Text |
| body-html  | Text |
| recipient  | Text |
| timestamp  | Text |

**2. Configure the action**

1. Add a webhook trigger that receives the Mailgun Inbound payload.
2. Add the **Parse URL Encoded** step and pass the raw webhook body into the "URL Encoded String" option.
3. Select your "Mailgun Webhook" schema model in the "Schema Model" option.
4. Give the result a name (e.g. `mailgunData`).
5. Use the parsed properties in subsequent steps, for example `mailgunData.sender` or `mailgunData.subject`.

> **Note:** The function extracts **all** key-value pairs from the encoded string. Only the keys that match properties on your schema model will be accessible as typed properties in the following steps.
