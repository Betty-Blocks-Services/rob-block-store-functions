const parseUrlEncoded = ({ encodedString }) => {
  const parsed = {};

  encodedString.split('&').forEach(pair => {
    const [key, ...rest] = pair.split('=');
    if (key) {
      parsed[decodeURIComponent(key.replace(/\+/g, ' '))] = decodeURIComponent(rest.join('=').replace(/\+/g, ' '));
    }
  });

  return { result: parsed };
};

export default parseUrlEncoded;
