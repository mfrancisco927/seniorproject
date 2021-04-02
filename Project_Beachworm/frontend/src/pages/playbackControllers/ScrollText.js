import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import './ScrollText.css';
import { Transition } from 'react-transition-group';

function ScrollText(props) {
  const { rampMillis, decayMillis, speed, children, refreshMillis } = props;
  const REFRESH_MIN_MS = refreshMillis || 250;
  const [scrolling, setScrolling] = useState(false); // whether the wrapper is CURRENTLY scrolling
  const [childRef, setChildRef] = useState(null); // ref for the element that scrolling is based upon
  const [wrapperRef, setWrapperRef] = useState(null); // ref for the wrapping parent element
  const [bulletRef, setBulletRef] = useState(null); // ref for the delimiter between copies of the text
  const [shouldScroll, setShouldScroll] = useState(false); // whether or not to scroll at all, based on child and wrapper widths
  const [duration, setDuration] = useState(0); // calculated duration of a single scroll event

  const childWidth = useRef(childRef ? childRef.scrollWidth : 0);
  const wrapperWidth = useRef(wrapperRef ? wrapperRef.clientWidth : 0);

  const refreshScrollSettings = useCallback(() => {
    const oldChildWidth = childWidth.current;
    const oldWrapperWidth = wrapperWidth.current;
    const newChildWidth = childRef ? childRef.scrollWidth : 0;
    const newWrapperWidth = wrapperRef ? wrapperRef.clientWidth : 0;
    if (oldChildWidth !== newChildWidth || oldWrapperWidth !== newWrapperWidth) {
      childWidth.current = newChildWidth;
      wrapperWidth.current = newWrapperWidth;
      if (childWidth.current > wrapperWidth.current) {
        // speed of 0 corresponds to 1 cps, 100 corresponds to 20 cps.  
        const charactersPerSec = Math.floor(1 + (19 * speed / 100));
        const pixelsPerSec = charactersPerSec * 12; // assuming font size 12
        const newDuration = 1000 * childWidth.current / pixelsPerSec;
        setDuration(newDuration);
        setShouldScroll(true);
        setTimeout(() => setScrolling(true), rampMillis);
      } else {
        setDuration(0);
        setShouldScroll(false);
        setScrolling(false);
      }
    }
  }, [childRef, wrapperRef, speed, rampMillis]);

  useEffect(() => {
    const interval = setInterval(refreshScrollSettings, REFRESH_MIN_MS);
    return () => clearInterval(interval);
  }, [REFRESH_MIN_MS, refreshScrollSettings]);

  // TODO: consider rewriting above with https://www.npmjs.com/package/react-resize-detector
  // or similar to stop rerunning every render

  const defaultStyle = {
    left: 0,
  };

  const transitionStyles = shouldScroll ? {
    entering: { left: -(childWidth.current + (bulletRef ? bulletRef.scrollWidth : 12)), transition: `left ${duration}ms linear` },
    entered: { left: -(childWidth.current + (bulletRef ? bulletRef.scrollWidth : 12)), transition: `left 0ms linear` },
    exiting: { left: 0, transition: `left 0ms linear` },
    exited: { left: 0, transition: `left 0ms linear` },
  } : {};

  return (
    <Transition in={scrolling} timeout={{
      appear: 0,
      enter: duration,
      exit: decayMillis,
    }}
    onExited={() => setScrolling(true)}
    onEntered={() => setScrolling(false)}>
      {
        state => {
          return (
          <div style={{
            ...defaultStyle,
            ...transitionStyles[state]
          }} className="scroll-wrapper" ref={e => setWrapperRef(e)}>
            <span className="child-wrapper" ref={e => setChildRef(e)}>
              {children}
            </span>
            {shouldScroll && <Fragment>
                <span className="child-wrapper" ref={e => setBulletRef(e)}>{" • "}</span>
                <span className="child-wrapper">{children}</span>
              </Fragment>}
          </div>
        )}

      }
    </Transition>
  );
}

export default ScrollText;