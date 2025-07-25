import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold mb-4 text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold mb-4 text-gray-600">
        Page Not Found
      </h2>
      <p className="text-lg text-gray-500 mb-8 text-center max-w-md">
        Oops! The page you're looking for doesn't exist. Maybe it's hiding
        behind one of our bad UIs?
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  );
}
