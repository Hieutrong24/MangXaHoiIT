import { RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import router from "./routes";
import { QueryProvider } from "./providers/QueryProvider.jsx";
import { StoreProvider } from "./providers/StoreProvider.jsx";
import { ArchitectureMonitorProvider } from "../components/ArchitectureMonitor/ArchitectureMonitor.jsx";

export default function App() {
  return (
    <StoreProvider>
      <QueryProvider>
        <ArchitectureMonitorProvider>
          <RouterProvider router={router} />
          <ToastContainer
            position="top-right"
            autoClose={2500}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="dark"
          />
        </ArchitectureMonitorProvider>
      </QueryProvider>
    </StoreProvider>
  );
}
