"use client";
import React, { useState, useEffect, useRef } from "react";
import { useOnborda } from "./OnbordaContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Types
import { Step, OnbordaProps } from "./types";

const Onborda: React.FC<OnbordaProps> = ({
  children,
  steps,
  showOnborda = false, // Default to false
  shadowRgb = "0, 0, 0",
  shadowOpacity = "0.2",
}) => {
  const { currentStep, setCurrentStep, isOnbordaVisible } = useOnborda();
  const [pointerPosition, setPointerPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const currentElementRef = useRef<Element | null>(null);

  // - -
  // Route Changes
  const router = useRouter();

  // - -
  // Helper function to get element position
  const getElementPosition = (element: Element) => {
    const { top, left, width, height } = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    return {
      x: left + scrollLeft,
      y: top + scrollTop,
      width,
      height,
    };
  };

  // - -
  // Initialize and update step positioning
  useEffect(() => {
    if (steps.length > 0) {
      const firstStepElement = document.querySelector(steps[0].selector);
      if (firstStepElement) {
        const position = getElementPosition(firstStepElement);
        setPointerPosition(position);
      }
    }
  }, [steps]); // Dependency on steps ensures this runs once after initial render

  // - -
  // Update pointerPosition when currentStep changes
  useEffect(() => {
    const step = steps[currentStep];
    if (step) {
      const element = document.querySelector(step.selector);
      if (element) {
        setPointerPosition(getElementPosition(element));
      }
    }
  }, [currentStep, steps]); // Reacting to currentStep changes

  // - -
  // Update pointerPosition for currentStep changes or window resize
  const updatePointerPosition = () => {
    const step = steps[currentStep];
    if (step) {
      const element = document.querySelector(step.selector);
      if (element) {
        setPointerPosition(getElementPosition(element));
        currentElementRef.current = element;
      }
    }
  };

  // - -
  // Update pointer position on window resize
  useEffect(() => {
    updatePointerPosition();
    // Add window resize listener
    window.addEventListener("resize", updatePointerPosition);

    return () => {
      // Cleanup resize listener
      window.removeEventListener("resize", updatePointerPosition);
    };
  }, [currentStep, steps]);

  // - -
  // Step Controls
  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      try {
        const route = steps[currentStep].nextRoute;
        if (route) {
          await router.push(route);
          setCurrentStep(currentStep + 1);
        } else {
          setCurrentStep(currentStep + 1);
        }
      } catch (error) {
        console.error("Error navigating to next route", error);
      }
    }
  };

  const prevStep = async () => {
    if (currentStep > 0) {
      try {
        const route = steps[currentStep - 1]?.prevRoute;
        if (route) {
          await router.push(route);
          setCurrentStep(currentStep - 1);
        } else {
          setCurrentStep(currentStep - 1);
        }
      } catch (error) {
        console.error("Error navigating to previous route", error);
      }
    }
  };

  // - -
  // Card Side
  const getCardStyle = (side: string) => {
    switch (side) {
      case "top":
        return {
          transform: `translate(-50%, 0)`,
          left: "50%",
          bottom: "100%",
          marginBottom: "25px",
        };
      case "bottom":
        return {
          transform: `translate(-50%, 0)`,
          left: "50%",
          top: "100%",
          marginTop: "25px",
        };
      case "left":
        return {
          transform: `translate(0, -50%)`,
          right: "100%",
          top: "50%",
          marginRight: "25px",
        };
      case "right":
        return {
          transform: `translate(0, -50%)`,
          left: "100%",
          top: "50%",
          marginLeft: "25px",
        };
      default:
        return {}; // Default case if no side is specified
    }
  };

  // - -
  // Arrow position based on card side
  const getArrowStyle = (side: string) => {
    switch (side) {
      case "bottom":
        return {
          transform: `translate(-50%, 0) rotate(45deg)`,
          left: "50%",
          top: "-10px",
        };
      case "top":
        return {
          transform: `translate(-50%, 0) rotate(45deg)`,
          left: "50%",
          bottom: "-10px",
        };
      case "right":
        return {
          transform: `translate(0, -50%) rotate(45deg)`,
          top: "50%",
          left: "-10px",
        };
      case "left":
        return {
          transform: `translate(0, -50%) rotate(45deg)`,
          top: "50%",
          right: "-10px",
        };
      default:
        return {}; // Default case if no side is specified
    }
  };

  // - -
  // Overlay Variants
  const variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  // - -
  // Pointer Options
  const pointerPadding = steps[currentStep]?.pointerPadding ?? 30;
  const pointerPadOffset = pointerPadding / 2;
  const pointerRadius = steps[currentStep]?.pointerRadius ?? 28;

  return (
    <div data-name="onborda-wrapper" className="relative w-full">
      {/* Container for the Website content */}
      <div data-name="onborda-site" className="relative block w-full">
        {children}
      </div>

      {/* Onborda Overlay Step Content */}
      {pointerPosition && showOnborda && (
        <motion.div
          data-name="onborda-overlay"
          className="fixed inset-0 z-[995] pointer-events-none"
          initial="hidden"
          animate={isOnbordaVisible ? "visible" : "hidden"} // TODO: if hidden, reduce zIndex
          variants={variants}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            data-name="onborda-pointer"
            className="relative z-[999]"
            style={{
              boxShadow: `0 0 200vw 200vh rgba(${shadowRgb}, ${shadowOpacity})`,
              borderRadius: `${pointerRadius}px ${pointerRadius}px ${pointerRadius}px ${pointerRadius}px`,
            }}
            initial={
              pointerPosition
                ? {
                    x: pointerPosition.x - pointerPadOffset,
                    y: pointerPosition.y - pointerPadOffset,
                    width: pointerPosition.width + pointerPadding,
                    height: pointerPosition.height + pointerPadding,
                  }
                : {}
            }
            animate={
              pointerPosition
                ? {
                    x: pointerPosition.x - pointerPadOffset,
                    y: pointerPosition.y - pointerPadOffset,
                    width: pointerPosition.width + pointerPadding,
                    height: pointerPosition.height + pointerPadding,
                  }
                : {}
            }
            transition={{ ease: "anticipate", duration: 0.6 }}
          >
            {/* Card */}
            <div
              className="absolute flex flex-col w-[400px] p-8 text-black transition-all bg-white shadow-lg rounded-lg min-w-min pointer-events-auto"
              data-name="onborda-card"
              style={getCardStyle(steps[currentStep]?.side as any)}
            >
              {/* Card Arrow */}
              <div
                data-name="onborda-arrow"
                className="absolute w-5 h-5 origin-center bg-white"
                style={getArrowStyle(steps[currentStep]?.side as any)}
              />
              {/* Card Header */}
              <div className="flex items-center justify-between gap-5 mb-3">
                <h2 className="text-xl font-bold">
                  {steps[currentStep]?.icon} {steps[currentStep]?.title}
                </h2>
                <div className="text-slate-300 text-base font-semibold">
                  {currentStep + 1} of {steps.length}
                </div>
              </div>
              {/* Card Stepper */}
              <div
                data-name="onborda-stepper"
                className="flex w-full gap-1 mb-8"
              >
                {steps.map((_, index) => (
                  <span
                    key={index}
                    data-name="onborda-step"
                    className={`self-stretch w-full h-1 rounded-xl ${
                      index === currentStep ? "bg-indigo-600" : "bg-indigo-100"
                    }`}
                  />
                ))}
              </div>

              {/* Card Content */}
              <div className="text-[15px]">{steps[currentStep]?.content}</div>

              {/* Stepper Controls */}
              {steps[currentStep]?.showControls && (
                <div className="flex items-center w-full gap-4 mt-4">
                  <button
                    data-control="prev"
                    onClick={prevStep}
                    className="rounded-sm px-5 py-3 outline-none inline-flex items-center text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Prev
                  </button>
                  <button
                    data-control="next"
                    onClick={nextStep}
                    className="rounded-sm px-5 py-3 outline-none inline-flex items-center text-white bg-indigo-600 hover:bg-red-700 ml-auto"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Onborda;
