import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./index.css";

const rootElement = document.querySelector('[data-js="root"]');
const root = createRoot(rootElement);

const queryClient = new QueryClient();

root.render(
    <QueryClientProvider client={queryClient}>
       <App />
    </QueryClientProvider>
);
