import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://maaelpafssatryhxrqxo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYWVscGFmc3NhdHJ5aHhycXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTg4MjIsImV4cCI6MjA3NjAzNDgyMn0.Uk1KRtZHnabl0xYA4Z8-zZRrtFbYTy5meOJPwmQoWEw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

