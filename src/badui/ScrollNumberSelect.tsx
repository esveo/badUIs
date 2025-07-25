import { useState } from "react";

export function ScrollNumberSelect() {
  const [value, setValue] = useState(0);
  return (
    <div className="flex flex-row items-center">
      <div className="mr-4">ZIP Code (scroll on yellow box to select value):</div>
      <input type="number" value={value} readOnly className="text-right border-gray-500 border-2" />
      <div
        className="w-[15px] h-[15px] overflow-y-scroll bg-amber-300"
        title="Scroll to change value"
        onScroll={(e) => {
          const scrollTop = e.currentTarget.scrollTop;
          setValue(Math.round(scrollTop));
        }}
      >
        <div className="h-[100014px]" />
      </div>
    </div>
  );
}
