import { Route, Routes } from "react-router-dom";
import {
  BadNumberSelectorPage,
  BrokenInputPage,
  CoolAppContentWrapperPage,
  FinalDecisionPage,
  GooseColorPickerPage,
  Home,
  NotFound,
} from "./pages";
import { SignUpPage } from "./pages/SignUpPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/goose-color-picker" element={<GooseColorPickerPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/bad-number-selector" element={<BadNumberSelectorPage />} />
      <Route path="/broken-input" element={<BrokenInputPage />} />
      <Route
        path="/cool-app-content-wrapper"
        element={<CoolAppContentWrapperPage />}
      />
      <Route path="/final-decision" element={<FinalDecisionPage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
