
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kfpwcukrliirrgsmuunh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcHdjdWtybGlpcnJnc211dW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjk4NjMsImV4cCI6MjA4Mzk0NTg2M30.5471Lw5ujzSSyEQB35YacrdvQYHxLBJURROEeTR2Ws8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
