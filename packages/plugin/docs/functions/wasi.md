[**rollup-plugin-jco**](../README.md)

---

[rollup-plugin-jco](../README.md) / wasi

# Function: wasi()

> **wasi**(`options`?: `ControlledTranspileOptions`): `Plugin`

Defined in: [packages/plugin/src/plugins/wasi.ts:52](https://github.com/rioam2/rollup-plugin-jco/blob/main/packages/plugin/src/plugins/wasi.ts#L52)

Rollup plugin for transpiling WebAssembly components to JavaScript bindings using JCO.
This plugin also supports transpiling WebAssembly components to their core WebAssembly modules.

## Parameters

| Parameter  | Type                         | Description                   |
| ---------- | ---------------------------- | ----------------------------- |
| `options`? | `ControlledTranspileOptions` | Transpilation options for JCO |

## Returns

`Plugin`

Rollup plugin for transpiling WebAssembly components

## See

JCO-Documentation: https://bytecodealliance.github.io/jco/

## Throws

Error if the component cannot be transpiled

## Throws

Error if the component is not a valid WebAssembly component
