import { useState } from "react";

const ColumnGrid = () => {
    const [blurBackground, setBlurBackground] = useState(true)
  
  const gridItems = [
    { number: 1, text: 'Column' },
    { number: 2, text: 'Column' },
    { number: 3, text: 'Column' },
    { number: 4, text: 'Column' },
    { number: 5, text: 'Column' },
    { number: 6, text: 'Column' },
    { number: 7, text: 'Column' },
    { number: 8, text: 'Column' },
    { number: 9, text: 'Column' },
    { number: 10, text: 'Column' },
    { number: 11, text: 'Column' },
    { number: 12, text: 'Column' },
    { number: 13, text: 'Column' },
    { number: 14, text: 'Column' },
    { number: 15, text: 'Column' },
    { number: 16, text: 'Column' },
    { number: 17, text: 'Column' },
    { number: 18, text: 'Column' },
    { number: 19, text: 'Column' },
    { number: 20, text: 'Column' },
    { number: 21, text: 'Column' },
    { number: 22, text: 'Column' },
    { number: 23, text: 'Column' },
    { number: 24, text: 'Column' },
    
  ];

  return (
    <div className="grid grid-cols-4 gap-6 relative">
        {gridItems.map(({ number, text }) => (
            <div key={number} className="w-24 bg-gray-200 rounded-md text-center underline underline-offset-4">
            {number}&nbsp;&nbsp;&nbsp;&nbsp;{text}
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