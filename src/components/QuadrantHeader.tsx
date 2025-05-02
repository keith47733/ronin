interface QuadrantHeaderProps {
  title: string;
  subtitle: string;
}

export function QuadrantHeader({ title, subtitle }: QuadrantHeaderProps) {
  return (
    <div className="p-2 border-b border-gray-200 text-center">
      <h2 className="text-2xl title">{title}</h2>
      <p className="text-base text-gray-600 subtitle">{subtitle}</p>
    </div>
  );
}
