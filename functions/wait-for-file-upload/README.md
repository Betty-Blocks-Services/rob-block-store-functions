# Wait For File Upload

Polls a file URL with GET requests until it responds with HTTP 200, confirming the file has been fully uploaded and is ready for use. This is useful when a workflow needs to process a file immediately after upload, especially for large files where the upload may still be in progress when the next step runs.

Use an Expression step to get the URL from the File property (i.e. `{{{ file.url }}}`), and pass that value as the URL input to this step. The step yields nothing and simply blocks the flow until the file is reachable.

## Options

| Name | Type | Required | Description                                                  |
| ---- | ---- | -------- | ------------------------------------------------------------ |
| URL  | Text | Yes      | The URL to poll with GET requests until it responds with HTTP 200. |

## Yields

None. Execution continues once the file URL returns HTTP 200.

## Notes

- The response body is discarded on each poll to avoid loading the file into memory.
- The step will keep polling indefinitely; make sure the URL will eventually become reachable, or wrap it in a Try/Catch with a timeout mechanism if needed.
