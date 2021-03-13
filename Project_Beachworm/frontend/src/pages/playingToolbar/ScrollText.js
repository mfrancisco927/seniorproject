import { useState, useEffect, Fragment } from 'react';
import './ScrollText.css';
import { Transition } from 'react-transition-group';

function ScrollText(props) {
  const [scrolling, setScrolling] = useState(false);
  const [textRef, setTextRef] = useState(null);
  const [wrapperRef, setWrapperRef] = useState(null);
  const [bulletRef, setBulletRef] = useState(null);
  const { rampMillis, decayMillis, speed, children } = props;
  const [scrollWidth, setScrollWidth] = useState(0);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [duration, setDuration] = useState(0);

  const defaultStyle = {
    transition: `left ${duration}ms linear`,
    left: 0,
  };

  const transitionStyles = shouldScroll ? {
    entering: { left: -(scrollWidth + (bulletRef ? bulletRef.scrollWidth : 12)) },
    entered: { left: -(scrollWidth + (bulletRef ? bulletRef.scrollWidth : 12)), transition: `left 0ms linear` },
    exiting: { left: 0, transition: `left 0ms linear` },
    exited: { left: 0, transition: `left 0ms linear` },
  } : {};

  useEffect(() => {
    if (textRef) {
      setScrollWidth(textRef.scrollWidth);
      // speed of 0 corresponds to 1 cps, 100 corresponds to 20 cps.
      const charactersPerSec = Math.floor(1 + (19 * speed / 100));
      const pixelsPerSec = charactersPerSec * 12; // assuming font size 12
      const newDuration = 1000 * textRef.scrollWidth / pixelsPerSec;
      setDuration(newDuration);

      console.log(textRef.innerHTML + ' cw ' + textRef.clientWidth + ' sw ' + textRef.scrollWidth)

      if (wrapperRef && wrapperRef.clientWidth < textRef.scrollWidth) {
        setShouldScroll(true);

        setTimeout(() => {
          console.log('starting initial scroll');
          setScrolling(true);
        }, rampMillis);
      }
    }
  }, [textRef, wrapperRef, rampMillis, speed]);

  const handleFinishedScrolling = () => {
    // console.log('onEntering')
    setTimeout(() => {
      setScrolling(true);
    }, decayMillis + rampMillis);
  };

  const handleRestartScrolling = () => {
    // console.log('onExiting')
    setTimeout(() => {
      setScrolling(false);
    }, duration);
  };

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
          // console.log('current state ' + state)
          return (
          <div style={{
            ...defaultStyle,
            ...transitionStyles[state]
          }} className="scroll-wrapper" ref={e => setWrapperRef(e)}>
            <span class="child-wrapper" ref={e => setTextRef(e)}>
              {children}
            </span>
            {shouldScroll && <Fragment>
                <span class="child-wrapper" ref={e => setBulletRef(e)}>{" • "}</span>
                <span class="child-wrapper">{children}</span>
              </Fragment>}
          </div>
        )}

      }
    </Transition>
  );
}

export default ScrollText;