import { useEffect, useRef, useState } from "react";

import styles from "./CoolAppContentWrapper.module.css";

let mouseX = 0;
let mouseY = 0;
let virtualCursorX = 0;
let virtualCursorY = 0;

const RADIUS = 20;
const SPEED = 3;
const MIN_DISTANCE = 100;
const MAX_DISTANCE = 600;

/**
 * Usage example:
 *
 * ```tsx
 * <CoolAppContentWrapper wrapperClassName="w-screen h-screen flex items-center justify-center">
 *    <BadUIButton />
 * </CoolAppContentWrapper>
 * ```
 */
export function CoolAppContentWrapper(props: { children?: React.ReactNode; wrapperClassName?: string }) {
  const [pos, setPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [virtualCursorPos, setVirtualCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const interval = setInterval(() => {
      processTick();
      setVirtualCursorPos({ x: virtualCursorX, y: virtualCursorY });
    }, 1000 / 60); // 30 FPS
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    virtualCursorX = window.innerWidth / 2;
    virtualCursorY = window.innerHeight / 2;
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setPos({ x, y });
      mouseX = x;
      mouseY = y;
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const mouseClickHighlightRef = useRef<HTMLImageElement>(null);

  return (
    <div className={`w-full h-full flex items-center justify-center ${props.wrapperClassName}`}>
      <div className="absolute text-red-600 top-0">Your cursor is afraid of the red dot...</div>
      {props.children}
      <div ref={mouseClickHighlightRef} style={{ top: virtualCursorPos.y, left: virtualCursorPos.x }} />
      <img
        tabIndex={-1}
        // inert prevents element from being focusable and clickable
        inert
        src="/cursor.png"
        className="absolute h-[24px] w-[20px]"
        // left is offset by 8px to center the tip of the finger on the cursor position
        style={{ top: virtualCursorPos.y, left: virtualCursorPos.x - 8 }}
      />
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // position needs to be 1px higher to move above the virtual cursor image
          const targetElement = document.elementFromPoint(virtualCursorPos.x, virtualCursorPos.y - 1);
          targetElement?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          if (targetElement && "focus" in targetElement) {
            (targetElement as HTMLElement).focus();
          }
          const current = mouseClickHighlightRef.current;
          if (!current) return;
          current.classList.remove(styles["mouse-click-highlight"]);
          // force evaluation to remove class before readding
          current.getBoundingClientRect();
          current.classList.add(styles["mouse-click-highlight"]);
        }}
        onWheel={(e) => {
          e.stopPropagation();
          const targetElement = document.elementFromPoint(virtualCursorPos.x, virtualCursorPos.y - 1);
          console.log("Wheel event on virtual cursor", e.deltaY, targetElement);
          targetElement?.dispatchEvent(new WheelEvent("wheel", { deltaY: e.deltaY, bubbles: true }));
        }}
        className={`bg-red-600 absolute opacity-50 cursor-none`}
        style={{
          height: RADIUS * 2,
          width: RADIUS * 2,
          borderRadius: RADIUS,
          top: pos.y - RADIUS,
          left: pos.x - RADIUS,
        }}
      />
    </div>
  );
}

function processTick() {
  const distanceX = virtualCursorX - mouseX;
  const distanceY = virtualCursorY - mouseY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  if (distance === 0) return;

  const normalizedDistanceX = distanceX / distance;
  const normalizedDistanceY = distanceY / distance;

  // this is moving in constant speed no matter the distance
  let dx = SPEED * normalizedDistanceX;
  let dy = SPEED * normalizedDistanceY;

  // add a factor that decreases by distance (min distance is taken, closer will not increase speed)
  const distanceFactor = distance > MAX_DISTANCE ? 0 : MIN_DISTANCE / Math.max(distance, MIN_DISTANCE);
  dx *= distanceFactor ** 2;
  dy *= distanceFactor ** 2;

  // run clamping
  virtualCursorX = Math.min(Math.max(virtualCursorX + dx, RADIUS), window.innerWidth - RADIUS);
  virtualCursorY = Math.min(Math.max(virtualCursorY + dy, RADIUS), window.innerHeight - RADIUS);
}
