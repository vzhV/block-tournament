import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window ||
    navigator.maxTouchPoints > 0);

const MyDnDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DndProvider
    backend={isTouchDevice() ? TouchBackend : HTML5Backend}
    options={isTouchDevice() ? { enableMouseEvents: true, delay: 100 } : undefined}
  >
    {children}
  </DndProvider>
);

export default MyDnDProvider;
