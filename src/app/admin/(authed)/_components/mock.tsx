export function PlaceholderView({
  title,
  breadcrumb,
  desc,
}: {
  title: string;
  breadcrumb: string;
  desc: string;
}) {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            {breadcrumb}
            <span className="sep">/</span>
            {title.toUpperCase()}
          </div>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
      </div>
      <div className="adm-card adm-placeholder">
        <div className="inner">
          <div className="glyph">◇</div>
          <h3>{title} workspace</h3>
          <p>{desc}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-sm btn-ghost-light">Documentation</button>
            <button type="button" className="btn btn-sm btn-primary">Configure</button>
          </div>
        </div>
      </div>
    </>
  );
}
