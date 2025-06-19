import Image from 'next/image'
import React from 'react'

function Footer() {
  return (
    <footer className=" bg-gradient-to-r from-purple-800 via-sky-400 to-purple-950 backdrop-blur-sm dark:bg-slate-950/80 border-t sticky bottom-0 z-30">
      <div className="container mx-auto p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <span>
            <Image src="/cameraSvg.svg" alt="Icon" width={40} height={40} style={{ filter: 'invert(100%)' }} />
          </span>
          <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mx-2" />
          <span className="text-lg font-bold gradient-text text-white ml-1">
            PhotoAI Studio
          </span>
        </div>
        <p className="text-sm text-white/80 text-center md:text-right">
          © 2025 PhotoAI Studio. Transform your product photography with AI.
        </p>
      </div>
    </footer>
  )
}

export default Footer
