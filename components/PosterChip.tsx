export function PosterChip({
  category,
  onClick,
  enabled,
}: {
  category: string;
  onClick: (category: string) => void;
  enabled: boolean;
}) {
  return (
    <span
      key={category}
      className={`bg-gray-200 text-gray-800 px-2 py-1 rounded-md m-1 hover:cursor-pointer ${
        enabled ? "bg-yellow-500 text-white" : ""
      } transition-colors duration-150`}
      onClick={() => onClick(category)}
    >
      {category}
    </span>
  );
}
