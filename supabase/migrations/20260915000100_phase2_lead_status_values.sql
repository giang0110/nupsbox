-- Phase 2 CRM operational status vocabulary.
-- Keep legacy enum labels for migration compatibility; later constraints stop new operational use.

alter type public.lead_status add value if not exists 'qualified' after 'contacted';
alter type public.lead_status add value if not exists 'viewing' after 'qualified';
alter type public.lead_status add value if not exists 'negotiating' after 'viewing';
