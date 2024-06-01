'use  client'

import { useEffect, useState } from "react";

export default function Title() {
    const [titleAnimation, setTitleAnimation] = useState(false)
    const [title, setTitle] = useState("")
    const [titleIndex, setTitleIndex] = useState(0)
    useEffect(() => {
      const timer = setTimeout(() => {
        setTitleAnimation(true)
      }, 100)
      const titleAnimationInterval = setInterval(() => {
        setTitle((prevTitle) => {
          const targetText = "Scan an image or video for signs of artificial manipulation"
          if (titleIndex < targetText.length) {
            setTitleIndex(titleIndex + 1)
            return targetText.slice(0, titleIndex + 1)
          } else {
            clearInterval(titleAnimationInterval)
            return targetText
          }
        })
      }, 50)
      return () => {
        clearTimeout(timer)
        clearInterval(titleAnimationInterval)
      }
    }, [titleIndex])

    return (
        <h1 className="text-2xl font-bold">
            {titleAnimation ? (
                title
            ) : (
                <span className="animate-pulse">
                    {title}
                    <span className="animate-blink">|</span>
                </span>
            )}
        </h1>
    )

}