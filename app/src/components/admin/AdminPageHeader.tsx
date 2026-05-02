/**
 * AdminPageHeader — consistent page title + primary action button.
 */

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

export default function AdminPageHeader({
  title,
  subtitle,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-[28px] font-medium text-[#333333]">{title}</h2>
        {subtitle && <p className="text-base text-[#666666] mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#E53935] hover:bg-[#C62828] text-white font-medium text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:scale-[1.02] shrink-0"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}
