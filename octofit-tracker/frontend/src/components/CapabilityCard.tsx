type Props = {
  title: string;
  description: string;
  loading?: boolean;
  emptyMessage?: string;
  error?: string;
};

export function CapabilityCard({ title, description, loading, emptyMessage, error }: Props) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {loading && <p role="status">Loading {title.toLowerCase()}...</p>}
        {error && <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>}
        {!loading && !error && emptyMessage && <p>{emptyMessage}</p>}
      </div>
    </section>
  );
}
