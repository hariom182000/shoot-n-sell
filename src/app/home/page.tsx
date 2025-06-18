import Button from '@/components/Button'
import Link from 'next/link'
import React from 'react'

function Home() {
  return (
    <div>
        <h1>hiiiii</h1>

        <Link href={"/generate"}>
        <Button text="Go to Generate"  styles={{}} />
        </Link>
      
    </div>
  )
}

export default Home
