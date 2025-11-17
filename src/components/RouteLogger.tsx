import { useRouteLogger } from '../hooks/useRouteLogger';

/**
 * Composant qui log automatiquement les changements de route
 * À utiliser comme wrapper dans le router
 */
export const RouteLogger = ({ children }: { children: React.ReactNode }) => {
  useRouteLogger();
  return <>{children}</>;
};

