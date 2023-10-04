// routerTypes.ts
import { RouteProps as ReactRouteProps, RouteMatch } from 'react-router-dom';

export type RouteProps = ReactRouteProps & {
  element: React.ReactNode;
};

export type RouteObject = {
  path: string;
  element: React.ReactNode;
  children?: RouteObject[];
};

export type MatchParams = {
  [param: string]: string | undefined;
};

export type RouteMatchProps = {
  match: RouteMatch;
};

export type OutletProps = {
  outlet: string;
};
