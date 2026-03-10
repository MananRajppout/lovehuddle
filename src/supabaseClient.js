import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fvkbtvzqvqayzncibjic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a2J0dnpxdnFheXpuY2liamljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjI3MDQsImV4cCI6MjA4ODY5ODcwNH0.gdx_nDwowR6Q3tJvYb8vFuImH3ifjiOV0B8JnV7SRlQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
