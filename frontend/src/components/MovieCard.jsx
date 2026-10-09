export default function MovieCard({ movie, isSaved, onSave, onRemove }) {
  const poster = movie.poster || "https://placehold.co/300x450/18181b/f5f5f5?text=Movie";
  const rating = movie.rating ? Number(movie.rating).toFixed(1) : "NR";

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-orange-500/50">
      <div className="relative">
        <img src={poster} alt={movie.title} className="aspect-[2/3] w-full object-cover" />
        {movie.rating ? (
          <span className="absolute right-3 top-3 rounded-full bg-zinc-950/80 px-2 py-1 text-[11px] font-medium text-orange-400">
            ★ {rating}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="truncate text-base font-semibold text-white">{movie.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{movie.year || "N/A"}</p>
        </div>

        {isSaved ? (
          <button
            type="button"
            onClick={() => onRemove(movie.id)}
            className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSave(movie)}
            className="w-full rounded-lg border border-orange-500/50 bg-orange-500/10 px-3 py-2.5 text-sm font-medium text-orange-300 transition hover:bg-orange-500/20"
          >
            + Save Movie
          </button>
        )}
      </div>
    </article>
  );
}
