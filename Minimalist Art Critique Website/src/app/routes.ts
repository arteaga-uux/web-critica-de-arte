import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "./components/Layout";
import { About } from "./components/About";
import { Resenas } from "./components/Resenas";
import { Numeros } from "./components/Numeros";
import { Entrevistas } from "./components/Entrevistas";
import { ArticlePage } from "./components/ArticlePage";
import { NumeroPage } from "./components/NumeroPage";
import { EntrevistaPage } from "./components/EntrevistaPage";
import { Ultimos } from "./components/Ultimos";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, loader: () => redirect("/ultimos") },
      { path: "about", Component: About },
      { path: "ultimos", Component: Ultimos },
      { path: "resenas", Component: Resenas },
      { path: "resenas/:id", Component: ArticlePage },
      { path: "numeros", Component: Numeros },
      { path: "numeros/:id", Component: NumeroPage },
      { path: "entrevistas", Component: Entrevistas },
      { path: "entrevistas/:id", Component: EntrevistaPage },
    ],
  },
]);