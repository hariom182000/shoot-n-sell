import React from "react";

function NavBar() {
  return (
    <header className="rounded-3xl mx-10  my-4 bg-gradient-to-r from-purple-800 via-sky-400 to-purple-950 backdrop-blur-sm dark:bg-slate-950/80 sticky top-0 z-40">
      <div className="container mx-auto h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            {/* <Camera className="w-5 h-5 text-white" /> */}
          </div>
          <span className="text-xl font-bold gradient-text text-white">
            PhotoAI Studio
          </span>
        </div>

        <div className="bg-white rounded-2xl p-1 px-2.5">
          {/* <Star className="w-3 h-3 mr-1 fill-current" /> */}
          4.9/5 from 2,000+ users
        </div>
      </div>
    </header>
  );
}

export default NavBar;
