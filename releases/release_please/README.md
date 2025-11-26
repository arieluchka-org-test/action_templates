# Bash Greeter Action

## Description
A simple custom GitHub Action that demonstrates using bash scripts within actions. This action takes a name as input and generates a personalized greeting message.

## Inputs

### `who-to-greet`
**Required** The name of the person to greet. Default: `"World"`.

## Outputs

### `greeting-message`
The generated greeting message.

## Example Usage

```yaml
- name: Greet someone
  id: greeter
  uses: ./.github/actions/bash-greeter
  with:
    who-to-greet: 'GitHub User'

- name: Display greeting
  run: echo "${{ steps.greeter.outputs.greeting-message }}"
```

## How it Works
This action uses a composite action type with bash shell commands. The script:
1. Accepts the `who-to-greet` input parameter
2. Constructs a greeting message
3. Outputs the message to GITHUB_OUTPUT for use in subsequent steps
4. Echoes the result to the workflow log
