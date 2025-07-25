import { useState, type ComponentProps } from "react";
import cupBottom from "../assets/cup-bottom.png";
import cupTop from "../assets/cup-top.png";

const OFFSET_X = 150;
const BUTTON_OFFSET_Y = 100;

export function FinalDecision(props: {
  prompt: string;
  onSuccess?: () => void;
  onError?: () => void;
}) {
  const [positions, setPositions] = useState([-2, -1, 0, 1, 2]);
  const [uiState, setUiState] = useState<
    | "initial"
    | "prepare"
    | "shuffling"
    | "waiting"
    | "reveal-success"
    | "reveal-error"
  >("initial");

  function startShuffle() {
    const shuffleCount = 10 + Math.floor(Math.random() * 10);
    setUiState("prepare");
    setTimeout(() => {
      setUiState("shuffling");
      let count = 0;
      const interval = setInterval(() => {
        // only swap with the correct cup for the first half of the shuffles
        // then proceed to swap completely random
        const swapOnlyWithButton = count < shuffleCount / 2;
        setPositions((a) => swap(a, swapOnlyWithButton));
        if (++count >= shuffleCount) {
          clearInterval(interval);
          setUiState("waiting");
        }
      }, 500);
    }, 1000);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <h1>{props.prompt}</h1>
      <div>
        To confirm, please click the{" "}
        <span className="text-red-500">CONFIRM</span> button*.
        <br />
      </div>
      {uiState !== "initial" && (
        <span className="text-[10px] text-center w-full">
          *and select the right cup!
        </span>
      )}
      <div
        className="grid grid-cols-1 grid-rows-2 w-full gap-5 h-32 justify-items-center items-center transform-3d overflow-visible"
        style={{
          gridTemplateRows: "1fr 192px",
        }}
      >
        <OffButton
          dx={positions[Math.floor(positions.length / 2)] * OFFSET_X}
          dy={
            uiState === "shuffling" || uiState === "waiting"
              ? BUTTON_OFFSET_Y
              : 0
          }
          onClick={() => startShuffle()}
          disabled={uiState !== "initial" && uiState !== "prepare"}
        >
          {uiState === "reveal-success"
            ? "NICE!"
            : uiState === "reveal-error"
            ? "TOO BAD!"
            : "CONFIRM"}
        </OffButton>
        {positions.map((offset, index) => (
          <Cup
            key={index}
            disabled={uiState !== "waiting"}
            state={
              uiState === "reveal-success" || uiState === "reveal-error"
                ? index === Math.floor(positions.length / 2)
                  ? "correct"
                  : "error"
                : "neutral"
            }
            dx={offset * OFFSET_X}
            dy={uiState === "initial" ? -window.innerHeight * 1.1 : 0}
            onclick={() => {
              const correctIndex = Math.floor(positions.length / 2);
              if (index === correctIndex) {
                setUiState("reveal-success");
                props.onSuccess?.();
              } else {
                setUiState("reveal-error");
                props.onError?.();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function OffButton(
  props: ComponentProps<"button"> & { dx: number; dy: number }
) {
  return (
    <button
      className="h-10 rounded-sm row-start-1 border px-3 py-2 cursor-pointer transition-transform duration-500 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        transform: `translateX(${props.dx}px) translateY(${props.dy}px) translateZ(10px)`,
      }}
      {...props}
    />
  );
}

export function Cup(props: {
  dx: number;
  dy: number;
  onclick?: () => void;
  disabled: boolean;
  state: "correct" | "error" | "neutral";
}) {
  const filter =
    props.state === "neutral"
      ? "grayscale(1.0)"
      : props.state === "correct"
      ? "hue-rotate(140deg)"
      : "";
  return (
    <button
      className={`w-48 h-48 top-0 col-start-1 row-start-2 transform-3d transition-transform cursor-pointer ${
        props.disabled ? "" : "hover:rotate-2 hover:scale-105"
      }"`}
      onClick={props.onclick}
      disabled={props.disabled}
    >
      <img
        src={cupTop}
        className="transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(${props.dx}px) translateY(${props.dy}px) translateZ(-10px)`,
          filter,
        }}
      />
      <img
        src={cupBottom}
        className="transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(${props.dx}px) translateY(${props.dy}px) translateZ(20px)`,
          filter,
        }}
      />
    </button>
  );
}

function swap<T>(_array: T[], swapWithCorrectCup = false) {
  const array = [..._array];

  let index1: number, index2: number;
  if (swapWithCorrectCup) {
    index1 = Math.floor(array.length / 2);
    index2 = array
      .map((_, i) => i)
      .filter((i) => i !== index1)
      .at(Math.floor(Math.random() * (array.length - 1))) as number;
    console.log(index1, index2);
  } else {
    index1 = Math.floor(Math.random() * array.length);
    index2 = Math.floor(Math.random() * array.length);

    if (index1 === index2) {
      index2 = (index2 + 1) % array.length;
    }
  }

  const temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;

  return array;
}
