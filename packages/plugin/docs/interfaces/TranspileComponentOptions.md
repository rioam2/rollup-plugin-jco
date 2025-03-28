[**rollup-plugin-jco**](../README.md)

---

[rollup-plugin-jco](../README.md) / TranspileComponentOptions

# Interface: TranspileComponentOptions

Defined in: [packages/plugin/src/plugins/transpileComponent.ts:33](https://github.com/rioam2/rollup-plugin-jco/blob/main/packages/plugin/src/plugins/transpileComponent.ts#L33)

**`Expand`**

Options for the `transpileComponent` rollup plugin.
`transpileOpts` are options passed to the `transpile` function from `@bytecodealliance/jco`.

## Properties

| Property                                    | Type                         | Description                                                                                                                                                        | Defined in                                                                                                                                                          |
| ------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="inputfile"></a> `inputFile`          | `string`                     | Path to the input WebAssembly component to transpile                                                                                                               | [packages/plugin/src/plugins/transpileComponent.ts:39](https://github.com/rioam2/rollup-plugin-jco/blob/main/packages/plugin/src/plugins/transpileComponent.ts#L39) |
| <a id="name"></a> `name`                    | `string`                     | Unique name of the WebAssembly Component (used to name generated bindings)                                                                                         | [packages/plugin/src/plugins/transpileComponent.ts:35](https://github.com/rioam2/rollup-plugin-jco/blob/main/packages/plugin/src/plugins/transpileComponent.ts#L35) |
| <a id="outdir"></a> `outDir`                | `string`                     | Output directory for generated bindings                                                                                                                            | [packages/plugin/src/plugins/transpileComponent.ts:37](https://github.com/rioam2/rollup-plugin-jco/blob/main/packages/plugin/src/plugins/transpileComponent.ts#L37) |
| <a id="transpileopts"></a> `transpileOpts?` | `ControlledTranspileOptions` | **`Interface`** **`Expand`** Options passed to the `transpile` function of `@bytecodealliance/jco` **See** https://bytecodealliance.github.io/jco/transpiling.html | [packages/plugin/src/plugins/transpileComponent.ts:46](https://github.com/rioam2/rollup-plugin-jco/blob/main/packages/plugin/src/plugins/transpileComponent.ts#L46) |
