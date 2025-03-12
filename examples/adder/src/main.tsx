import * as ReactDOM from 'react-dom/client';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('No root element found');

ReactDOM.createRoot(container).render(<App />);
