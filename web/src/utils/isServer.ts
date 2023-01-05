// export const isServer = () => typeof window === "undefined";

import { useEffect, useState } from "react"

const isServer = () => {
    const [windowType, setType] = useState("undefined") 
    useEffect(() => setType(typeof window), [])
    return typeof windowType === "undefined"
  }
  
  export default isServer
