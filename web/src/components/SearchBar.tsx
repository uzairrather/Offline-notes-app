
export default function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      placeholder="Search notes..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search notes"
      className="w-full rounded-lg bg-blue-200 border border-red-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  );
}
