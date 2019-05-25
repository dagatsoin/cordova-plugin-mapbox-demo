import { Animated, Paper, Styles } from '@sproutch/ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
  isOpen: boolean
  children: React.ReactNode
  onAnimationEnd: (isOpen: boolean, view: Animated.View) => void
}

export default function({isOpen, children, onAnimationEnd}: Props) {
  const animatedY = useRef(Animated.createValue(0))
  const rootRef = useRef<Animated.View>()
  const setRef = useCallback(view => rootRef.current = view, [])
  const [height, setHeight] = useState(0)
  
  useEffect(() => {
    Animated.timing(
      animatedY.current,
      { toValue: isOpen ? -height : 0, duration: 250, easing: Animated.Easing.InOut() }
    ).start((result)=>{
      if(result.finished) {
        onAnimationEnd(isOpen, rootRef.current)
      }});
  }, [isOpen])

  return (
    <Animated.View
      onLayout={e => setHeight(e.height)}
      ref={view => setRef(view)}
      style={[{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -height
      }, Styles.createAnimatedViewStyle({
        transform: [{
          translateY: animatedY.current
        }]
      })]}
    >
      <Paper elevation={2}>
        {children}
      </Paper>
    </Animated.View>
  )
}