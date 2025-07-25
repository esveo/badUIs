import { useEffect, useState } from "react";

export function SignUp() {
  const [state, setState] = useState<"register" | "login" | "resetPassword">(
    "register"
  );
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [dropLetterList, setDropLetterList] = useState<string[]>([]);
  const [photoNumber, setPhotoNumber] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const input = document.getElementById("userName");
  }, []);

  return (
    <div className="flex flex-col">
      {photoNumber === 1 && (
        <div
          style={{
            backgroundImage: `url("/1.png")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className="w-64 h-64 "
        />
      )}
      {photoNumber === 2 && (
        <div
          style={{
            backgroundImage: `url("/2.png")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className="w-64 h-64 "
        />
      )}
      {photoNumber === 3 && (
        <div
          style={{
            backgroundImage: `url("/3.png")`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className="w-64 h-64 "
        />
      )}

      <div className="flex flex-row">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (formData.password.length < 100) {
              setMessage("Password is not long enough");
              return;
            }
            localStorage.setItem("username", formData.username.slice(0, 12));
            localStorage.setItem("password", formData.password);
          }}
        >
          <label className="flex gap-2 items-center">
            User Name
            <input
              id="userName"
              type="text"
              placeholder="Username"
              value={formData.username.slice(0, 12)}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length > 12) {
                  setDropLetterList([...dropLetterList, value.slice(-1)]);
                }
                setFormData({ ...formData, username: e.target.value });
              }}
              className="border w-30 border-gray-300 rounded-l p-2 border-r-0 focus:outline-none focus:border-blue-500 focus:border-2 focus:border-r-0"
            ></input>
          </label>
          <p>Don't use a too long username</p>

          <label className="flex gap-5 items-center">
            Password
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onFocus={() => setPhotoNumber(2)}
              onBlur={() => setPhotoNumber(1)}
              onChange={(e) => {
                setPhotoNumber(3);
                setFormData({ ...formData, password: e.target.value });
              }}
              className="border w-30 border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:border-2 p-2"
            ></input>
          </label>

          {message && <p className="text-red-500">{message}</p>}

          <button>Create Account</button>
        </form>
        <div>
          <div className="relative z-10 w-20 h-52">
            {dropLetterList.map((s, index) => (
              <div key={index} className="drop-element w-fit absolute top-0 ">
                {s}
              </div>
            ))}
          </div>
          <div
            style={{
              backgroundImage: `url("/can.jpeg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="w-32 h-64 relative -top-20"
          />
        </div>
      </div>
    </div>
  );
}

function Register() {
  return (
    <div>
      <></>
    </div>
  );
}
