#!/usr/bin/env python3
"""
Python Data Processor Action
Processes numerical data and performs various operations
"""

import os
import json
import sys

def main():
    # Read inputs from environment variables
    data_str = os.environ.get('INPUT_DATA', '[1, 2, 3, 4, 5]')
    operation = os.environ.get('INPUT_OPERATION', 'sum')
    
    try:
        # Parse JSON data
        data = json.loads(data_str)
        
        if not isinstance(data, list):
            raise ValueError("Input data must be a JSON array")
        
        # Convert to numbers
        numbers = [float(x) for x in data]
        count = len(numbers)
        
        # Perform operation
        if operation == 'sum':
            result = sum(numbers)
        elif operation == 'average':
            result = sum(numbers) / count if count > 0 else 0
        elif operation == 'max':
            result = max(numbers) if count > 0 else 0
        elif operation == 'min':
            result = min(numbers) if count > 0 else 0
        else:
            raise ValueError(f"Unknown operation: {operation}")
        
        # Output results
        print(f"Processing {count} numbers with operation: {operation}")
        print(f"Result: {result}")
        
        # Write to GITHUB_OUTPUT
        github_output = os.environ.get('GITHUB_OUTPUT')
        if github_output:
            with open(github_output, 'a') as f:
                f.write(f"result={result}\n")
                f.write(f"count={count}\n")
        
        print(f"✓ Successfully processed {count} items")
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
