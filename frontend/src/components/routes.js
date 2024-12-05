import MainPage from "../pages/MainPage/MainPage";
import Reporting from "../pages/Reporting/Reporting";

const routes = [
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/reporting",
    element: <Reporting />,
  },
];
export default routes;
