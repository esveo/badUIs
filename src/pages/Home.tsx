import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">
        BadUIs Collection
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Welcome to the collection of intentionally bad user interfaces. Explore
        our weird and wonderful components!
      </p>
      <nav className="space-y-4">
        {/* 
        
              <Route path="/goose-color-picker" element={<GooseColorPickerPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/bad-number-selector" element={<BadNumberSelectorPage />} />
      <Route path="/broken-input" element={<BrokenInputPage />} />
      <Route
        path="/cool-app-content-wrapper"
        element={<CoolAppContentWrapperPage />}
      />
      <Route path="/final-decision" element={<FinalDecisionPage />} />
        */}
        <Link
          to="/goose-color-picker"
          className="block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
        >
          🦆 Goose Color Picker
        </Link>
        <Link
          to="/sign-up"
          className="block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
        >
          📝 Sign Up Form
        </Link>
        <Link
          to="/bad-number-selector"
          className="block px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-center"
        >
          1️⃣ Bad Number Selector
        </Link>
        <Link
          to="/broken-input"
          className="block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-center"
        >
          🔧 Broken Input
        </Link>
        <Link
          to="/cool-app-content-wrapper"
          className="block px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center"
        >
          🛠️ Cool App Content Wrapper
        </Link>
        <Link
          to="/final-decision"
          className="block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-center"
        >
          🏁 Final Decision Component
        </Link>
      </nav>
    </div>
  );
}
