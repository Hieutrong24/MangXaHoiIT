import { RouterProvider } from 'react-router-dom';
import router from './routes/index.jsx';
import { ArchitectureMonitorProvider } from '../components/ArchitectureMonitor/ArchitectureMonitor.jsx';

export default function App() {
  return (
    <ArchitectureMonitorProvider>
      <RouterProvider router={router} />
    </ArchitectureMonitorProvider>
  );
}
