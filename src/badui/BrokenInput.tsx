import { useState } from "react";

export function BrokenInput(props: {
  placeholder?: string;
  anchor?: "left" | "right";
}) {
  const [value, setValue] = useState("");
  const { placeholder = "Type here...", anchor = "left" } = props;
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="border-1 p-1 rounded-sm transition-transform duration-500"
        style={{
          transform: `rotate(${anchor === "left" ? "+" : "-"}${
            25 * (1 - Math.exp(-0.5 * value.length))
          }deg)`,
          transformOrigin: anchor,
          textAlign: anchor === "left" ? "right" : "left",
          transitionTimingFunction: "cubic-bezier(0.57, 0, 0.35, 1.86)",
        }}
      />
    </div>
  );
}
