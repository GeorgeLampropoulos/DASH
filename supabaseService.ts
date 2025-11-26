import { createClient } from '@supabase/supabase-js';
import { Project, ServiceType, ProjectStatus } from '@/types';

// Safely access environment variables
const getEnvVar = (key: string, defaultValue: string) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {
    console.warn(`Failed to read env var ${key}`, e);
  }
  return defaultValue;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://qqulbbujtwcvfhfnnkaj.supabase.co');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdWxiYnVqdHdjdmZoZm5ua2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODU2MDQsImV4cCI6MjA3OTE2MTYwNH0.DtaygmqJktcJUyUZJ7bumpiUum7n6soKn92CUSVC1ZI');

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface FetchResult {
  data: Project[];
  error?: string;
  details?: string[];
}

// --- Auth Functions ---

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// --- Data Functions ---

export const addProject = async (project: Omit<Project, 'id'>): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) return { success: false, error: "Supabase not initialized" };

  // Map the frontend Project object back to the database columns
  const dbRow = {
    customer_name: project.clientName,
    service_name: project.serviceType,
    SERVICE_PRICE: project.value, 
    email: project.email,
    phone_number: project.phone,
    status: project.status,
    created_at: new Date().toISOString(),
    description: project.notes
  };

  const { error } = await supabase.from('projects').insert([dbRow]);

  if (error) {
    console.error("Error adding project:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) return { success: false, error: "Supabase not initialized" };

  const dbUpdates: any = {};
  if (updates.clientName) dbUpdates.customer_name = updates.clientName;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.value !== undefined) dbUpdates.SERVICE_PRICE = updates.value;
  if (updates.notes) dbUpdates.description = updates.notes;
  
  if (Object.keys(dbUpdates).length === 0) return { success: true };

  const { error } = await supabase
    .from('projects')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error("Error updating project:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const fetchProjects = async (): Promise<FetchResult> => {
  if (!supabase) {
    return { data: [], error: "Supabase client not initialized." };
  }
  
  const log: string[] = [];
  
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    log.push(`Authenticated as: ${session.user.email} (Role: ${session.user.role})`);
  } else {
    log.push("Fetching as Anonymous (Not logged in)");
  }

  log.push("Attempting to fetch data...");

  // Helper to map any row to Project
  const mapDataToProject = (data: any[]): Project[] => {
    return data.map((item: any) => {
      let service: ServiceType = 'Ad Campaign';
      const rawService = (item.service_name || item.service_type || item.booked_by || item.SERVICE || '').toLowerCase();
      
      if (rawService.includes('web')) service = 'Web Development';
      else if (rawService.includes('ai') || rawService.includes('bot')) service = 'AI Solutions';
      else if (rawService.includes('ad') || rawService.includes('marketing')) service = 'Ad Campaign';
      else service = 'Web Development'; 

      let status: ProjectStatus = 'Active';
      const rawStatus = (item.status || item.state || 'active').toLowerCase();
      
      if (['active', 'confirmed', 'in progress', 'ongoing', 'pending'].includes(rawStatus)) status = 'Active';
      else if (['lead', 'prospect', 'new'].includes(rawStatus)) status = 'Lead';
      else if (['completed', 'delivered', 'done', 'finished'].includes(rawStatus)) status = 'Completed';
      else if (['cancelled', 'archived', 'dropped'].includes(rawStatus)) status = 'Cancelled';
      
      return {
        id: item.id ? item.id.toString() : Math.random().toString(),
        clientName: item.customer_name || item.client_name || 'Unknown Client',
        email: item.email || '',
        phone: item.phone_number || '',
        deadline: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        value: Number(item.SERVICE_PRICE) || Number(item.value) || 0,
        status: status,
        notes: item.description || '',
        serviceType: service,
        rating: item.rating
      } as Project;
    });
  };

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    log.push(`Error: ${error.message}`);
    console.error("Supabase Fetch Error:", error);
    return { data: [], error: error.message, details: log };
  }

  if (!data || data.length === 0) {
    log.push("Success: No data found in table.");
    return { data: [], error: "No data found", details: log };
  }

  log.push(`Success: Fetched ${data.length} rows.`);
  const projects = mapDataToProject(data);
  return { data: projects, details: log };
};