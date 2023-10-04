import { Route, Routes } from 'react-router-dom';
import { RouteObject } from './routerTypes';
import FilterFiles from './components/FilterFiles/FilterFiles';
import Download from './components/Download/Download';

function AppRoutes() {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <FilterFiles />,
    },
    {
      path: '/download',
      element: <Download />,
    },
  ];

  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}

export default AppRoutes;
