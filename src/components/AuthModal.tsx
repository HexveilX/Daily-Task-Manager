import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, LogIn, UserPlus } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: {username: string, email: string}) => void;
  onSignUp: (email: string, password: string, username: string) => Promise<{success: boolean, error?: string}>;
  onSignIn: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
}

const AuthModal = ({ isOpen, onClose, onLogin, onSignUp, onSignIn }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (!isLogin && !formData.username.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await onSignIn(formData.email.trim(), formData.password);
      } else {
        result = await onSignUp(formData.email.trim(), formData.password, formData.username.trim());
      }

      if (result.success) {
        setFormData({ username: '', email: '', password: '' });
        onLogin({ username: formData.username || 'User', email: formData.email });
      } else {
        setError(result.error || 'حدث خطأ غير متوقع');
      }
    } catch (error: any) {
      setError(error.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '' });
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl mx-4">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
            {isLogin ? 'سجل دخولك لإدارة مهامك' : 'أنشئ حساباً جديداً للبدء'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="username" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  اسم المستخدم *
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="أدخل اسم المستخدم..."
                    className="pr-10 py-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                البريد الإلكتروني *
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="أدخل البريد الإلكتروني..."
                  className="pr-10 py-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                كلمة المرور *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="أدخل كلمة المرور..."
                className="py-3 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.email.trim() || !formData.password.trim() || (!isLogin && !formData.username.trim())}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...'}
                  </div>
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        تسجيل الدخول
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        إنشاء حساب
                      </>
                    )}
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={loading}
                className="w-full py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                إلغاء
              </Button>
            </div>
          </form>

          <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium text-sm sm:text-base disabled:opacity-50"
            >
              {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب؟ سجل دخولك'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;