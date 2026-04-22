import Liquid from '../../utils/liquid.min';

let engine = null;

// eslint-disable-next-line no-return-assign
const makeEngine = () => engine || (engine = new Liquid());

const parseHeaders = (headers) =>
  Object.fromEntries(headers.map(({ key, value }) => [key, value]));

const parseQueryParameters = (queryParameters) =>
  queryParameters
    .map(({ key, value }, index) => {
      const paramKey = index === 0 ? `?${key}` : key;
      return `${paramKey}=${encodeURIComponent(value)}`;
    })
    .join('&');

const parseLiquid = (body, bodyParameters) => {
  const variables = Object.fromEntries(
    bodyParameters.map(({ key, value }) => [key, value]),
  );

  return makeEngine().parseAndRender(body, variables);
};

const generateUrl = (url, protocol, queryParameters) => {
  let trimmedUrl = url;
  if (trimmedUrl.startsWith('http://')) {
    [, trimmedUrl] = trimmedUrl.split('http://');
  }
  if (trimmedUrl.startsWith('https://')) {
    [, trimmedUrl] = trimmedUrl.split('https://');
  }

  return `${protocol}://${trimmedUrl}${parseQueryParameters(queryParameters)}`;
};

const optionallyParseJson = (data) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
};

const normalizePem = (value) => {
  if (typeof value !== 'string') return value;
  let s = value.trim();
  if (!s) return s;

  s = s.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\r');

  if (!s.includes('\n') && s.includes('-----BEGIN ')) {
    s = s.replace(
      /-----BEGIN ([^-]+)-----([\s\S]+?)-----END \1-----/g,
      (_, label, body) => {
        const b64 = body.replace(/\s+/g, '');
        const lines = b64.match(/.{1,64}/g) || [];
        return [`-----BEGIN ${label}-----`, ...lines, `-----END ${label}-----`].join('\n');
      },
    );
  }

  return s;
};

const buildHttpsAgent = ({
  clientCert,
  clientKey,
  caCert,
  passphrase,
  rejectUnauthorized,
}) => {
  const cert = normalizePem(clientCert);
  const key = normalizePem(clientKey);
  const ca = normalizePem(caCert);

  if (!cert && !key && !ca) return undefined;

  if ((cert && !key) || (!cert && key)) {
    throw new Error(
      'mTLS requires both a client certificate and a matching private key.',
    );
  }

  return {
    ...(cert && { cert }),
    ...(key && { key }),
    ...(ca && { ca }),
    ...(passphrase && { passphrase }),
    rejectUnauthorized: rejectUnauthorized !== 'false',
  };
};

const http = async ({
  url,
  method,
  body,
  headers = [],
  protocol,
  queryParameters = [],
  bodyParameters = [],
  urlParameters = [],
  clientCert,
  clientKey,
  caCert,
  passphrase,
  rejectUnauthorized = 'true',
}) => {
  const parsedBody =
    bodyParameters.length > 0 ? await parseLiquid(body, bodyParameters) : body;
  const parsedUrl =
    urlParameters.length > 0 ? await parseLiquid(url, urlParameters) : url;

  const fetchUrl = generateUrl(parsedUrl, protocol, queryParameters);

  const httpsAgent = buildHttpsAgent({
    clientCert,
    clientKey,
    caCert,
    passphrase,
    rejectUnauthorized,
  });

  const options = {
    method,
    headers: parseHeaders(headers),
    ...(method !== 'get' && { body: parsedBody }),
    ...(httpsAgent && { httpsAgent }),
  };

  const response = await fetch(fetchUrl, options);
  const responseCode = response.status;
  const data = await response.text();

  return { as: optionallyParseJson(data), responseCode };
};

export default http;
