import { useEffect, useState } from "react";

interface Props {
  onSearch: (name: string) => void;
  loading: boolean;
  initial?: string;
}

export function SearchBar({ onSearch, loading, initial = "" }: Props) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = value.trim();
        if (name) onSearch(name);
      }}
      className="flex gap-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ENTER A CRITICAL OPS USERNAME…"
        className="flex-1 border border-line bg-panel-2 px-4 py-3 uppercase tracking-wider outline-none placeholder:text-muted focus:border-accent"
      />
      <button
        type="submit"
        disabled={loading}
        className="clip-corner bg-accent px-6 py-3 font-semibold uppercase tracking-wider text-black transition hover:bg-accent-soft disabled:opacity-50"
      >
        {loading ? "…" : "Search"}
      </button>
    </form>
  );
}
