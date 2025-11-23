# JavaScript API Fetcher Action

## Description
A custom GitHub Action that demonstrates using JavaScript/Node.js to interact with external APIs. This action fetches data from any HTTP endpoint and can extract specific fields from JSON responses.

## Inputs

### `url`
**Required** The API URL to fetch data from.

### `method`
**Optional** HTTP method to use. Default: `"GET"`.

Supported methods: GET, POST, PUT, DELETE, etc.

### `extract-field`
**Optional** JSON field to extract from the response. If not specified, returns the entire response. Default: `""`.

## Outputs

### `status`
The HTTP status code of the response.

### `data`
The response data (full response or extracted field).

### `success`
Boolean indicating whether the request was successful (status 2xx).

## Example Usage

```yaml
- name: Fetch GitHub API data
  id: api
  uses: ./.github/actions/js-api-fetcher
  with:
    url: 'https://api.github.com/repos/octocat/hello-world'
    method: 'GET'
    extract-field: 'name'

- name: Display results
  run: |
    echo "Status: ${{ steps.api.outputs.status }}"
    echo "Success: ${{ steps.api.outputs.success }}"
    echo "Data: ${{ steps.api.outputs.data }}"
```

## How it Works
This action:
1. Sets up Node.js 20.x using the official setup-node action
2. Installs npm dependencies (node-fetch) required for making HTTP requests
3. Runs the `index.js` script with inputs passed as environment variables
4. Makes an HTTP request to the specified URL
5. Processes the response (JSON or text)
6. Optionally extracts a specific field from JSON responses
7. Outputs the status, success flag, and data to GITHUB_OUTPUT

The action demonstrates:
- Using Node.js in GitHub Actions
- Managing npm dependencies
- Making HTTP requests with node-fetch
- Handling JSON and text responses
- Error handling and logging
- Setting multiple outputs from JavaScript

## Dependencies
- **node-fetch**: Used for making HTTP requests (v2.6.7)
