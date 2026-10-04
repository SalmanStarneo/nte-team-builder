import { useState } from 'react';
import { PRESETS } from '../data/presets.js';
import { encodeTeam, decodeTeam } from '../lib/share.js';

export default function SharePanel({ team, dispatch }) {
  const code = encodeTeam(team);
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: select the text so it can be copied by hand.
      document.getElementById('team-code')?.select();
    }
  }

  function importCode(e) {
    e.preventDefault();
    const team = decodeTeam(input);
    if (!team) {
      setError('That code isn’t valid. Codes start with nte1~');
      return;
    }
    setError('');
    setInput('');
    dispatch({ type: 'import', ...team });
  }

  return (
    <section className="share" aria-labelledby="share-title">
      <h2 id="share-title" className="section-title">Presets &amp; sharing</h2>

      <label className="field">
        <span>Load a community preset into this team</span>
        <select
          id="preset"
          value=""
          onChange={(e) => {
            const p = PRESETS[Number(e.target.value)];
            if (p) dispatch({ type: 'loadPreset', name: p.name, members: p.members });
          }}
        >
          <option value="" disabled>Choose a preset…</option>
          {PRESETS.map((p, i) => (
            <option key={p.name} value={i}>{p.name}</option>
          ))}
        </select>
      </label>

      <div className="field">
        <label htmlFor="team-code">Team code</label>
        <div className="code-row">
          <input id="team-code" className="code" readOnly value={code} onFocus={(e) => e.target.select()} />
          <button className="btn" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
      </div>

      <form className="field" onSubmit={importCode}>
        <label htmlFor="import-code">Paste a friend’s code</label>
        <div className="code-row">
          <input
            id="import-code"
            className="code"
            placeholder="nte1~Team~…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn" type="submit" disabled={!input.trim()}>Add team</button>
        </div>
        {error && <p className="field__error">{error}</p>}
      </form>
    </section>
  );
}
