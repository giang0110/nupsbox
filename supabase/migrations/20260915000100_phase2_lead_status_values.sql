alter type public.lead_status
  add value if not exists 'qualified' after 'contacted';

alter type public.lead_status
  add value if not exists 'viewing' after 'qualified';

alter type public.lead_status
  add value if not exists 'negotiating' after 'viewing';
