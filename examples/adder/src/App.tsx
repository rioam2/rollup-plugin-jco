import { AdderFromBindings } from './components/AdderFromBindings';
import { AdderFromImport } from './components/AdderFromImport';
import { AdderFromImportAsync } from './components/AdderFromImportAsync';

export function App() {
  return (
    <>
      <AdderFromBindings />
      <AdderFromImport />
      <AdderFromImportAsync />
    </>
  );
}
