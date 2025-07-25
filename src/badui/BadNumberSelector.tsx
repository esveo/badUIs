import { Fragment, useCallback, useEffect, useState } from "react";

export function BadNumberSelector() {
  const [numberSelectorOpen, setNumberSelectorOpen] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<null | number>();

  return (
    <>
      <div>
        <span>Select a Number</span>
        <div
          className="h-10 rounded-sm border w-[200px] pl-3 py-2 pr-8 flex flex-row space-between"
          onClick={() => setNumberSelectorOpen(!numberSelectorOpen)}
        >
          {currentNumber}
        </div>
        {numberSelectorOpen ? (
          <span>Hit the black circle to close</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
      {numberSelectorOpen && (
        <div className="absolute w-screen h-screen">
          <Target
            onClickCircle={(index) =>
              setCurrentNumber(
                currentNumber ? parseInt(`${currentNumber}${index}`) : index
              )
            }
            onClose={() => setNumberSelectorOpen(false)}
          />
        </div>
      )}
    </>
  );
}

function Target(props: {
  onClickCircle: (index: number) => void;
  onClose: () => void;
}) {
  const maxRadius = 10;
  const step = 1;

  const maxX = 200;
  const maxY = 200;

  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);

  const [movementVector, setMovementVector] = useState({
    x: 1,
    y: 1,
  });

  const [cycle, setCycle] = useState(5);

  const iterCb = useCallback(() => {
    if (
      positionX > maxX ||
      positionX < -maxX ||
      positionY > maxY ||
      positionY < -maxY
    ) {
      console.log("Return to center when component exceeds boundary");
      setMovementVector({
        x: positionX > maxX ? -3 : 3,
        y: positionY > maxY ? -3 : 3,
      });
      setCycle(20);
    }
    setPositionX(positionX + movementVector.x);
    setPositionY(positionY + movementVector.y);

    if (cycle === 0) {
      const vector = {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
      };

      const vLen = Math.sqrt((vector.x ^ 2) + (vector.y ^ 2));
      setMovementVector({
        x: (vector.x / vLen) * 3,
        y: (vector.y / vLen) * 3,
      });
      setCycle(Math.max(Math.floor(Math.random() * 50), 10));
    } else {
      setCycle(cycle - 1);
    }
  }, [cycle, movementVector, positionX, positionY]);

  useEffect(() => {
    setTimeout(() => {
      iterCb();
    }, 8);
  }, [iterCb]);

  return (
    <svg
      viewBox="0 0 100 30"
      className="absolute"
      style={{ left: positionX, bottom: positionY }}
    >
      <circle
        cx={50}
        cy={15}
        r={maxRadius + step}
        fill={"black"}
        onClick={() => props.onClose()}
        className="cursor-crosshair"
      ></circle>

      {Array(10)
        .fill(null)
        .map((_, index) => {
          return (
            <Fragment key={index}>
              <circle
                cx={50}
                cy={15}
                r={maxRadius - index * step}
                fill={index % 2 === 0 ? "red" : "white"}
                onClick={() => props.onClickCircle(index)}
                className="cursor-crosshair"
              ></circle>
              <text
                fontSize={0.8}
                x={50}
                y={5.5 + index * step}
                className="font-mono select-none"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {9 - index}
              </text>
            </Fragment>
          );
        })}
    </svg>
  );
}
