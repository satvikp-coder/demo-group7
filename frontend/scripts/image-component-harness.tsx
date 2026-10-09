// Browser regression harness, imported only by tests; not an application entry point.
import React from "react";
import { createRoot } from "react-dom/client";
import { ImageWithFallback } from "../src/components/ImageWithFallback";

const container = document.createElement("div");
container.id = "image-regression-harness";
document.body.appendChild(container);
const root = createRoot(container);
export function render(props: React.ComponentProps<typeof ImageWithFallback>) {
  root.render(<ImageWithFallback {...props} loading="eager" className="w-20 h-20 object-cover" />);
}
export function dispose() { root.unmount(); container.remove(); }
