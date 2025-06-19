import Image from "next/image";
import React from "react";

function NavBar() {
  return (
    <header className="rounded-3xl mx-10  my-4 bg-gradient-to-r from-purple-800 via-sky-400 to-purple-950 backdrop-blur-sm dark:bg-slate-950/80 sticky top-0 z-40">
      <div className="container mx-auto h-16 flex items-center justify-between">
        <div className="flex items-center ">
          <span>
            <Image
              src="/cameraSvg.svg"
              alt="Icon"
              width={50}
              height={50}
              style={{ filter: "invert(100%)" }}
            />
          </span>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            {/* <Camera className="w-5 h-5 text-white" /> */}
          </div>

          <span className="text-xl font-bold gradient-text text-white">
            PhotoAI Studio
          </span>
        </div>

        <div className="bg-white flex gap-1 rounded-2xl p-1 px-2.5">
          <span className="items-center flex">
            <Image src="/star.svg" alt="Icon" width={20} height={20} />
          </span>
          <text className="font-light text-sm">4.9/5 by 2,000+ users</text>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
