import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskPriority } from '@/types/Task';
import { toast } from '@/components/ui/sonner';

interface User {
  id: string;
  username: string;
  email: string;
}

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email || '');
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (profile) {
        setUser({
          id: profile.id,
          username: profile.username || profile.full_name || 'User',
          email: profile.email || email
        });
      } else {
        // Profile doesn't exist, create one
        const username = email.split('@')[0];
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username,
            full_name: username,
            email,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else if (newProfile) {
          setUser({
            id: newProfile.id,
            username: newProfile.username || username,
            email: newProfile.email || email
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        toast.error('التطبيق غير مكون بشكل صحيح. يرجى إعداد متغيرات البيئة.');
        return { success: false, error: 'التطبيق غير مكون بشكل صحيح' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: username
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success('تم إنشاء الحساب بنجاح!');
        return { success: true };
      }

      return { success: false, error: 'فشل في إنشاء الحساب' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message === 'User already registered' 
        ? 'هذا البريد الإلكتروني مسجل بالفعل'
        : error.message;
      toast.error('فشل في إنشاء الحساب: ' + errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL) {
        toast.error('التطبيق غير مكون بشكل صحيح. يرجى إعداد متغيرات البيئة.');
        return { success: false, error: 'التطبيق غير مكون بشكل صحيح' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        toast.success('تم تسجيل الدخول بنجاح!');
        return { success: true };
      }

      return { success: false, error: 'فشل في تسجيل الدخول' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message === 'Invalid login credentials'
        ? 'بيانات الدخول غير صحيحة'
        : error.message;
      toast.error('فشل في تسجيل الدخول: ' + errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('فشل في تسجيل الخروج');
    }
  };

  const loadTasks = async (): Promise<Task[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as TaskPriority,
        dueDate: task.deadline || undefined,
        completed: task.completed || false,
        createdAt: task.created_at
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('فشل في تحميل المهام');
      return [];
    }
  };

  const saveTask = async (task: Omit<Task, 'id' | 'createdAt'> & { id?: string }) => {
    if (!user) return null;

    try {
      const taskData = {
        title: task.title,
        description: task.description || null,
        priority: task.priority,
        deadline: task.dueDate || null,
        completed: task.completed,
        category: 'general', // Default category
        user_id: user.id
      };

      if (task.id) {
        // Update existing task
        const { data, error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', task.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('فشل في حفظ المهمة');
      return null;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('فشل في حذف المهمة');
      return false;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return null;

    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.dueDate !== undefined) updateData.deadline = updates.dueDate || null;
      if (updates.completed !== undefined) updateData.completed = updates.completed;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('فشل في تحديث المهمة');
      return null;
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    loadTasks,
    saveTask,
    deleteTask,
    updateTask
  };
};