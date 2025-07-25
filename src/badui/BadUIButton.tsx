import { useState } from "react";

export function BadUIButton() {
  const [count, setCount] = useState(0);
  return (
    <div
      onClick={() => setCount(count - 1)}
      className="cursor-pointer border-2 p-2 inline-block"
    >
      Click me! Count is {count}
    </div>
  );
}
