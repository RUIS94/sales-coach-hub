interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  inlineChildren?: boolean;
}

export function PageHeader({ title, subtitle, children, inlineChildren = false }: PageHeaderProps) {
  return (
    <div className={`flex items-center ${inlineChildren ? 'justify-start gap-3' : 'justify-between'} py-4 px-6 min-h-[64px]`}>
      {inlineChildren ? (
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </>
      )}
    </div>
  );
}
