import { Outlet } from "react-router-dom";

export function PlainLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}