import React from 'react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { AdminTabs } from './AdminTabs';

interface AdminHeaderProps {
  section: string;
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  aside?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ section, title, description, icon, aside }) => (
  <>
    <Breadcrumbs items={[{ label: 'Administración', to: '/admin/overview' }, { label: section }]} />
    <div className="eq-stars relative mb-5 flex items-center justify-between gap-4 overflow-hidden rounded-3xl bg-[#24204f] p-6 text-white">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lumi">{icon}</span>
        <div className="min-w-0">
          <h1 className="text-2xl text-white">{title}</h1>
          <p className="mt-1 text-sm text-white/70">{description}</p>
        </div>
      </div>
      {aside && <div className="hidden shrink-0 sm:block">{aside}</div>}
    </div>
    <AdminTabs />
  </>
);
