export default function SiteFooter({ onReset }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__row">
        <div>
          <p className="site-footer__title">Job Desk · Stage 1 (sample data)</p>
          <p>
            Job Desk never submits applications or contacts employers. Use “Open job” to apply on the employer’s own
            site. Saved jobs, statuses and drafts are stored only in this browser.
          </p>
        </div>
        <button type="button" className="link-btn" onClick={onReset}>Clear data stored in this browser</button>
      </div>
    </footer>
  );
}
