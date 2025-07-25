import { Link } from "react-router-dom";
import { FinalDecision } from "../badui";

export function FinalDecisionPage() {
  return (
    <div className="w-screen h-screen relative flex flex-col items-center justify-center">
      <Link
        to="/"
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        ← Back to Home
      </Link>
      <FinalDecision prompt="Do you want to create your account?" />
    </div>
  );
}
