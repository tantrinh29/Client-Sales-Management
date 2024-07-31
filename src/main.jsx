import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { AppContextProvider } from "./contexts/AppContextProvider.jsx";
import { Provider } from "react-redux";
import { persistor, store } from "./stores/app.store.js";
import AppRouter from "./routes/AppRouter";
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <AppContextProvider>
              <AppRouter />
            </AppContextProvider>
          </PersistGate>
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  // </React.StrictMode>
);

