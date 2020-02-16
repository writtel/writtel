import React, {useState} from 'react';

const useProcess = () => {
  const [log, setLog] = useState([]);
  let [counter, setCounter] = useState(0);
  let [counterMax, setCounterMax] = useState(1);

  log.info = (message) => {
    log.push({
      type: 'info',
      message,
    });
    setLog(log.slice());
  };

  log.warn = (message) => {
    log.push({
      type: 'warn',
      message,
    });
    setLog(log.slice());
  }

  log.error = (message) => {
    log.push({
      type: 'error',
      message,
    });
    setLog(log.slice());
  };

  log.incr = (value = 1) => {
    counter += value;
    setCounter(counter);
  };

  log.setCounterMax = (value) => {
    counterMax = value;
    setCounterMax(counterMax);
  };

  log.progress = () => {
    return counter / counterMax;
  };

  log.clear = () => {
    log.splice(0, log.length);
    setLog(log.slice());

    counter = 0;
    setCounter(0);
  };

  log.render = () => {
    return (
      <>
        <div>Progress: {Math.floor((counter / counterMax) * 100).toFixed(0)}%</div>
        {log.slice().reverse().map((entry, i) => (
          <div key={`${i}`}>{entry.message}</div>
        ))}
      </>
    );
  };

  return log;
};

export default useProcess;
