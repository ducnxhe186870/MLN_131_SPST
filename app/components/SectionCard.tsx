interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ title, children, className = '' }: SectionCardProps) {
  return (
    <div className={`bg-white border border-[#E5E5E5] rounded-lg p-6 mb-6 ${className}`}>
      <h2 className="text-xl font-semibold text-[#1C1C1C] mb-4">
        {title}
      </h2>
      <div className="text-[#1C1C1C] leading-relaxed">
        {children}
      </div>
    </div>
  );
}
