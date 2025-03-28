import { AdderFromBindings } from './components/AdderFromBindings';
import { AdderFromImport } from './components/AdderFromImport';
import { AdderFromImportAsync } from './components/AdderFromImportAsync';

export function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxWidth: '900px',
        margin: '0 auto',
        paddingBottom: '2rem',
        textAlign: 'justify',
      }}
    >
      <h1 style={{}}>rollup-plugin-jco Examples</h1>
      <hr style={{ width: '100%' }} />
      <p>
        Below you can find three example components which use the
        rollup-plugin-jco build transformer to import a simple WebAssembly
        Component. The example component exports one function named
        "addTwoIntegers" which returns the sum of two input integers. The three
        different examples instantiate the WebAssembly Component in different
        ways with tradeoffs in terms of ease-of-use vs performance.
        <br />
        <br />
        You can view the source code for each example to see how they work.
      </p>
      <hr style={{ width: '100%' }} />
      <AdderFromBindings />
      <AdderFromImport />
      <AdderFromImportAsync />
    </div>
  );
}
