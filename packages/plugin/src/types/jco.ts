/** Full JCO transpile options */
export type TranspileOptions = NonNullable<
  Parameters<(typeof import('@bytecodealliance/jco'))['transpile']>[1]
>;

/** JCO transpile options without options for changing name or outDir */
export type ControlledTranspileOptions = Omit<
  TranspileOptions,
  'name' | 'outDir'
>;
