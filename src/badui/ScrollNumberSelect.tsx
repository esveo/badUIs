import { useState } from "react";

export function ScrollNumberSelect() {
  const [value, setValue] = useState(0);
  const [isActive, setIsActive] = useState(false);
  return (
    <div className="flex flex-row items-center">
      <div className="mr-4">ZIP Code:</div>
      <input
        onClick={() => {
          setIsActive(true);
          window.alert("Scroll on yellow box to change value");
        }}
        type="text"
        value={value.toFixed(0).padStart(5, "0")}
        readOnly
        className="text-right border-gray-500 border-2 pr-4"
      />
      <div
        className={`w-[15px] h-[15px] overflow-y-scroll ${isActive ? "bg-yellow-300" : ""}`}
        title="Scroll to change value"
        onClick={() => window.alert("You need to scroll here and not click!")}
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
