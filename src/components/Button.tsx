import React from 'react'
 

interface ButtonProps {
  text: string
  styles?: React.CSSProperties
 }

function Button({ text, styles }: ButtonProps) {

  return (
    <button style={styles}>
      {text}
    </button>
  )
}

export default Button
