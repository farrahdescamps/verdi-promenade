import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { DebugButton } from "./components/DebugButton";
import { RouteLogger } from "./components/RouteLogger";
import { ResetButton } from "./components/ResetButton";
import { PageTransition } from "./components/PageTransition";
import { SessionProvider } from "./contexts/SessionContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SplashScreen } from "./screens/SplashScreen";
import { PageConnexion } from "./screens/PageConnexion";
import { PageHome } from "./screens/PageHome";
import { PageChoixIntro } from "./screens/PageChoixIntro";
import { PageMonAventure } from "./screens/PageMonAventure";
import { PageActivite } from "./screens/PageActivite";
import { PageEnjoyStay } from "./screens/PageEnjoyStay";
import { PageChat } from "./screens/PageChat";
import { PageTest } from "./screens/PageTest";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RouteLogger>
        <DebugButton />
      </RouteLogger>
    ),
    children: [
      {
        index: true,
        element: <SplashScreen />,
      },
      {
        path: "page-connexion",
        element: <PageConnexion />,
      },
      {
        path: "home",
        element: <PageHome />,
      },
      {
        path: "page-choix-intro",
        element: <PageChoixIntro />,
      },
      {
        path: "journey",
        element: <PageMonAventure />,
      },
      {
        path: "enjoy-stay",
        element: (
          <PageTransition>
            <PageEnjoyStay />
          </PageTransition>
        ),
      },
      {
        path: "activite/:activityId",
        element: (
          <PageTransition>
            <PageActivite />
          </PageTransition>
        ),
      },
      {
        path: "chat",
        element: <PageChat />,
      },
      {
        path: "test",
        element: <PageTest />,
      },
      {
        path: "*",
        element: (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-red-600 text-lg mb-2">Page non trouvée</div>
              <div className="text-gray-600 text-sm mb-4">La page que vous recherchez n'existe pas.</div>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        ),
      },
    ],
  },
]);

export const App = () => {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-transparent overflow-y-auto">
        <div className="relative z-10 min-h-screen">
          <SessionProvider>
            <RouterProvider router={router} />
          </SessionProvider>
        </div>
        <ResetButton />
      </div>
    </ThemeProvider>
  );
};