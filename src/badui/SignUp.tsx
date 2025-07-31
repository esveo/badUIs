import { useEffect, useState } from "react";
import Asset1 from "../assets/1.png";
import Asset2 from "../assets/2.png";
import Asset3 from "../assets/3.png";
import CanImage from "../assets/can.jpeg";
const passwordTooShortMessages = [
  "That password's so short, even a goldfish could remember it.",
  "Is that your password or a whisper? Try something longer!",
  "Length matters. At least in passwords.",
  "Your password just got friend-zoned by our security system.",
  "Nice try, but your password needs more meat on its bones.",
];

export function SignUp() {
  const [monkeyPhotoNumber, setMonkeyPhotoNumber] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [dropLetterList, setDropLetterList] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonClickedCount, setButtonClickedCount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const input = document.getElementById("passwordInput");
    const sizer = document.getElementById("textSizer");
    if (!input || !sizer) return;

    sizer.textContent = formData.password;
    const style = getComputedStyle(input);
    sizer.style.fontSize = style.fontSize;
    sizer.style.fontFamily = style.fontFamily;
    sizer.style.fontWeight = style.fontWeight;
    sizer.style.letterSpacing = style.letterSpacing;

    input.style.width = sizer.clientWidth + 30 + "px";
  }, [formData.password]);

  useEffect(() => {
    const input = document.getElementById("userName");
    const sizer = document.getElementById("nameSizer");
    if (!input || !sizer) return;

    sizer.textContent = formData.username;
    const style = getComputedStyle(input);
    sizer.style.fontSize = style.fontSize;
    sizer.style.fontFamily = style.fontFamily;
    sizer.style.fontWeight = style.fontWeight;
    sizer.style.letterSpacing = style.letterSpacing;

    if (sizer.clientWidth > 103) {
      setFormData((prev) => ({
        ...prev,
        username: formData.username.slice(0, -1),
      }));
      setDropLetterList((prev) => [...prev, formData.username.slice(-1)]);
    }
  }, [formData.username]);

  if (message === "You have clicked too many times, please try again later.")
    return <p className="text-red-500">{message}</p>;

  return (
    <div className="flex flex-col w-full justify-start pl-10 self-start">
      {monkeyPhotoNumber === 1 && (
        <div
          style={{
            backgroundImage: `url(${Asset1})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className="w-64 h-64 "
        />
      )}
      {monkeyPhotoNumber === 2 && (
        <div
          style={{
            backgroundImage: `url(${Asset2})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className="w-64 h-64 "
        />
      )}
      {monkeyPhotoNumber === 3 && (
        <div
          style={{
            backgroundImage: `url(${Asset3})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className="w-64 h-64 "
        />
      )}

      <div className="flex flex-row relative">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            setButtonClickedCount((prev) => prev + 1);
            if (buttonClickedCount > 4) {
              setMessage(
                "You have clicked too many times, please try again later."
              );

              return;
            }
            if (formData.password.length < 100) {
              setMessage(passwordTooShortMessages[buttonClickedCount]);
              return;
            }
          }}
        >
          <label className="flex gap-2 items-center">
            User Name
            <input
              id="userName"
              type="text"
              placeholder="Username"
              value={formData.username}
              onBlur={() => setDropLetterList([])}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  username: value,
                });
              }}
              className="border w-30 border-gray-300 rounded-l p-2 border-r-0 focus:outline-none focus:border-blue-500 focus:border-2 focus:border-r-0"
            />
          </label>
          <p>Try a longer username.</p>

          <div className="flex flex-row gap-6">
            <label className="flex gap-5 items-center">
              Password
              <input
                id="passwordInput"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onFocus={() =>
                  showPassword
                    ? setMonkeyPhotoNumber(2)
                    : setMonkeyPhotoNumber(1)
                }
                onBlur={() =>
                  showPassword
                    ? setMonkeyPhotoNumber(2)
                    : setMonkeyPhotoNumber(1)
                }
                onChange={(e) => {
                  setMonkeyPhotoNumber(3);
                  setFormData({ ...formData, password: e.target.value });
                }}
                className="border w-fit min-w-30 border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:border-2 p-2"
              ></input>
            </label>

            <button
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
                return showPassword
                  ? setMonkeyPhotoNumber(2)
                  : setMonkeyPhotoNumber(3);
              }}
              className="bg-green-300 w-fit py-1 px-2 rounded"
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>

          <button className="bg-blue-300 w-fit py-2 px-4 rounded">
            Create Account
          </button>
        </form>

        <div className="relative -left-36">
          <div className="relative z-10 w-20 h-52 ">
            {dropLetterList.map((s, index) => (
              <div key={index} className="drop-element w-fit absolute top-0 ">
                {s}
              </div>
            ))}
          </div>

          {!!dropLetterList.length && (
            <div
              style={{
                backgroundImage: `url(${CanImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="w-32 h-64 relative -top-10"
            />
          )}
        </div>
      </div>
      {message && <p className="text-red-500 mt-4">{message}</p>}
      <span id="nameSizer" className="w-fit invisible"></span>
      <span id="textSizer" className="w-fit invisible"></span>
    </div>
  );
}
