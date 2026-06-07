interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold text-[#1C1C1C] mb-4 leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-[#585858] text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
