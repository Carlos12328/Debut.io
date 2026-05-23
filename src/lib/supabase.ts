import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bdfpjwdgrkhdkvnlssja.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZnBqd2RncmtoZGt2bmxzc2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODI1NTksImV4cCI6MjA5NTA1ODU1OX0.QG9yJFSIgv8Ht1xrqC10zHr2WFewHUm5eAzUT8s3G2Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);