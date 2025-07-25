import { Link } from "react-router-dom";
import {
  BadUIButton,
  BrokenInput,
  CoolAppContentWrapper,
  ScrollNumberSelect,
} from "../badui";

export function CoolAppContentWrapperPage() {
  return (
    <CoolAppContentWrapper wrapperClassName="w-screen h-screen relative flex flex-col items-center justify-center">
      <Link
        to="/"
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        ← Back to Home
      </Link>
      <div className="flex flex-col gap-4">
        <BadUIButton />
        <ScrollNumberSelect />
        <BrokenInput placeholder="Type here..." anchor="left" />
      </div>
    </CoolAppContentWrapper>
  );
}
