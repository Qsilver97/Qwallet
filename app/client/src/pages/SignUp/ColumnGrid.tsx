import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ColumnGrid = () => {
  const [blurBackground, setBlurBackground] = useState(true);

  const { seeds } = useAuth();

  return (
    <div className="grid grid-cols-4 gap-6 relative">
      {
        typeof seeds == 'object' &&
        seeds.map((seed, idx) => (
          <div key={idx} className="w-24 bg-gray-200 rounded-md text-center underline underline-offset-4">
            {idx}&nbsp;&nbsp;&nbsp;&nbsp;{seed}
          </div>
        ))}
      {blurBackground &&
        <>
          <div className="bg-gray bg-opacity-40 backdrop-filter backdrop-blur-sm absolute top-0 left-0 w-full h-full rounded"></div>
          <img src="/assets/images/signup/eye.png" alt="Content Eye Locker" className="w-11 h-11 cursor-pointer absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" onClick={() => setBlurBackground(false)} />
        </>
      }
    </div>
  );
};

export default ColumnGrid