# Python Data Processor Action

## Description
A custom GitHub Action that demonstrates using Python for data processing. This action takes a JSON array of numbers and performs various statistical operations on them.

## Inputs

### `data`
**Required** JSON array of numbers to process. Default: `"[1, 2, 3, 4, 5]"`.

### `operation`
**Optional** The operation to perform on the data. Default: `"sum"`.

Available operations:
- `sum` - Calculate the sum of all numbers
- `average` - Calculate the average (mean)
- `max` - Find the maximum value
- `min` - Find the minimum value

## Outputs

### `result`
The result of the specified operation.

### `count`
The number of items processed.

## Example Usage

```yaml
- name: Process data with Python
  id: processor
  uses: ./.github/actions/python-processor
  with:
    data: '[10, 20, 30, 40, 50]'
    operation: 'average'

- name: Display result
  run: |
    echo "Result: ${{ steps.processor.outputs.result }}"
    echo "Processed: ${{ steps.processor.outputs.count }} items"
```

## How it Works
This action:
1. Sets up Python 3.x using the official setup-python action
2. Runs the `process.py` script with inputs passed as environment variables
3. Parses the JSON data and validates it
4. Performs the requested mathematical operation
5. Outputs the result and count to GITHUB_OUTPUT for use in subsequent steps

The action demonstrates:
- Installing Python dependencies in composite actions
- Passing inputs to Python scripts via environment variables
- Error handling and validation in Python
- Writing outputs back to GitHub Actions
