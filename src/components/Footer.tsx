import React from 'react'

function Footer() {
  return (
  <footer className="border-t bg-white/50 dark:bg-slate-950/50 ">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                {/* <Camera className="w-4 h-4 text-white" /> */}
              </div>
              <span className="font-semibold">PhotoAI Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PhotoAI Studio. Transform your product photography with
              AI.
            </p>
          </div>
        </div>
      </footer>
  )
}

export default Footer
