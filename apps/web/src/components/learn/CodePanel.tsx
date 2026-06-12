export default function CodePanel({ code, activeLine }: { code: string[]; activeLine: number }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-stone-900 p-3 text-[13px] leading-6 text-stone-100">
      {code.map((line, index) => (
        <div
          key={index}
          className={`flex gap-3 rounded px-2 ${index === activeLine ? "bg-emerald-600/40" : ""}`}
        >
          <span className="w-5 select-none text-right text-stone-500">{index + 1}</span>
          <code className="whitespace-pre">{line || " "}</code>
        </div>
      ))}
    </pre>
  );
}
