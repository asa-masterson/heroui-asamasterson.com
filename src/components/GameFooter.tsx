const css = `
  .gf-footer { width:100%; margin-top:auto; border-top:1px solid rgba(255,84,255,.12); padding:1rem 1.5rem; display:flex; gap:2rem; flex-wrap:wrap; justify-content:center; align-items:center; }
  .gf-link   { font-family:'DM Mono',monospace; font-size:.65rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,84,255,.6); text-decoration:none; padding:.25rem 0; transition:color .15s; }
  .gf-link:hover { color:#ff54ff; }
`;

export default function GameFooter() {
  return (
    <>
      <style>{css}</style>
      <footer className="gf-footer">
        <a className="gf-link" href="/">← Home</a>
        <a className="gf-link" href="/projects/">Projects & Games</a>
        <a className="gf-link" href="/about/">About</a>
      </footer>
    </>
  );
}
