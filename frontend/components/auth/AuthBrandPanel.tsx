interface AuthBrandPanelProps {
  badge?: string;
  title: React.ReactNode;
  subtitle: string;
}

export default function AuthBrandPanel({
  badge = "AI-POWERED SCHEDULING",
  title,
  subtitle,
}: AuthBrandPanelProps) {
  return (
    <div className="hidden lg:flex w-[55%] flex-col justify-center items-center px-10 xl:px-16 py-24 relative overflow-hidden bg-surface">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-fixed-dim rounded-full blur-[120px] opacity-25 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-tertiary-fixed rounded-full blur-[100px] opacity-30 pointer-events-none" />

      {/* Brand Content */}
      <div className="max-w-[560px] z-10 mb-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-primary text-label-caps font-label-caps mb-6">
          <span className="material-symbols-outlined text-[16px]">
            auto_awesome
          </span>
          {badge}
        </div>
        <h1 className="text-4xl xl:text-5xl font-bold text-on-surface mb-4 leading-tight tracking-tight">
          {title}
        </h1>
        <p className="text-base text-secondary max-w-[420px] leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Dashboard Preview Card */}
      <DashboardPreview />
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="glass-panel rounded-2xl p-6 relative z-10 max-w-[550px] transform hover:-translate-y-1 transition-transform duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-outline-variant/30">
        <div>
          <h3 className="text-base font-semibold text-on-surface">
            ตารางงานวันนี้
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            xxx, xx xxxx
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
            Energy Level
          </span>
          <div className="flex gap-1 mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary-fixed" />
          </div>
        </div>
      </div>

      {/* Timeline Items */}
      <div className="space-y-3 ">
        <TimelineItem
          time="09:00 - 11:30"
          tag="Deep Work"
          tagStyle="bg-primary-fixed text-primary"
          title="วางแผนกลยุทธ์ไตรมาส 4"
          description="วิเคราะห์ข้อมูลและกำหนดทิศทาง..."
          icon="neurology"
          iconBg="bg-primary-container text-on-primary"
        />
        <TimelineItem
          time="13:30 - 15:00"
          tag="Meeting"
          tagStyle="bg-secondary-fixed text-on-surface-variant"
          title="Sync ทีมประจำสัปดาห์"
          icon="groups"
          iconBg="bg-secondary-container text-on-surface-variant"
        />
      </div>

      {/* Floating Metric */}
      <div className="absolute -right-4 -bottom-4 bg-surface-container-lowest p-3 rounded-xl shadow-lg border border-outline-variant/20 flex items-center gap-3 animate-bounce" style={{ animationDuration: "3s" }}>
        <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary text-[20px]">
            trending_up
          </span>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">
            Productivity
          </div>
          <div className="text-lg font-bold text-primary">+24%</div>
        </div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  time: string;
  tag: string;
  tagStyle: string;
  title: string;
  description?: string;
  icon: string;
  iconBg: string;
}

function TimelineItem({
  time,
  tag,
  tagStyle,
  title,
  description,
  icon,
  iconBg,
}: TimelineItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/15 hover:border-outline-variant/30 transition-colors">
      <div
        className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
      >
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            {time}
          </span>
          <span
            className={`${tagStyle} text-[10px] px-2 py-0.5 rounded font-medium`}
          >
            {tag}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-on-surface">{title}</h4>
        {description && (
          <p className="text-xs text-secondary mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
