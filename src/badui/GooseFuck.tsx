import { useCallback, useEffect, useState } from "react";

type Color = [number, number, number]; // [Hue (0-360), Chroma (0-0.4), Lightness (0-1)]
type Position = { x: number; y: number };

// Constants for movement and food scanning
const MOVEMENT_INTERVAL = 500; // 500ms for both movement and food scanning
const PICKUP_RADIUS = 0.05; // Distance at which geese can eat food
const SCAN_RADIUS = 0.2; // Distance at which geese can detect food (20% of screen)
const FOOD_SPEED_MULTIPLIER = 2; // Speed multiplier when moving towards food
const GOOSE_GROWTH_DURATION = 10000; // 10 seconds for geese to grow
const MIN_VELOCITY = 0.01;
const MAX_VELOCITY = 0.05;
const SCALE_UPDATE_INTERVAL = 100; // Update every 100ms for smooth animation
const GOOSE_MIN_SCALE = 0.5; // Minimum scale for baby geese
const GOOSE_MAX_SCALE = 1.0; // Maximum scale for adult geese

const startingColors = [
  [29.23, 0.628, 0.2577], // Red
  [142.4953, 0.294827, 0.8664], // Green
  [264.052, 0.313214, 0.452], // Blue
] as Color[];

type FoodType =
  | "increase_l"
  | "decrease_l"
  | "increase_c"
  | "decrease_c"
  | "shift_h_cw"
  | "shift_h_ccw";

type FoodItem = {
  type: FoodType;
  color: Color;
  effect: number; // Amount to change L, C, or H by
};

const foodItems: FoodItem[] = [
  { type: "increase_l", color: [60, 0.2, 0.9], effect: 0.1 }, // Bright yellow - increases lightness
  { type: "decrease_l", color: [270, 0.2, 0.2], effect: 0.1 }, // Dark purple - decreases lightness
  { type: "increase_c", color: [0, 0.3, 0.6], effect: 0.05 }, // Saturated red - increases chroma
  { type: "decrease_c", color: [0, 0.05, 0.5], effect: 0.05 }, // Desaturated red - decreases chroma
  { type: "shift_h_cw", color: [30, 0.25, 0.7], effect: 30 }, // Orange - shifts hue clockwise by 30°
  { type: "shift_h_ccw", color: [330, 0.25, 0.7], effect: 30 }, // Magenta - shifts hue counter-clockwise by 30°
];

type Goose = {
  color: Color;
  position: Position;
  birthTime?: number; // Timestamp when the goose was born
  velocity?: number; // Random velocity between 0.01 and 0.05
};

type FoodOnGround = {
  item: FoodItem;
  position: Position;
  id: number;
};

// Helper function to mix two HCL colors (average hue, keep chroma and lightness the same)
function mixColors(color1: Color, color2: Color): Color {
  const [h1, c1, l1] = color1;
  const [h2] = color2;

  // Calculate average hue (handling circular nature of hue)
  let avgHue;
  const diff = Math.abs(h2 - h1);
  if (diff <= 180) {
    avgHue = (h1 + h2) / 2;
  } else {
    // Handle wrap-around case
    avgHue = (h1 + h2 + 360) / 2;
    if (avgHue >= 360) avgHue -= 360;
  }

  // Keep the same chroma and lightness from the first parent
  return [avgHue, c1, l1];
}

// Helper function to generate random velocity
const generateRandomVelocity = (): number =>
  Math.random() * (MAX_VELOCITY - MIN_VELOCITY) + MIN_VELOCITY;

// Helper function to calculate distance between two positions
const calculateDistance = (pos1: Position, pos2: Position): number =>
  Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));

// Helper function to clamp position within bounds
const clampPosition = (value: number): number =>
  Math.max(0, Math.min(1, value));

// Helper function to apply food effect to goose color
const applyFoodEffect = (
  color: Color,
  foodType: FoodType,
  effect: number
): Color => {
  const [h, c, l] = color;
  let newH = h;
  let newC = c;
  let newL = l;

  switch (foodType) {
    case "increase_l":
      newL = Math.min(1, l + effect);
      break;
    case "decrease_l":
      newL = Math.max(0, l - effect);
      break;
    case "increase_c":
      newC = Math.min(0.4, c + effect);
      break;
    case "decrease_c":
      newC = Math.max(0, c - effect);
      break;
    case "shift_h_cw":
      newH = (h + effect) % 360;
      break;
    case "shift_h_ccw":
      newH = (h - effect + 360) % 360;
      break;
  }

  return [newH, newC, newL];
};

export function GooseFuck() {
  const [geese, setGeese] = useState<Goose[]>([]);
  const [draggedGooseIndex, setDraggedGooseIndex] = useState<number | null>(
    null
  );
  const [foodOnGround, setFoodOnGround] = useState<FoodOnGround[]>([]);
  const [nextFoodId, setNextFoodId] = useState(0);

  // Ensure all geese have a velocity property
  useEffect(() => {
    setGeese((prev) =>
      prev.map((goose) => ({
        ...goose,
        velocity: goose.velocity ?? generateRandomVelocity(),
      }))
    );
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, color: Color) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const newGoose: Goose = {
      color,
      position: {
        x: clampPosition(x),
        y: clampPosition(y),
      },
      birthTime: Date.now(),
      velocity: generateRandomVelocity(),
    };

    setGeese((prev) => [...prev, newGoose]);
  }, []);

  const handleGooseMix = useCallback(
    (e: React.DragEvent, targetGooseIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (
        draggedGooseIndex !== null &&
        draggedGooseIndex !== targetGooseIndex
      ) {
        const draggedGoose = geese[draggedGooseIndex];
        const targetGoose = geese[targetGooseIndex];

        // Check if both geese are fully grown
        const now = Date.now();
        const draggedGooseAge = draggedGoose.birthTime
          ? now - draggedGoose.birthTime
          : Infinity;
        const targetGooseAge = targetGoose.birthTime
          ? now - targetGoose.birthTime
          : Infinity;

        // Only allow breeding if both geese are fully grown
        if (
          draggedGooseAge >= GOOSE_GROWTH_DURATION &&
          targetGooseAge >= GOOSE_GROWTH_DURATION
        ) {
          const mixedColor = mixColors(draggedGoose.color, targetGoose.color);

          // Calculate the midpoint between the two geese
          const midX = (draggedGoose.position.x + targetGoose.position.x) / 2;
          const midY = (draggedGoose.position.y + targetGoose.position.y) / 2;

          const newGoose: Goose = {
            color: mixedColor,
            position: {
              x: clampPosition(midX),
              y: clampPosition(midY),
            },
            birthTime: Date.now(),
            velocity: generateRandomVelocity(),
          };

          setGeese((prev) => [...prev, newGoose]);
        }
      }
      setDraggedGooseIndex(null);
    },
    [draggedGooseIndex, geese]
  );

  const handleFoodDrop = useCallback(
    (e: React.DragEvent, targetGooseIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      const foodData = e.dataTransfer.getData("food");
      if (foodData) {
        const foodType = foodData as FoodType;
        const foodItem = foodItems.find((item) => item.type === foodType);

        if (foodItem) {
          setGeese((prev) =>
            prev.map((goose, idx) => {
              if (idx === targetGooseIndex) {
                const newColor = applyFoodEffect(
                  goose.color,
                  foodType,
                  foodItem.effect
                );
                return { ...goose, color: newColor };
              }
              return goose;
            })
          );
        }
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  return (
    <div
      className="grid grid-cols-2 grid-rows-2 w-full h-full p-2 gap-2"
      style={{
        gridTemplateColumns: "1fr max-content",
      }}
    >
      <div
        className="col-start-1 row-start-1 row-span-2 relative bg-gray-400"
        onDrop={(e) => {
          e.preventDefault();
          const colorData = e.dataTransfer.getData("color");
          const gooseData = e.dataTransfer.getData("goose");
          const foodData = e.dataTransfer.getData("food");

          if (colorData) {
            // Handle egg drop
            const color = JSON.parse(colorData) as Color;
            handleDrop(e, color);
          } else if (foodData) {
            // Handle food drop
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            const foodType = foodData as FoodType;
            const foodItem = foodItems.find((item) => item.type === foodType);

            if (foodItem) {
              const newFoodOnGround: FoodOnGround = {
                item: foodItem,
                position: {
                  x: clampPosition(x),
                  y: clampPosition(y),
                },
                id: nextFoodId,
              };

              setFoodOnGround((prev) => [...prev, newFoodOnGround]);
              setNextFoodId((prev) => prev + 1);
            }
          } else if (gooseData && draggedGooseIndex !== null) {
            // Handle goose drop on background
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            // Just move the goose to new position
            setGeese((prev) =>
              prev.map((goose, idx) =>
                idx === draggedGooseIndex
                  ? {
                      ...goose,
                      position: {
                        x: clampPosition(x),
                        y: clampPosition(y),
                      },
                    }
                  : goose
              )
            );
            setDraggedGooseIndex(null);
          }
        }}
        onDragOver={handleDragOver}
      >
        {geese.map((goose, index) => (
          <Goose
            key={index}
            color={goose.color}
            position={goose.position}
            birthTime={goose.birthTime}
            index={index}
            onDragStart={() => setDraggedGooseIndex(index)}
            onDrop={(e) => handleGooseMix(e, index)}
            onFoodDrop={(e) => handleFoodDrop(e, index)}
            onDragOver={handleDragOver}
            onPositionChange={(newPosition) => {
              setGeese((prev) =>
                prev.map((g, idx) =>
                  idx === index ? { ...g, position: newPosition } : g
                )
              );
            }}
            foodOnGround={foodOnGround}
            onEatFood={(foodId: number) => {
              const foodItem = foodOnGround.find((food) => food.id === foodId);
              if (foodItem) {
                // Apply food effect to the goose
                setGeese((prev) =>
                  prev.map((g, idx) => {
                    if (idx === index) {
                      const newColor = applyFoodEffect(
                        g.color,
                        foodItem.item.type,
                        foodItem.item.effect
                      );
                      return { ...g, color: newColor };
                    }
                    return g;
                  })
                );
              }

              setFoodOnGround((prev) =>
                prev.filter((food) => food.id !== foodId)
              );
            }}
          />
        ))}
        {/* Render food on ground */}
        {foodOnGround.map((food) => (
          <div
            key={food.id}
            style={{
              position: "absolute",
              left: `${food.position.x * 100}%`,
              top: `${food.position.y * 100}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 1,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 50 50"
              style={{
                color: `oklch(${food.item.color[2]} ${food.item.color[1]} ${food.item.color[0]})`,
              }}
              width="20"
              height="20"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="currentColor"
                stroke="#333"
                strokeWidth="2"
              />
              <circle cx="18" cy="20" r="3" fill="#333" opacity="0.3" />
              <circle cx="32" cy="22" r="2" fill="#333" opacity="0.3" />
              <circle cx="25" cy="30" r="2.5" fill="#333" opacity="0.3" />
              {/* Add visual indicators for food type */}
              {food.item.type.includes("increase") && (
                <text
                  x="25"
                  y="15"
                  fill="#fff"
                  fontSize="8"
                  textAnchor="middle"
                >
                  +
                </text>
              )}
              {food.item.type.includes("decrease") && (
                <text
                  x="25"
                  y="15"
                  fill="#fff"
                  fontSize="8"
                  textAnchor="middle"
                >
                  -
                </text>
              )}
              {food.item.type === "shift_h_cw" && (
                <text
                  x="25"
                  y="15"
                  fill="#fff"
                  fontSize="6"
                  textAnchor="middle"
                >
                  ↻
                </text>
              )}
              {food.item.type === "shift_h_ccw" && (
                <text
                  x="25"
                  y="15"
                  fill="#fff"
                  fontSize="6"
                  textAnchor="middle"
                >
                  ↺
                </text>
              )}
              {food.item.type.includes("_l") && (
                <text
                  x="25"
                  y="40"
                  fill="#fff"
                  fontSize="6"
                  textAnchor="middle"
                >
                  L
                </text>
              )}
              {food.item.type.includes("_c") && (
                <text
                  x="25"
                  y="40"
                  fill="#fff"
                  fontSize="6"
                  textAnchor="middle"
                >
                  C
                </text>
              )}
              {food.item.type.includes("_h") && (
                <text
                  x="25"
                  y="40"
                  fill="#fff"
                  fontSize="6"
                  textAnchor="middle"
                >
                  H
                </text>
              )}
            </svg>
          </div>
        ))}
      </div>
      <div className="col-start-2 row-start-1 flex flex-col gap-4 bg-slate-500 p-8">
        {startingColors.map((color, index) => (
          <Egg key={index} color={color} />
        ))}
      </div>
      <div className="col-start-2 row-start-2 flex flex-col gap-4 bg-slate-600 p-8">
        {foodItems.map((food, index) => (
          <Food key={index} foodItem={food} />
        ))}
      </div>
    </div>
  );
}

function Food(props: { foodItem: FoodItem }) {
  const { foodItem } = props;

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("food", foodItem.type);
    },
    [foodItem.type]
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{ cursor: "grab", display: "inline-block" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 50 50"
        style={{
          color: `oklch(${foodItem.color[2]} ${foodItem.color[1]} ${foodItem.color[0]})`,
        }}
        width="30"
        height="30"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="currentColor"
          stroke="#333"
          strokeWidth="2"
        />
        <circle cx="18" cy="20" r="3" fill="#333" opacity="0.3" />
        <circle cx="32" cy="22" r="2" fill="#333" opacity="0.3" />
        <circle cx="25" cy="30" r="2.5" fill="#333" opacity="0.3" />
        {/* Add visual indicators for food type */}
        {foodItem.type.includes("increase") && (
          <text x="25" y="15" fill="#fff" fontSize="12" textAnchor="middle">
            +
          </text>
        )}
        {foodItem.type.includes("decrease") && (
          <text x="25" y="15" fill="#fff" fontSize="12" textAnchor="middle">
            -
          </text>
        )}
        {foodItem.type === "shift_h_cw" && (
          <text x="25" y="15" fill="#fff" fontSize="10" textAnchor="middle">
            ↻
          </text>
        )}
        {foodItem.type === "shift_h_ccw" && (
          <text x="25" y="15" fill="#fff" fontSize="10" textAnchor="middle">
            ↺
          </text>
        )}
        {foodItem.type.includes("_l") && (
          <text x="25" y="42" fill="#fff" fontSize="8" textAnchor="middle">
            L
          </text>
        )}
        {foodItem.type.includes("_c") && (
          <text x="25" y="42" fill="#fff" fontSize="8" textAnchor="middle">
            C
          </text>
        )}
        {foodItem.type.includes("_h") && (
          <text x="25" y="42" fill="#fff" fontSize="8" textAnchor="middle">
            H
          </text>
        )}
      </svg>
    </div>
  );
}

function Egg(props: { color: [number, number, number] }) {
  const { color } = props;

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("color", JSON.stringify(color));
    },
    [color]
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{ cursor: "grab", display: "inline-block" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        id="Layer_1"
        viewBox="0 0 80 80"
        style={{ color: `oklch(${color[2]} ${color[1]} ${color[0]})` }}
        width="50"
        height="50"
      >
        <defs>
          <clipPath id="clippath">
            <path
              d="M69.05,49.68c0,16.55-13.42,29.97-29.97,29.97s-29.97-13.42-29.97-29.97S22.53,1.63,39.08,1.63s29.97,31.5,29.97,48.05Z"
              fill="currentColor"
            />
          </clipPath>
        </defs>
        <path
          d="M69.05,49.68c0,16.55-13.42,29.97-29.97,29.97s-29.97-13.42-29.97-29.97S22.53,1.63,39.08,1.63s29.97,31.5,29.97,48.05Z"
          fill="currentColor"
        />
        <g clip-path="url(#clippath)">
          <g opacity=".06">
            <path
              d="M1.27,25.74c-.05,9.85.11,19.97,4.21,29.11,3.85,8.61,10.79,16.65,18.42,22.14,17.46,12.55,39.38,6.08,55.49-5.32,5.21-3.69.22-12.36-5.05-8.63-13.26,9.39-30.94,16.07-45.49,5.24-5.93-4.42-11.47-11.12-14.44-17.89-3.37-7.7-3.18-16.42-3.14-24.65.03-6.44-9.97-6.44-10,0h0Z"
              fill="#603813"
            />
          </g>
        </g>
        <path
          d="M41.88,6.67s4.72,1.27,8.82,4.94c2.46,2.21,4.69,5.28,5.54,9.47"
          fill="none"
          stroke="#fff"
          stroke-linecap="round"
          stroke-miterlimit="10"
          stroke-width="2"
        />
      </svg>
    </div>
  );
}

function Goose(
  props: Goose & {
    index: number;
    onDragStart: () => void;
    onDrop: (e: React.DragEvent) => void;
    onFoodDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onPositionChange: (position: Position) => void;
    foodOnGround: FoodOnGround[];
    onEatFood: (foodId: number) => void;
  }
) {
  const {
    color,
    position: initialPosition,
    index,
    onDragStart,
    onDrop,
    onFoodDrop,
    onDragOver,
    onPositionChange,
    birthTime,
    velocity = 0.02, // Default velocity if not provided
    foodOnGround,
    onEatFood,
  } = props;
  const [position, setPosition] = useState<Position>(initialPosition);
  const [flip, setFlip] = useState(false);
  const [scale, setScale] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate the growth scale based on age
  useEffect(() => {
    if (birthTime) {
      const updateScale = () => {
        const age = Date.now() - birthTime;

        if (age < GOOSE_GROWTH_DURATION) {
          // Grow from min to max scale over the growth duration
          const progress = age / GOOSE_GROWTH_DURATION;
          const currentScale =
            GOOSE_MIN_SCALE + progress * (GOOSE_MAX_SCALE - GOOSE_MIN_SCALE);
          setScale(currentScale);
        } else {
          setScale(GOOSE_MAX_SCALE);
        }
      };

      updateScale();
      const interval = setInterval(updateScale, SCALE_UPDATE_INTERVAL);

      return () => clearInterval(interval);
    } else {
      setScale(GOOSE_MAX_SCALE); // Adult geese are full size
    }
  }, [birthTime]);

  // Update local position when prop position changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  // Combined movement and food scanning effect
  useEffect(() => {
    const interval = setInterval(() => {
      let dx = 0;
      let dy = 0;

      // Scan for food every tick within scan radius
      if (foodOnGround.length > 0) {
        // Find the nearest food within scan radius
        let nearestFoodId: number | undefined = undefined;
        let nearestDistance = Infinity;

        foodOnGround.forEach((food) => {
          const distance = calculateDistance(position, food.position);
          // Only consider food within scan radius
          if (distance <= SCAN_RADIUS && distance < nearestDistance) {
            nearestDistance = distance;
            nearestFoodId = food.id;
          }
        });

        // Check if close enough to eat any food
        const nearestFood = foodOnGround.find(
          (food) => food.id === nearestFoodId
        );
        if (nearestFood && nearestDistance < PICKUP_RADIUS) {
          // Close enough to eat the food
          onEatFood(nearestFoodId!);
          return;
        }

        // Move towards the nearest food if found within scan radius
        if (nearestFood) {
          const deltaX = nearestFood.position.x - position.x;
          const deltaY = nearestFood.position.y - position.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          const normalizedDeltaX = deltaX / distance;
          const normalizedDeltaY = deltaY / distance;
          dx = normalizedDeltaX * velocity * FOOD_SPEED_MULTIPLIER;
          dy = normalizedDeltaY * velocity * FOOD_SPEED_MULTIPLIER;
        } else {
          // Random movement when no food found within scan radius
          dx = (Math.random() - 0.5) * velocity;
          dy = (Math.random() - 0.5) * velocity;
        }
      } else {
        // Random movement when no food on ground
        dx = (Math.random() - 0.5) * velocity;
        dy = (Math.random() - 0.5) * velocity;
      }

      setFlip(dx < 0);
      const newPosition = {
        x: clampPosition(position.x + dx),
        y: clampPosition(position.y + dy),
      };
      setPosition(newPosition);
      onPositionChange(newPosition);
    }, MOVEMENT_INTERVAL);
    return () => clearInterval(interval);
  }, [position, onPositionChange, foodOnGround, onEatFood, velocity]);

  const handleGooseDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("goose", index.toString());
      onDragStart();
    },
    [index, onDragStart]
  );

  const handleCombinedDrop = useCallback(
    (e: React.DragEvent) => {
      const foodData = e.dataTransfer.getData("food");
      const gooseData = e.dataTransfer.getData("goose");

      if (foodData) {
        onFoodDrop(e);
      } else if (gooseData) {
        onDrop(e);
      }
    },
    [onFoodDrop, onDrop]
  );

  return (
    <div
      draggable
      onDragStart={handleGooseDragStart}
      onDrop={handleCombinedDrop}
      onDragOver={onDragOver}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        position: "absolute",
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        transform: "translate(-50%, -50%)",
        cursor: "grab",
      }}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            zIndex: 1000,
            marginBottom: "4px",
          }}
        >
          H: {color[0].toFixed(1)}° | C: {color[1].toFixed(3)} | L:{" "}
          {color[2].toFixed(3)}
        </div>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="none"
        style={{
          color: `oklch(${color[2]} ${color[1]} ${color[0]})`,
          transform: `${flip ? "scaleX(-1)" : "scaleX(1)"} scale(${scale})`,
          transition: "transform 0.1s ease-out",
        }}
        width="100"
        height="100"
      >
        <g id="back_FOOT">
          <path
            d="M52.15,80.42c-.63.06-.84.87-.82,1.5.03,1.14.29,2.27.54,3.38.38,1.65.75,3.3,1.13,4.95.06.28.13.57.33.78.3.33.82.35,1.25.22s.81-.37,1.24-.51c1.82-.58,3.76.93,5.62.53-.77-.21-1.47-.69-1.94-1.34.88.19,1.83.05,2.62-.37-1.05-.4-2.09-.79-3.14-1.19.54-.28,1.02-.67,1.39-1.15-1.32.19-2.65.21-3.98.07-.37-.04-.76-.1-1.07-.3-1.43-.91-.8-6.79-3.17-6.58Z"
            fill="#f7941d"
          ></path>
        </g>
        <g id="BODY">
          <path
            d="M79.34,12.73c-4.16.77-7.52,4.33-8.58,8.44-.79,3.08-.42,6.33-.58,9.51s-1.06,6.61-3.63,8.49c-1.93,1.42-4.45,1.7-6.85,1.85-8.61.54-17.29.05-25.79-1.46-4.66-.83-9.35-1.97-14.07-1.57-.86.07-1.82.26-2.32.96-.62.88-.22,2.12.42,2.99s1.51,1.59,1.9,2.6c.09.23.15.49.07.72-.24.65-1.3.45-1.79.95-.52.53-.06,1.44.53,1.88s1.36.75,1.65,1.43c.44,1.01-.45,2.12-.39,3.22.05.97.8,1.73,1.34,2.53.8,1.17,1.2,2.55,1.6,3.91,1.12,3.8,2.28,7.62,4.17,11.11s4.57,6.65,8.09,8.47c2.24,1.16,4.76,1.75,6.95,3.01,1.25.71,2.37,1.64,3.68,2.24s2.88.86,4.15.19c.84-.44,1.43-1.23,2.13-1.86,1.41-1.28,3.26-1.97,5.09-2.49,6.05-1.73,12.47-2.01,18.42-4.07,5.94-2.06,11.69-6.62,12.43-12.87.39-3.3-.66-6.6-2.08-9.61-1.08-2.31-2.39-4.51-3.33-6.88-1.36-3.43-1.93-7.13-1.98-10.82-.05-3.67.62-7.75,3.52-9.99,1.42-1.1,3.22-1.62,4.56-2.81,2.49-2.21.86-5.41-1.05-7.37-2.09-2.16-5.33-3.22-8.29-2.67Z"
            fill="currentColor"
          ></path>
        </g>
        <g id="BILL_AND_FOOT">
          <path
            d="M91.39,21.24c-.61-.6-1.17-1.26-1.65-1.97-.08-.11-.17-.24-.31-.23-.09,0-.16.06-.23.1-1.09.73-2.66.19-3.79.85-.36.21-.67.6-.63,1.01.6.19,1.1.68,1.3,1.28.11.34.14.72.34,1.02.19.27.49.43.79.57,1.99.96,4.08,1.73,6.22,2.29,1.35.35,2.79-.34,1.87-1.86-.72-1.2-2.87-2.05-3.9-3.06Z"
            fill="#fbb040"
          ></path>
          <path
            d="M49.21,84.47c-.2-.5-.73-.98-1.24-.8-.56.19-.63.94-.59,1.53.2,2.62.78,5.28.19,7.83-.34,1.48-1.07,2.84-1.79,4.19,1.21-.91,2.61-1.88,4.1-1.64.55.09,1.06.33,1.55.57,1.01.49,2.02.97,3.03,1.46-.46-.38-.68-1.03-.55-1.62s.62-1.07,1.2-1.21c.44-.11.9-.02,1.35-.08s.93-.34.97-.79c-1.12-.2-2.24-.39-3.36-.59-.68-.12-1.39-.25-1.97-.62-.76-.49-1.21-1.33-1.52-2.18-.75-2-.6-4.08-1.39-6.04Z"
            fill="#fbb040"
          ></path>
        </g>
        <g id="EYES">
          <circle cx="81.67" cy="19.03" r="1.25" fill="#3c2415"></circle>
          <path
            d="M64.37,62.66c-1.6,2.67-4.92,3.67-7.95,4.42-2.66.66-5.34,1.31-8.08,1.42-4.48.17-8.96-1.16-12.81-3.46s-7.09-5.54-9.68-9.21c1.3.35,2.6.69,3.9,1.04-1.64-1.21-3.04-2.74-4.1-4.47.83-.3,1.76-.28,2.58.03-2.27-1.6-3.71-4.33-3.73-7.11,0-.28.02-.6.24-.78.22-.19.54-.17.82-.14,1.48.16,2.97.32,4.42.7,2.15.57,4.2,1.64,6.42,1.73.42.02.92-.06,1.09-.44.06-.14.07-.32.16-.44.13-.16.37-.17.57-.17,1.78.01,3.56.03,5.33.04,4.85.04,9.81.1,14.36,1.84,3.04,1.2,5.66,3.85,7.24,6.73Z"
            fill="currentColor"
          ></path>
        </g>
      </svg>
    </div>
  );
}
