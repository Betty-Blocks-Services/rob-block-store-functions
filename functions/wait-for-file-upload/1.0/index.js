const waitForFileUpload = async ({ url }) => {
  while (true) {
    const response = await fetch(url, { method: 'GET' });
    if (response.body) {
      await response.body.cancel();
    }
    if (response.status === 200) {
      return;
    }
  }
};

export default waitForFileUpload;
