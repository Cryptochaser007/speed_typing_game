import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [sampleText, setSampleText] = useState('');
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState(null);
  const [started, setStarted] = useState(false);
  const inputRef = useRef(null);

  // Fetch sample text on mount
  useEffect(() => {
    fetch('/sample.txt')
      .then(res => res.text())
      .then(text => {
        const paragraphs = text.split(/\n\s*\n/); // split by double newlines
        const random = paragraphs[Math.floor(Math.random() * paragraphs.length)];
        setSampleText(random.trim());
      });
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      calculateStats();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleChange = (e) => {
    if (!isRunning) return;
    setInput(e.target.value);
  };

  const calculateStats = () => {
    const wordsTyped = input.trim().split(/\s+/).length;
    setStats({ wpm: Math.round(wordsTyped) });
  };

  const startTest = () => {
    setInput('');
    setTimeLeft(60);
    setIsRunning(true);
    setStarted(true);
    setStats(null);
    inputRef.current.focus();
  };

  const getHighlightedText = () => {
    return sampleText.split('').map((char, i) => {
      let color = '';
      if (i < input.length) {
        color = input[i] === char ? 'green' : 'red';
      }
      return <span key={i} style={{ color }}>{char}</span>;
    });
  };

  return (
    <div className={styles.container}>
      <h1>⌨️ Typing Speed Test</h1>

      <div className={styles.timerBox}>
        ⏱ Time Left: {timeLeft}s
      </div>

      <div className={styles.sample}>
        {getHighlightedText()}
      </div>

      <textarea
        ref={inputRef}
        className={styles.textarea}
        value={input}
        onChange={handleChange}
        disabled={!isRunning}
        placeholder="Start typing here..."
      />

      {!started && (
        <button onClick={startTest} className={styles.startBtn}>▶️ Start</button>
      )}

      {stats && (
        <div className={styles.results}>
          <h2>✅ Results</h2>
          <p>📝 Words Per Minute: <strong>{stats.wpm}</strong></p>
        </div>
      )}
    </div>
  );
}