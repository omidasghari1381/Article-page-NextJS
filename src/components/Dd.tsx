const navLink =
  "flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition text-black";

function DD({
  className = "",
  childClassName = "",
  titleClassName = "",
  title,
  children,
}: {
  className?: string;
  childClassName?: string;
  titleClassName?: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details className={`relative group ${className}`}>
      <summery className={`${titleClassName}`}>
        <span>{title}</span>
        <span className="text-xs opacity-60 pr-1">▾</span>
      </summery>
      <div
        className=""
      >
        <div className={`${childClassName}`}>{children}</div>
      </div>
    </details>
  );
}

export default DD;
