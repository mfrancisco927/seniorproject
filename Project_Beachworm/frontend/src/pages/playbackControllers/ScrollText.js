import { useState, useEffect, Fragment } from 'react';
import './ScrollText.css';
import { Transition } from 'react-transition-group';

function ScrollText(props) {
  const { rampMillis, decayMillis, speed, children } = props;
  const [scrolling, setScrolling] = useState(false); // whether the wrapper is CURRENTLY scrolling
  const [childRef, setChildRef] = useState(null); // ref for the element that scrolling is based upon
  const [wrapperRef, setWrapperRef] = useState(null); // ref for the wrapping parent element
  const [bulletRef, setBulletRef] = useState(null); // ref for the delimiter between copies of the text
  const [childWidth, setChildWidth] = useState(0); // width of target children
  const [wrapperWidth, setWrapperWidth] = useState(0); // width of parent. scrolling occurs if this is < child
  const [shouldScroll, setShouldScroll] = useState(false); // whether or not to scroll at all, based on child and wrapper widths
  const [duration, setDuration] = useState(0); // calculated duration of a single scroll event
  const [scheduled, setScheduled] = useState(); // most recently scheduled event id used for scrolling status

  // every time something important changes, (re)start scrolling, if necessary
  useEffect(() => {
    if (wrapperWidth < childWidth) {
      // speed of 0 corresponds to 1 cps, 100 corresponds to 20 cps.  
      const charactersPerSec = Math.floor(1 + (19 * speed / 100));
      const pixelsPerSec = charactersPerSec * 12; // assuming font size 12
      const newDuration = 1000 * childWidth / pixelsPerSec;
      setDuration(newDuration);
      setShouldScroll(true);
      setScheduled(setTimeout(() => setScrolling(true), rampMillis));
    } else {
      setDuration(0);
      setShouldScroll(false);
      setScheduled(prev => {
        clearTimeout(prev);
        return setTimeout(() => setScrolling(true), rampMillis);
      });
    }
  }, [childWidth, wrapperWidth, rampMillis, speed, childRef, wrapperRef]);

  // on mount and unmount, clear the timeout
  useEffect(() => {
    if (scheduled) {
      clearTimeout(scheduled);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // lint disabled because we WANT this to run every render.
  // since the ref doesn't actually change when the song changes,
  // we need to manually set the widths which will call a re-render if different
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (childRef) {
      setChildWidth(childRef.scrollWidth);
    }
    if (wrapperRef) {
      setWrapperWidth(wrapperRef.clientWidth);
    }
  });

  const handleFinishedScrolling = () => {
    setScheduled(setTimeout(() => {
      setScrolling(true);
    }, decayMillis + rampMillis));
  };

  const handleRestartScrolling = () => {
    setScheduled(setTimeout(() => {
      setScrolling(false);
    }, duration));
  };

  const defaultStyle = {
    transition: `left ${duration}ms linear`,
    left: 0,
  };

  const transitionStyles = shouldScroll ? {
    entering: { left: -(childWidth + (bulletRef ? bulletRef.scrollWidth : 12)) },
    entered: { left: -(childWidth + (bulletRef ? bulletRef.scrollWidth : 12)), transition: `left 0ms linear` },
    exiting: { left: 0, transition: `left 0ms linear` },
    exited: { left: 0, transition: `left 0ms linear` },
  } : {};

  return (
    <Transition in={scrolling} timeout={{
      appear: 0,
      enter: duration,
      exit: 0,
    }}
    onEntering={handleRestartScrolling}
    onExiting={handleFinishedScrolling}>
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