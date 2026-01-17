# brainfaq-mcp

MCP server for the [Brainfuck](https://esolangs.org/wiki/Brainfuck) programming language.

## Usage

Use this command to run the MCP server:

```
npx -y brainfaq-mcp
```

## Features

### MCP Tools

- **load_code** - Reset the debugger and load new Brainfuck source code. Supports configurable tape size, min/max cell values, and initial input.
- **step** - Execute a specified number of instructions (default 1) with detailed state output.
- **run** - Run the program until it finishes or waits for input, with optional instruction limit.
- **add_input** - Append characters to the input buffer when the program is waiting for input.
- **get_state** - Get the current interpreter state (memory, pointers, output) with optional windowing.
- **read_output** - Get the complete output string generated so far.

### Capabilities

- Full Brainfuck support (8 operations: `>`, `<`, `+`, `-`, `.`, `,`, `[`, `]`)
- Overflow/underflow detection with configurable value limits
- Bracket matching validation and loop control
- Step-by-step execution and debugging
- Memory protection with configurable tape size

## Development

Setup:

```
npm i
```

Build:

```
npm run build
```

Tests:

```
npm run test
```

Tests are inspired by the [Brainfuck test suite](https://brainfuck.org/tests.b) by Daniel Cristofani.

## Release

Build first the source code using the command above.

Login to NPM:

```
npm login
```

Publish to NPM:

```
npm publish
```

## License

All work in this repos is licensed under "Creative Commons Attribution-ShareAlike 4.0 International License".