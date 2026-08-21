import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button, Checkbox, TextField } from '@m3/ui';
import '@m3/ui/styles.css';
import './playground.css';

function App() {
  return (
    <main className="playground">
      <h1>m3-ui</h1>
      <section className="playground__stack">
        <Button>Continue</Button>
        <Checkbox>Remember me</Checkbox>
        <TextField label="Email" description="We will not share your email." placeholder="you@example.com" />
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
